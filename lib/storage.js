'use strict';
/* Armazenamento universal: o mesmo código funciona em qualquer hospedagem.
 *  - file     : arquivos em ./data (VPS, Render com disco, Railway, Docker, PC)
 *  - netlify  : Netlify Blobs (automático no Netlify)
 *  - upstash  : Redis REST gratuito (qualquer hospedagem sem disco: Vercel, Cloudflare...)
 *  - memory   : apenas para testes
 * Escolha com STORAGE=file|netlify|upstash|memory (ou deixe automático).
 */
const fs = require('fs'), fsp = fs.promises, path = require('path');

function rlWith(get, set, del) {
  return {
    rlGet: get,
    rlBump: async (k, w) => { const n = Date.now(); let b = await get(k); if (!b || b.r < n) b = { c: 0, r: n + w }; b.c++; await set(k, b); },
    rlDel: del
  };
}
function rlMemory() {
  const m = new Map();
  const t = setInterval(() => { const n = Date.now(); for (const [k, b] of m) if (b.r < n) m.delete(k); }, 60e3); if (t.unref) t.unref();
  return rlWith(async k => m.get(k) || null, async (k, b) => { m.set(k, b); }, async k => { m.delete(k); });
}
function memory() {
  const kv = new Map();
  return Object.assign({
    kind: 'memory', get: async (k, d) => kv.has(k) ? JSON.parse(JSON.stringify(kv.get(k))) : d,
    set: async (k, v) => { kv.set(k, JSON.parse(JSON.stringify(v))); }, del: async k => { kv.delete(k); },
    list: async p => [...kv.keys()].filter(k => k.startsWith(p)).sort()
  }, rlMemory());
}
function file(dir) {
  fs.mkdirSync(dir, { recursive: true });
  const f = path.join(dir, 'store.json'); let kv = {}, q = Promise.resolve();
  try { kv = JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { kv = {}; }
  const flush = () => q = q.then(async () => { await fsp.writeFile(f + '.tmp', JSON.stringify(kv, null, 1), { mode: 0o600 }); await fsp.rename(f + '.tmp', f); }).catch(e => console.error('storage:', e.message));
  return Object.assign({
    kind: 'file', file: f,
    get: async (k, d) => k in kv ? JSON.parse(JSON.stringify(kv[k])) : d,
    set: async (k, v) => { kv[k] = v; await flush(); }, del: async k => { delete kv[k]; await flush(); },
    list: async p => Object.keys(kv).filter(k => k.startsWith(p)).sort()
  }, rlMemory());
}
function netlify() {
  let st; const S = async () => st || (st = (await import('@netlify/blobs')).getStore({ name: 'mdbot', consistency: 'strong' }));
  const get = async (k, d) => { const v = await (await S()).get(k, { type: 'json' }); return v == null ? d : v; };
  const set = async (k, v) => { await (await S()).setJSON(k, v); };
  const del = async k => { await (await S()).delete(k); };
  return Object.assign({
    kind: 'netlify', get, set, del,
    list: async p => ((await (await S()).list({ prefix: p })).blobs || []).map(b => b.key).sort()
  }, rlWith(k => get('rl/' + k, null), (k, b) => set('rl/' + k, b), k => del('rl/' + k)));
}
function upstash(url, token) {
  const c = async a => { const r = await fetch(url, { method: 'POST', headers: { Authorization: 'Bearer ' + token }, body: JSON.stringify(a) }); const j = await r.json(); if (j.error) throw new Error(j.error); return j.result; };
  const get = async (k, d) => { const v = await c(['GET', k]); return v == null ? d : JSON.parse(v); };
  const set = async (k, v) => { await c(['SET', k, JSON.stringify(v)]); };
  const del = async k => { await c(['DEL', k]); };
  return Object.assign({
    kind: 'upstash', get, set, del,
    list: async p => ((await c(['KEYS', p + '*'])) || []).sort()
  }, rlWith(k => get('rl/' + k, null), (k, b) => set('rl/' + k, b), k => del('rl/' + k)));
}
function createStorage(E) {
  const t = (E.STORAGE || '').toLowerCase();
  if (t === 'memory') return memory();
  if (t === 'netlify') return netlify();
  if (t === 'upstash' || (!t && E.UPSTASH_REDIS_REST_URL && E.UPSTASH_REDIS_REST_TOKEN)) return upstash(E.UPSTASH_REDIS_REST_URL, E.UPSTASH_REDIS_REST_TOKEN);
  return file(path.resolve(E.DATA_DIR || path.join(__dirname, '..', 'data')));
}
module.exports = { createStorage };
