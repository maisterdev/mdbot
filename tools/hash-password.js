'use strict';
// Uso: node tools/hash-password.js "sua senha forte"
const crypto = require('crypto'), readline = require('readline');
function out(p) {
  if (!p || p.length < 12) { console.error('Use uma senha com pelo menos 12 caracteres.'); process.exit(1); }
  const salt = crypto.randomBytes(16);
  console.log('\nCole no seu .env:\nADMIN_PASSWORD_HASH=scrypt$' + salt.toString('hex') + '$' + crypto.scryptSync(p, salt, 64).toString('hex') + '\n');
}
if (process.argv[2]) out(process.argv[2]);
else { const r = readline.createInterface({ input: process.stdin, output: process.stdout }); r.question('Senha (min. 12 caracteres): ', p => { r.close(); out(p); }); }
