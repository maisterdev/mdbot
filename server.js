'use strict';
/*
 * MD Bot - servidor Node.js (adaptador): serve o site, a API e o painel /lista.
 * Zero dependências. Requer Node.js 18+. Usado em VPS, Render, Railway, Fly.io, Docker, PC...
 * (No Netlify o site usa netlify/functions/api.mjs com o MESMO núcleo: lib/core.js.)
 */
const http = require('http'), fs = require('fs'), fsp = fs.promises, path = require('path'), crypto = require('crypto'), zlib = require('zlib');
try {
  for (const l of fs.readFileSync(path.join(__dirname, '.env'), 'utf8').split(/\r?\n/)) {
    const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2');
  }
} catch (e) { /* sem .env: usa variáveis do ambiente */ }

const E = process.env;
const PORT = +E.PORT || 3000, HOST = E.HOST || '0.0.0.0', PROD = E.NODE_ENV === 'production', TRUST = E.TRUST_PROXY === '1';
const PUB = path.join(__dirname, 'public');
const DATA = path.resolve(E.DATA_DIR || path.join(__dirname, 'data')), UP = path.join(DATA, 'uploads');
const MAX_UPLOAD = (+E.MAX_UPLOAD_MB || 100) * 1048576;
const ALLOWED_HOSTS = (E.ALLOWED_HOSTS || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
fs.mkdirSync(UP, { recursive: true });

const boot = require('./lib/boot');
const fileMode = !E.STORAGE || E.STORAGE === 'file';
const core = boot(E, {
  canUpload: fileMode,
  onSettings: s => fsp.readdir(UP).then(l => l.filter(n => !(s.video.src || '').endsWith('/' + n)).forEach(n => fsp.unlink(path.join(UP, n)).catch(() => {}))).catch(() => {})
});

// ---------- utilidades ----------
const getIp = req => TRUST ? ((req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress) : req.socket.remoteAddress;
const isHttps = req => !!req.socket.encrypted || (TRUST && req.headers['x-forwarded-proto'] === 'https');
const buckets = new Map();
const over = (k, max) => { const b = buckets.get(k); return b && b.r > Date.now() && b.c >= max; };
const bump = (k, win) => { const n = Date.now(); let b = buckets.get(k); if (!b || b.r < n) b = { c: 0, r: n + win }; b.c++; buckets.set(k, b); };
setInterval(() => { const n = Date.now(); for (const [k, b] of buckets) if (b.r < n) buckets.delete(k); }, 60e3).unref();
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8', '.mp4': 'video/mp4', '.webm': 'video/webm', '.woff2': 'font/woff2' };

function send(res, r) {
  for (const k in r.headers) res.setHeader(k, r.headers[k]);
  res.writeHead(r.status); res.end(r.body == null ? undefined : r.body);
}
function normalize(req, u) {
  return {
    method: req.method, path: u, headers: req.headers, host: req.headers.host, ip: getIp(req), https: isHttps(req) || PROD,
    readBody: (max) => new Promise((ok, no) => {
      let n = 0; const c = [];
      req.on('data', d => { n += d.length; if (n > max) { no(Object.assign(new Error('grande'), { code: 413 })); req.destroy(); } else c.push(d); });
      req.on('end', () => ok(Buffer.concat(c))); req.on('error', () => no(Object.assign(new Error('rede'), { code: 400 })));
    })
  };
}

// ---------- backup diário (modo arquivo) ----------
function backup() {
  if (!fileMode) return;
  try {
    const src = path.join(DATA, 'store.json'); if (!fs.existsSync(src)) return;
    const d = path.join(DATA, 'backups'); fs.mkdirSync(d, { recursive: true, mode: 0o700 });
    fs.copyFileSync(src, path.join(d, 'store-' + new Date().toISOString().slice(0, 10) + '.json'));
    const all = fs.readdirSync(d).sort(); while (all.length > 14) fs.unlinkSync(path.join(d, all.shift()));
  } catch (e) { console.error('backup:', e.message); }
}
setTimeout(backup, 5000).unref(); setInterval(backup, 24 * 3600e3).unref();

// ---------- upload de vídeo (somente admin autenticado) ----------
async function upload(req, res, R) {
  const chk = await core.checkAdmin(R); if (chk.res) return send(res, chk.res);
  const json = (c, o) => send(res, { status: c, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...core.secHeaders(R.https) }, body: JSON.stringify(o) });
  if (!fileMode) return json(400, { ok: false, error: 'Upload indisponível neste modo. Coloque o vídeo em public/video/.' });
  const ct = String(req.headers['content-type'] || '').split(';')[0], ext = ct === 'video/mp4' ? 'mp4' : ct === 'video/webm' ? 'webm' : '';
  if (!ext) return json(415, { ok: false, error: 'Envie um vídeo MP4 ou WebM.' });
  if (+req.headers['content-length'] > MAX_UPLOAD) return json(413, { ok: false, error: 'Vídeo grande demais (limite ' + MAX_UPLOAD / 1048576 + ' MB).' });
  const name = 'intro-' + crypto.randomBytes(6).toString('hex') + '.' + ext, tmp = path.join(UP, name + '.part');
  let n = 0, head = Buffer.alloc(0), dead = false; const out = fs.createWriteStream(tmp, { mode: 0o600 });
  const fail = (c, m) => { if (dead) return; dead = true; out.destroy(); fsp.unlink(tmp).catch(() => {}); json(c, { ok: false, error: m }); };
  req.on('data', d => { n += d.length; if (head.length < 12) head = Buffer.concat([head, d]).slice(0, 12); if (n > MAX_UPLOAD) { fail(413, 'Vídeo grande demais.'); req.destroy(); } });
  req.on('error', () => fail(400, 'Falha no envio.')); req.pipe(out);
  out.on('finish', async () => {
    if (dead) return;
    const good = ext === 'mp4' ? head.slice(4, 8).toString() === 'ftyp' : (head[0] === 0x1a && head[1] === 0x45 && head[2] === 0xdf && head[3] === 0xa3);
    if (!good || n < 1024) return fail(400, 'Arquivo inválido: não é um vídeo ' + ext.toUpperCase() + ' real.');
    await fsp.rename(tmp, path.join(UP, name)); dead = true; await core.ev('video_enviado', R, name); json(200, { ok: true, src: '/media/' + name });
  });
}

// ---------- arquivos estáticos ----------
const gz = new Map();
function ranged(req, res, f, st, type, h, R) {
  const m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
  let a = 0, b = st.size - 1, code = 200;
  if (m && (m[1] || m[2])) {
    a = m[1] ? +m[1] : st.size - +m[2]; b = m[1] && m[2] ? Math.min(+m[2], st.size - 1) : st.size - 1; code = 206;
    if (a > b || a >= st.size) { res.writeHead(416, { 'Content-Range': 'bytes */' + st.size }); return res.end(); }
  }
  const hd = Object.assign({ 'Content-Type': type, 'Accept-Ranges': 'bytes', 'Content-Length': b - a + 1 }, core.secHeaders(R.https), h);
  if (code === 206) hd['Content-Range'] = `bytes ${a}-${b}/${st.size}`;
  res.writeHead(code, hd); if (req.method === 'HEAD') return res.end();
  fs.createReadStream(f, { start: a, end: b }).pipe(res);
}
async function serve(req, res, u, R) {
  let p; try { p = decodeURIComponent(u); } catch (e) { res.writeHead(400); return res.end(); }
  if (p.includes('\0') || p.includes('\\')) { res.writeHead(400); return res.end(); }
  const admin = p === '/lista' || p === '/lista/'; let base = PUB;
  if (p.startsWith('/media/')) { base = UP; p = p.slice(6); } else if (admin) p = '/lista.html'; else if (p.endsWith('/')) p += 'index.html';
  const f = path.join(base, path.normalize(p));
  let st; try { st = await fsp.stat(f); } catch (e) { st = null; }
  if (!f.startsWith(base + path.sep) || path.basename(f).startsWith('.') || f.endsWith('.part') || !st || !st.isFile()) {
    res.writeHead(404, Object.assign({ 'Content-Type': MIME['.html'] }, core.secHeaders(R.https)));
    try { return res.end(await fsp.readFile(path.join(PUB, '404.html'))); } catch (e) { return res.end('Não encontrado'); }
  }
  const ext = path.extname(f).toLowerCase(), type = MIME[ext] || 'application/octet-stream';
  const h = { 'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600' };
  if (admin) { h['Cache-Control'] = 'no-store'; h['X-Robots-Tag'] = 'noindex, nofollow'; }
  if (ext === '.mp4' || ext === '.webm') return ranged(req, res, f, st, type, h, R);
  let data = await fsp.readFile(f);
  if (/gzip/.test(req.headers['accept-encoding'] || '') && ['.html', '.css', '.js', '.json', '.svg', '.txt'].includes(ext)) {
    const k = f + st.mtimeMs; let z = gz.get(k); if (!z) { z = zlib.gzipSync(data); gz.set(k, z); }
    data = z; h['Content-Encoding'] = 'gzip'; h.Vary = 'Accept-Encoding';
  }
  res.writeHead(200, Object.assign({ 'Content-Type': type }, core.secHeaders(R.https), h)); res.end(req.method === 'HEAD' ? undefined : data);
}

// ---------- servidor ----------
const server = http.createServer(async (req, res) => {
  try {
    const ip = getIp(req), host = String(req.headers.host || '').toLowerCase().split(':')[0];
    if (ALLOWED_HOSTS.length && !ALLOWED_HOSTS.includes(host)) { res.writeHead(421); return res.end(); }
    if (PROD && TRUST && req.headers['x-forwarded-proto'] === 'http') { res.writeHead(301, { Location: 'https://' + req.headers.host + req.url }); return res.end(); }
    if ((req.url || '').length > 2048) { res.writeHead(414); return res.end(); }
    if (over('g:' + ip, 400)) { res.writeHead(429, { 'Retry-After': '60' }); return res.end('Muitas requisições'); }
    bump('g:' + ip, 60e3);
    const u = (req.url || '/').split('?')[0], R = normalize(req, u);
    if (u === '/api/admin/upload' && req.method === 'POST') return await upload(req, res, R);
    if (u.startsWith('/api/')) return send(res, await core.handle(R));
    if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405, { Allow: 'GET, HEAD' }); return res.end(); }
    await serve(req, res, u, R);
  } catch (e) { console.error(e); if (!res.headersSent) res.writeHead(500); res.end('Erro'); }
});
server.headersTimeout = 15000; server.requestTimeout = 300000; server.keepAliveTimeout = 5000; server.maxHeadersCount = 60; server.maxRequestsPerSocket = 200;
server.listen(PORT, HOST, () => console.log(`MD Bot rodando em http://localhost:${PORT}  (painel: /lista)  armazenamento: ${core.db.kind}`));
process.on('uncaughtException', e => console.error('Erro não tratado:', e.message));
