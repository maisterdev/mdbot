'use strict';
// Gera um segredo para a verificação em duas etapas (2FA) do painel.
// Uso: node tools/totp-secret.js   -> cole o segredo em ADMIN_TOTP_SECRET e adicione no Google Authenticator/Authy.
const crypto = require('crypto'), A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
let s = ''; for (const b of crypto.randomBytes(20)) s += A[b % 32];
console.log('\nADMIN_TOTP_SECRET=' + s);
console.log('\nNo app autenticador: "Adicionar conta" > "Inserir chave de configuração"');
console.log('  Nome: MD Bot   |   Chave: ' + s + '   |   Tipo: baseado em tempo\n');
