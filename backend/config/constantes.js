// ============================================================
// CONSTANTES — valores padrão compartilhados entre rotas
// ============================================================
// Antes esse objeto estava duplicado em configRoutes.js e em
// pedidoRoutes.js. Centralizado aqui, uma mudança só precisa
// ser feita em um lugar.
// ============================================================

/** Usado como fallback quando ainda não existe backend/data/config.json. */
const CONFIG_PADRAO = {
  precoPorPessoa: 40,
  pessoasPorEquipe: 25,
};

module.exports = { CONFIG_PADRAO };
