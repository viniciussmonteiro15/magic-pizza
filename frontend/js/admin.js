// ============================================================
// ADMIN — login e cadastro de sabores (área protegida por senha)
// ============================================================
// A senha nunca é validada no front-end: ela é enviada para a
// API, que devolve um token caso esteja correta. O token fica
// guardado só em memória (variável JS), então some ao recarregar
// a página — obrigando novo login, o que é o comportamento
// esperado para uma área administrativa simples.
// ============================================================

const estadoAdmin = {
  token: null,
};

/** Configura os eventos da tela de login e do formulário de cadastro. */
function iniciarAreaAdmin() {
  document.getElementById('btnAdminLogin').addEventListener('click', fazerLoginAdmin);

  document.getElementById('adminSenha').addEventListener('keydown', (evento) => {
    if (evento.key === 'Enter') fazerLoginAdmin();
  });

  document.getElementById('btnAdminSair').addEventListener('click', sairAreaAdmin);

  document.getElementById('saborForm').addEventListener('submit', (evento) => {
    evento.preventDefault();
    cadastrarNovoSabor();
  });
}

/** Envia a senha digitada para a API e libera o painel se estiver correta. */
async function fazerLoginAdmin() {
  const input = document.getElementById('adminSenha');
  const erroEl = document.getElementById('err-admin-senha');
  erroEl.textContent = '';

  try {
    const { token } = await api.loginAdmin(input.value);
    estadoAdmin.token = token;
    input.value = '';

    document.getElementById('adminLogin').hidden = false;
    document.getElementById('adminLogin').style.display = 'none';
    document.getElementById('adminPainel').hidden = false;
  } catch (erro) {
    erroEl.textContent = erro.message;
  }
}

/** Encerra a sessão administrativa e volta para a tela de login. */
function sairAreaAdmin() {
  estadoAdmin.token = null;
  document.getElementById('adminLogin').style.display = 'flex';
  document.getElementById('adminPainel').hidden = true;
}

/** Envia o formulário de cadastro de sabor para a API. */
async function cadastrarNovoSabor() {
  const nome = document.getElementById('saborNome').value.trim();
  const descricao = document.getElementById('saborDescricao').value.trim();
  const tipo = document.querySelector('input[name="saborTipo"]:checked').value;

  const erroEl = document.getElementById('err-sabor');
  const sucessoEl = document.getElementById('sucesso-sabor');
  erroEl.textContent = '';
  sucessoEl.textContent = '';

  try {
    await api.cadastrarSabor({ nome, descricao, tipo }, estadoAdmin.token);
    sucessoEl.textContent = `Sabor "${nome}" cadastrado com sucesso!`;
    document.getElementById('saborForm').reset();

    // Recarrega o cardápio (js/sabores.js) para o novo sabor já aparecer no pedido.
    carregarCardapio();
  } catch (erro) {
    erroEl.textContent = erro.message;
  }
}
