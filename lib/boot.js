'use strict';
const { createStorage } = require('./storage');
const { createCore } = require('./core');
let inst;
/* Cria (uma vez) o "núcleo" da API com o armazenamento certo para a hospedagem. */
module.exports = function boot(env, extra) {
  if (!inst) { const db = createStorage(env); inst = createCore(Object.assign({ env, db }, extra || {})); }
  return inst;
};
