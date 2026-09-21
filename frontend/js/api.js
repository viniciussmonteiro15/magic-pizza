// ============================================================
// API — funções de comunicação com o back-end
// ============================================================
// Centraliza todas as chamadas fetch() do site. Assim, os
// outros arquivos JS não precisam saber a URL da API ou como
// montar os headers — só chamam essas funções.
// ============================================================

// Como o front-end é servido pelo próprio Express (veja backend/app.js),
// as chamadas usam caminho relativo e funcionam em qualquer porta/host.
const API_BASE_URL = '/api';

/**
 * Função interna que faz o fetch, trata erros HTTP e sempre
 * devolve o corpo já convertido em JSON.
 */
async function requisitar(caminho, opcoes = {}) {
  const resposta = await fetch(`${API_BASE_URL}${caminho}`, {
    headers: { 'Content-Type': 'application/json', ...(opcoes.headers || {}) },
    ...opcoes,
  });

  const dados = await resposta.json().catch(() => ({}));

  if (!resposta.ok) {
    // O backend sempre devolve { erro: 'mensagem' } quando algo dá errado.
    throw new Error(dados.erro || 'Ocorreu um erro inesperado. Tente novamente.');
  }

  return dados;
}

const api = {
  /** Busca o cardápio (sabores salgados e doces) disponível. */
  buscarCardapio() {
    return requisitar('/sabores');
  },

  /** Cadastra um novo sabor (requer token de administrador). */
  cadastrarSabor(sabor, token) {
    return requisitar('/sabores', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(sabor),
    });
  },

  /** Faz login administrativo e devolve o token JWT. */
  loginAdmin(senha) {
    return requisitar('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ senha }),
    });
  },

  /** Busca os valores atuais (preço por pessoa, tamanho da equipe). */
  buscarValores() {
    return requisitar('/config/valores');
  },

  /** Envia o pedido finalizado para o back-end. */
  criarPedido(pedido) {
    return requisitar('/pedidos', {
      method: 'POST',
      body: JSON.stringify(pedido),
    });
  },

  /** Busca os depoimentos de clientes, mais recentes primeiro. */
  buscarFeedbacks() {
    return requisitar('/feedback');
  },

  /** Envia um novo depoimento de cliente (sem login). */
  criarFeedback(feedback) {
    return requisitar('/feedback', {
      method: 'POST',
      body: JSON.stringify(feedback),
    });
  },

  /** Busca as fotos da galeria de eventos, mais recentes primeiro. */
  buscarGaleria() {
    return requisitar('/galeria');
  },

  /** Cadastra uma nova foto na galeria (requer token de administrador). */
  cadastrarFotoGaleria(foto, token) {
    return requisitar('/galeria', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(foto),
    });
  },
};