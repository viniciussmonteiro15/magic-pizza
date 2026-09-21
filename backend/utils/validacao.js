// ============================================================
// VALIDAÇÃO — helpers pequenos e reaproveitáveis para as rotas
// ============================================================
// Antes o mesmo padrão "if (!campo || !campo.trim())" estava
// copiado em saborRoutes.js, galeriaRoutes.js e pedidoRoutes.js.
// ============================================================

/** true se o valor for uma string não vazia (depois de remover espaços). */
function textoPreenchido(valor) {
  return typeof valor === 'string' && valor.trim().length > 0;
}

/**
 * Verifica uma lista de campos obrigatórios em `dados`.
 * Devolve a lista dos nomes que estão faltando (vazia = tudo ok).
 */
function camposFaltando(dados, camposObrigatorios) {
  return camposObrigatorios.filter((campo) => {
    const valor = dados[campo];
    return valor === undefined || valor === null || String(valor).trim() === '';
  });
}

/** true se `url` for um endereço http(s) minimamente válido. */
function urlValida(url) {
  return typeof url === 'string' && /^https?:\/\/.+/i.test(url.trim());
}

module.exports = { textoPreenchido, camposFaltando, urlValida };
