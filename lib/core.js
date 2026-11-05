'use strict';
/*
 * Núcleo da API do MD Bot (independente de hospedagem).
 * Recebe um pedido normalizado R = {method, path, headers, host, ip, https, readBody(max)}
 * e devolve {status, headers, body}. Os "adaptadores" (server.js e netlify/functions/api.mjs) só traduzem.
 */
const crypto = require('crypto');

function createCore(opts) {
  const E = opts.env, db = opts.db, canUpload = !!opts.canUpload, onSettings = opts.onSettings || (() => {});
  const ADMIN_EMAIL = String(E.ADMIN_USER || '').trim().toLowerCase();
  const SESSION_MS = (+E.SESSION_HOURS || 8) * 3600e3;
  const SECRET = E.SESSION_SECRET && E.SESSION_SECRET.length >= 32 ? E.SESSION_SECRET
    : (console.warn('[aviso] Defina SESSION_SECRET (32+ caracteres). Sem isso, o login expira com frequência.'), crypto.randomBytes(32).toString('hex'));
  const POSES = ['wave', 'cheer', 'lol', 'point', 'love', 'angry', 'scared', 'think', 'sleep', 'coin', 'ban', 'stand'];
  const TYPES = ['novidade', 'aviso', 'lancamento', 'evento'];
  const DEFAULT_SET = {
    discordUrl: 'https://discord.gg/uVqPhs3xzq', inviteUrl: '',
    devBanner: { enabled: true, text: 'O MD Bot ainda não está disponível ao público. Este site é uma prévia do projeto.' },
    video: { enabled: true, src: '/video/intro.mp4', once: true },
    newsEnabled: true, maintenance: { enabled: false, message: 'Estamos fazendo melhorias. Voltamos já!' }
  };
  const CSP = "default-src 'self'; img-src 'self' data:; media-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; script-src 'self'; connect-src 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; base-uri 'self'";

  // ---------- utilitários ----------
  const hm = s => crypto.createHmac('sha256', SECRET).update(String(s)).digest();
  const safeEq = (a, b) => crypto.timingSafeEqual(hm(a), hm(b));
  const rnd = n => crypto.randomBytes(n).toString('hex');
  const sha = s => crypto.createHash('sha256').update(s).digest('hex');
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const clean = (s, max) => String(s == null ? '' : s).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, ' ').trim().slice(0, max);
  const csvCell = v => { v = String(v == null ? '' : v); if (/^[=+\-@\t\r]/.test(v)) v = "'" + v; return '"' + v.replace(/"/g, '""') + '"'; };
  const okUrl = (u, hosts) => { try { const x = new URL(u); return x.protocol === 'https:' && u.length <= 300 && (!hosts || hosts.includes(x.hostname)); } catch (e) { return false; } };
  const cookiesOf = R => Object.fromEntries((R.headers.cookie || '').split(';').map(c => c.trim().split('=')).filter(c => c[0]).map(c => [c[0], c.slice(1).join('=')]));
  const wlKey = email => 'wl/' + sha(email).slice(0, 24);

  function secHeaders(https) {
    const h = {
      'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY', 'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy': CSP, 'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
      'Cross-Origin-Opener-Policy': 'same-origin', 'Cross-Origin-Resource-Policy': 'same-origin', 'X-Permitted-Cross-Domain-Policies': 'none'
    };
    if (https) h['Strict-Transport-Security'] = 'max-age=63072000; includeSubDomains; preload';
    return h;
  }
  const J = (R, status, obj, extra) => ({ status, headers: Object.assign({ 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }, secHeaders(R.https), extra), body: JSON.stringify(obj) });
  const F = (R, status, body, type, extra) => ({ status, headers: Object.assign({ 'Content-Type': type, 'Cache-Control': 'no-store' }, secHeaders(R.https), extra), body });

  // ---------- dados ----------
  const getSet = async () => Object.assign({}, DEFAULT_SET, await db.get('settings', {}));
  const getAdm = async () => await db.get('admin', { hash: '', sv: 1 });
  async function allWL() {
    const ks = await db.list('wl/'), out = [];
    for (let i = 0; i < ks.length; i += 25) out.push(...await Promise.all(ks.slice(i, i + 25).map(k => db.get(k, null))));
    return out.filter(Boolean).sort((a, b) => a.data < b.data ? 1 : -1);
  }

  // ---------- log de segurança ----------
  async function ev(tipo, R, det) {
    const o = { t: new Date().toISOString(), tipo, ip: R ? R.ip : '-', det: det || '' };
    try {
      await db.set('log/' + o.t + '-' + rnd(3), o);
      if (/^(login_falha|bloqueio)/.test(tipo)) console.warn('[seguranca]', tipo, o.ip);
      if (Math.random() < 0.05) { const ks = await db.list('log/'); for (const k of ks.slice(0, Math.max(0, ks.length - 300))) await db.del(k); }
    } catch (e) { console.error('log:', e.message); }
  }

  // ---------- limitador (persistente conforme o armazenamento) ----------
  const over = async (k, max) => { const b = await db.rlGet(k); return b && b.r > Date.now() && b.c >= max ? Math.ceil((b.r - Date.now()) / 1000) : 0; };
  const bump = (k, win) => db.rlBump(k, win);
  const usedPow = new Map();

  // ---------- autenticação ----------
  const hashes = async () => { const a = await getAdm(); return a.hash && E.RESET_ADMIN_PASSWORD !== '1' ? [a.hash] : String(E.ADMIN_PASSWORD_HASH || '').split(',').map(s => s.trim()).filter(Boolean); };
  const hashPw = p => { const s = crypto.randomBytes(16); return 'scrypt$' + s.toString('hex') + '$' + crypto.scryptSync(p, s, 64).toString('hex'); };
  async function adminOn() { return !!ADMIN_EMAIL && ((await hashes()).length > 0 || !!E.ADMIN_PASSWORD); }
  async function passOk(p) {
    const H = await hashes(); let ok = false;
    for (const h of H) {
      const [t, salt, x] = h.split('$'); if (t !== 'scrypt' || !salt || !x) continue;
      const d = crypto.scryptSync(String(p), Buffer.from(salt, 'hex'), 64), e = Buffer.from(x, 'hex');
      if (e.length === 64 && crypto.timingSafeEqual(d, e)) ok = true;
    }
    if (!H.length && E.ADMIN_PASSWORD) ok = safeEq(p, E.ADMIN_PASSWORD);
    return ok;
  }
  const TOTP = (E.ADMIN_TOTP_SECRET || '').replace(/\s/g, '').toUpperCase();
  function b32(s) { const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'; let bits = ''; const out = []; for (const c of s) { const v = A.indexOf(c); if (v >= 0) bits += v.toString(2).padStart(5, '0'); } for (let i = 0; i + 8 <= bits.length; i += 8) out.push(parseInt(bits.slice(i, i + 8), 2)); return Buffer.from(out); }
  function totpAt(c) { const b = Buffer.alloc(8); b.writeBigUInt64BE(BigInt(c)); const h = crypto.createHmac('sha1', b32(TOTP)).update(b).digest(), o = h[19] & 15; return String((h.readUInt32BE(o) & 0x7fffffff) % 1e6).padStart(6, '0'); }
  function totpOk(code) { if (!TOTP) return true; const c = Math.floor(Date.now() / 30000); code = String(code || '').replace(/\s/g, ''); return [-1, 0, 1].map(d => safeEq(totpAt(c + d), code)).some(Boolean); }

  const uaH = R => sha(R.headers['user-agent'] || '').slice(0, 16);
  const sign = o => { const b = Buffer.from(JSON.stringify(o)).toString('base64url'); return b + '.' + hm(b).toString('base64url'); };
  function verify(t) {
    if (!t) return null; const [b, s] = t.split('.'); if (!b || !s) return null;
    const e = hm(b).toString('base64url'); if (s.length !== e.length || !crypto.timingSafeEqual(Buffer.from(s), Buffer.from(e))) return null;
    try { const o = JSON.parse(Buffer.from(b, 'base64url')); return o.exp > Date.now() ? o : null; } catch (e2) { return null; }
  }
  const cookieName = R => R.https ? '__Host-mdsess' : 'mdsess';
  const setCookie = (R, tok, age) => `${cookieName(R)}=${tok}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${age}${R.https ? '; Secure' : ''}`;
  async function session(R) {
    const c = cookiesOf(R), s = verify(c['__Host-mdsess'] || c.mdsess); if (!s) return null;
    const a = await getAdm(); return s.v === a.sv && s.u === uaH(R) ? s : null;
  }
  function sameOrigin(R) {
    const o = R.headers.origin;
    if (o) { try { return new URL(o).host === R.host; } catch (e) { return false; } }
    const sf = R.headers['sec-fetch-site']; return !sf || sf === 'same-origin' || sf === 'none';
  }
  async function body(R, max) {
    if (!/^application\/json/i.test(R.headers['content-type'] || '')) throw Object.assign(new Error('tipo'), { code: 415 });
    const buf = await R.readBody(max || 10240);
    try { const o = JSON.parse(buf.toString() || '{}'); return o && typeof o === 'object' ? o : {}; } catch (e) { throw Object.assign(new Error('json'), { code: 400 }); }
  }
  /* para o adaptador de upload: confirma sessão + CSRF + origem */
  async function checkAdmin(R) {
    if (!(await adminOn())) return { res: J(R, 503, { ok: false, error: 'Painel não configurado.' }) };
    if (!sameOrigin(R)) return { res: J(R, 403, { ok: false, error: 'Origem não permitida.' }) };
    const s = await session(R); if (!s) return { res: J(R, 401, { ok: false, error: 'Não autenticado.' }) };
    if (R.headers['x-csrf-token'] !== s.c) { await ev('csrf_invalido', R, 'upload'); return { res: J(R, 403, { ok: false, error: 'Token inválido.' }) }; }
    return { sess: s };
  }

  // ---------- validação ----------
  function cleanNews(b, old) {
    const n = { id: old ? old.id : rnd(6), title: clean(b.title, 80), text: clean(b.text, 800), type: TYPES.includes(b.type) ? b.type : 'novidade', img: POSES.includes(b.img) ? b.img : 'wave', btnLabel: clean(b.btnLabel, 30), btnUrl: clean(b.btnUrl, 300), published: b.published === true, pinned: b.pinned === true, created: old ? old.created : new Date().toISOString(), updated: new Date().toISOString() };
    if (!n.title || !n.text) return null; if (n.btnUrl && (!okUrl(n.btnUrl) || !n.btnLabel)) return null; if (!n.btnUrl) n.btnLabel = '';
    return n;
  }
  function cleanSettings(b) {
    const o = {}; o.discordUrl = clean(b.discordUrl, 300);
    if (!okUrl(o.discordUrl, ['discord.gg', 'discord.com', 'www.discord.com', 'discordapp.com'])) return null;
    o.inviteUrl = clean(b.inviteUrl, 300); if (o.inviteUrl && !okUrl(o.inviteUrl)) return null;
    o.devBanner = { enabled: !!(b.devBanner && b.devBanner.enabled), text: clean(b.devBanner && b.devBanner.text, 200) };
    const v = b.video || {}, src = clean(v.src, 120);
    if (src && !/^\/(video|media)\/[A-Za-z0-9._-]+\.(mp4|webm)$/.test(src)) return null;
    o.video = { enabled: !!v.enabled, src, once: v.once !== false }; o.newsEnabled = !!b.newsEnabled;
    o.maintenance = { enabled: !!(b.maintenance && b.maintenance.enabled), message: clean(b.maintenance && b.maintenance.message, 200) };
    return o;
  }
  const publicNews = items => items.filter(n => n.published).sort((a, b) => (b.pinned - a.pinned) || (b.created > a.created ? 1 : -1)).slice(0, 8).map(n => ({ id: n.id, title: n.title, text: n.text, type: n.type, img: n.img, btnLabel: n.btnLabel, btnUrl: n.btnUrl, date: n.created }));
  const CDN = { 'Cache-Control': 'public, max-age=0, s-maxage=30, stale-while-revalidate=60' };

  // ---------- roteador ----------
  async function handle(R) {
    const u = R.path, m = R.method;
    try {
      if (m === 'OPTIONS') return { status: 204, headers: secHeaders(R.https), body: null };
      if (u === '/api/health') return J(R, 200, { ok: true, storage: db.kind });
      if (u === '/api/config' && m === 'GET') { const s = await getSet(); return J(R, 200, { discordUrl: s.discordUrl, inviteUrl: s.inviteUrl, devBanner: s.devBanner, video: s.video, newsEnabled: s.newsEnabled, maintenance: s.maintenance }, CDN); }
      if (u === '/api/news' && m === 'GET') { const s = await getSet(); return J(R, 200, { items: s.newsEnabled ? publicNews(await db.get('news', [])) : [] }, CDN); }
      if (u === '/api/pow' && m === 'GET') { const salt = rnd(8), ts = Date.now(); return J(R, 200, { salt, ts, sig: hm(salt + ts).toString('hex'), bits: 4 }); }
      if (m !== 'GET' && !sameOrigin(R)) { await ev('origem_bloqueada', R, u); return J(R, 403, { ok: false, error: 'Origem não permitida.' }); }

      // ---- inscrição pública ----
      if (u === '/api/waitlist' && m === 'POST') {
        if (await over('wl:' + R.ip, 8)) return J(R, 429, { ok: false, error: 'Muitas tentativas. Tente novamente mais tarde.' });
        await bump('wl:' + R.ip, 3600e3);
        const b = await body(R);
        if (b.website) { await ev('honeypot', R); return J(R, 200, { ok: true }); }
        const p = b.pow || {};
        const powOk = p.sig && p.salt && Date.now() - p.ts < 900e3 && !usedPow.has(p.salt) && safeEq(hm(p.salt + p.ts).toString('hex'), p.sig) && sha(String(p.salt) + p.ts + String(p.nonce)).startsWith('0000');
        if (!powOk) return J(R, 400, { ok: false, error: 'Verificação anti-robô falhou. Recarregue a página.' });
        usedPow.set(p.salt, 1); if (usedPow.size > 5000) usedPow.clear();
        const nome = clean(b.nome, 80), email = clean(b.email, 120).toLowerCase();
        if (nome.length < 2 || !/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email) || b.consentimento !== true) return J(R, 400, { ok: false, error: 'Dados inválidos.' });
        const k = wlKey(email); if (await db.get(k, null)) return J(R, 200, { ok: true, duplicado: true });
        await db.set(k, { nome, email, servidor: clean(b.servidor, 80), discord: clean(b.discord, 40), consentimento: true, data: new Date().toISOString() });
        return J(R, 200, { ok: true });
      }

      // ---- painel administrativo ----
      if (u.startsWith('/api/admin/')) {
        if (!(await adminOn())) return J(R, 503, { ok: false, error: 'Painel não configurado (defina ADMIN_USER e ADMIN_PASSWORD_HASH).' });
        const sess = await session(R);
        if (u === '/api/admin/me') return J(R, 200, { auth: !!sess, csrf: sess ? sess.c : null, need2fa: !!TOTP });

        if (u === '/api/admin/login' && m === 'POST') {
          const w1 = await over('lg:' + R.ip, 5), w2 = await over('acct', 20);
          if (w1 || w2) { await ev('bloqueio', R, 'login'); return J(R, 429, { ok: false, error: 'Muitas tentativas. Aguarde alguns minutos.' }, { 'Retry-After': String(w1 || w2) }); }
          const b = await body(R, 2048);
          const a = safeEq(clean(b.user, 120).toLowerCase(), ADMIN_EMAIL), p = await passOk(String(b.password || '').slice(0, 200)), t = totpOk(b.code);
          if (!(a && p && t)) { await bump('lg:' + R.ip, 15 * 60e3); await bump('acct', 15 * 60e3); await ev('login_falha', R, a ? 'senha/2fa' : 'usuario'); await sleep(700 + Math.random() * 400); return J(R, 401, { ok: false, error: 'Credenciais incorretas.' }); }
          await db.rlDel('lg:' + R.ip); await ev('login_ok', R);
          const csrf = rnd(16), adm = await getAdm(), tok = sign({ exp: Date.now() + SESSION_MS, c: csrf, v: adm.sv, u: uaH(R) });
          return J(R, 200, { ok: true, csrf }, { 'Set-Cookie': setCookie(R, tok, SESSION_MS / 1000) });
        }
        if (!sess) return J(R, 401, { ok: false, error: 'Não autenticado.' });
        if (await over('adm:' + R.ip, 240)) return J(R, 429, { ok: false, error: 'Muitas requisições.' });
        await bump('adm:' + R.ip, 60e3);

        if (m === 'GET') {
          if (u === '/api/admin/list') return J(R, 200, { ok: true, csrf: sess.c, items: await allWL() });
          if (u === '/api/admin/news') return J(R, 200, { ok: true, items: (await db.get('news', [])).sort((a, b) => b.created > a.created ? 1 : -1) });
          if (u === '/api/admin/settings') return J(R, 200, { ok: true, settings: await getSet(), totp: !!TOTP, canUpload, storage: db.kind });
          if (u === '/api/admin/security-log') { const ks = (await db.list('log/')).slice(-100).reverse(); return J(R, 200, { ok: true, items: (await Promise.all(ks.map(k => db.get(k, null)))).filter(Boolean) }); }
          if (u === '/api/admin/backup') return F(R, 200, JSON.stringify({ exportadoEm: new Date().toISOString(), inscritos: await allWL(), noticias: await db.get('news', []), configuracoes: await getSet() }, null, 2), 'application/json', { 'Content-Disposition': 'attachment; filename="backup-md-bot.json"' });
          if (u === '/api/admin/export.csv') {
            const rows = ['nome,email,servidor,discord,data'].concat((await allWL()).map(x => [x.nome, x.email, x.servidor, x.discord, x.data].map(csvCell).join(',')));
            return F(R, 200, '\ufeff' + rows.join('\r\n'), 'text/csv; charset=utf-8', { 'Content-Disposition': 'attachment; filename="inscritos-md-bot.csv"' });
          }
        }
        if (m === 'POST') {
          if (R.headers['x-csrf-token'] !== sess.c) { await ev('csrf_invalido', R, u); return J(R, 403, { ok: false, error: 'Token inválido. Recarregue o painel.' }); }
          if (u === '/api/admin/logout') return J(R, 200, { ok: true }, { 'Set-Cookie': setCookie(R, '', 0) });
          const b = await body(R, 4096);
          if (u === '/api/admin/logout-all') { const a = await getAdm(); a.sv++; await db.set('admin', a); await ev('logout_todos', R); return J(R, 200, { ok: true }, { 'Set-Cookie': setCookie(R, '', 0) }); }
          if (u === '/api/admin/delete') { await db.del(wlKey(clean(b.email, 120).toLowerCase())); return J(R, 200, { ok: true }); }
          if (u === '/api/admin/news/save') {
            const all = await db.get('news', []), old = b.id ? all.find(x => x.id === b.id) : null; if (b.id && !old) return J(R, 404, { ok: false, error: 'Notícia não encontrada.' });
            const n = cleanNews(b, old); if (!n) return J(R, 400, { ok: false, error: 'Preencha título e texto. O link precisa começar com https:// e ter um texto de botão.' });
            if (old) Object.assign(old, n); else all.push(n);
            await db.set('news', all); await ev('noticia_salva', R, n.title); return J(R, 200, { ok: true, item: n });
          }
          if (u === '/api/admin/news/delete') { await db.set('news', (await db.get('news', [])).filter(x => x.id !== b.id)); await ev('noticia_removida', R, String(b.id).slice(0, 20)); return J(R, 200, { ok: true }); }
          if (u === '/api/admin/settings/save') {
            const s = cleanSettings(b); if (!s) return J(R, 400, { ok: false, error: 'Configurações inválidas. Links precisam ser https:// (Discord: discord.gg ou discord.com) e o vídeo deve ficar em /video/ ou /media/.' });
            await db.set('settings', s); await ev('config_salva', R); try { onSettings(s); } catch (e) { /* opcional */ }
            return J(R, 200, { ok: true, settings: s });
          }
          if (u === '/api/admin/password') {
            if (!(await passOk(String(b.current || ''))) || String(b.next || '').length < 12 || String(b.next).length > 200) { await ev('senha_troca_falha', R); await sleep(700); return J(R, 400, { ok: false, error: 'Senha atual incorreta ou nova senha com menos de 12 caracteres.' }); }
            const a = await getAdm(); a.hash = hashPw(String(b.next)); a.sv++; await db.set('admin', a); await ev('senha_alterada', R);
            return J(R, 200, { ok: true }, { 'Set-Cookie': setCookie(R, '', 0) });
          }
        }
      }
      return J(R, 404, { ok: false, error: 'Não encontrado.' });
    } catch (e) {
      if (e.code && e.code < 500) return J(R, e.code, { ok: false, error: 'Requisição inválida.' });
      console.error(e); return J(R, 500, { ok: false, error: 'Erro interno.' });
    }
  }
  return { handle, checkAdmin, ev, secHeaders, CSP, db, hashPw, getSet, rnd };
}
module.exports = { createCore };
