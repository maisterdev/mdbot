// Adaptador do Netlify Functions (v2). Usa o MESMO núcleo da API do servidor Node (lib/core.js).
import boot from '../../lib/boot.js';

export const config = { path: '/api/*' };

export default async (req, context) => {
  const core = boot({ ...process.env, STORAGE: process.env.STORAGE || 'netlify' }, { canUpload: false });
  const url = new URL(req.url);
  const headers = Object.fromEntries(req.headers);
  const R = {
    method: req.method, path: url.pathname, headers, host: url.host,
    ip: (context && context.ip) || headers['x-nf-client-connection-ip'] || '0.0.0.0',
    https: url.protocol === 'https:',
    readBody: async (max) => {
      if (+headers['content-length'] > max) throw Object.assign(new Error('grande'), { code: 413 });
      const buf = Buffer.from(await req.arrayBuffer());
      if (buf.length > max) throw Object.assign(new Error('grande'), { code: 413 });
      return buf;
    }
  };
  const r = await core.handle(R);
  return new Response(r.body == null ? null : r.body, { status: r.status, headers: r.headers });
};
