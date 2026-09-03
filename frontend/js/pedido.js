// ============================================================
// PEDIDO — dados do cliente, valores, resumo e confirmação
// ============================================================
// Cuida da aba "Consultar Valores" (simulador) e da aba
// "Finalizar Pedido" (máscaras de input, validação, resumo em
// tempo real e envio do pedido para a API).
// ============================================================

// Guarda os valores atuais (preço por pessoa, tamanho da equipe) vindos da API.
const estadoValores = {
  precoPorPessoa: 40,
  pessoasPorEquipe: 25,
};

/** Busca os valores atuais na API e atualiza os textos que dependem deles. */
async function carregarValores() {
  try {
    const valores = await api.buscarValores();
    estadoValores.precoPorPessoa = valores.precoPorPessoa;
    estadoValores.pessoasPorEquipe = valores.pessoasPorEquipe;
  } catch (erro) {
    console.error('Não foi possível carregar os valores da API, usando padrão.', erro);
  }

  const precoFormatado = formatarReais(estadoValores.precoPorPessoa);

  document.querySelectorAll('#badgePreco, .header-badge--topbar').forEach((el) => {
    el.innerHTML = `R$${estadoValores.precoPorPessoa}<small>/pessoa</small>`;
  });
  document.getElementById('valorPorPessoa').textContent = precoFormatado;
  document.getElementById('valorPessoasEquipe').textContent = estadoValores.pessoasPorEquipe;
  document.getElementById('resumoPrecoUnitario').textContent = `R$${estadoValores.precoPorPessoa}`;
}

/** Liga o simulador de preço da aba "Consultar Valores". */
function iniciarSimulador() {
  const input = document.getElementById('simuladorPessoas');
  input.addEventListener('input', () => {
    const pessoas = Math.max(0, Math.floor(Number(input.value)) || 0);
    const equipe = Math.ceil(pessoas / estadoValores.pessoasPorEquipe) || 0;
    const total = pessoas * estadoValores.precoPorPessoa;

    document.getElementById('simuladorEquipe').textContent =
      pessoas > 0 ? `${equipe} pizzaiolo(s) + ${equipe} garçom(ns)` : '–';
    document.getElementById('simuladorTotal').textContent = formatarReais(total);
  });
}

// --- MÁSCARAS DE INPUT (aplicadas assim que o usuário digita) ---
function iniciarMascarasInput() {
  document.getElementById('whatsapp').addEventListener('input', function () {
    let v = this.value.replace(/\D/g, '');
    v = v.length <= 10 ? v.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3') : v.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    this.value = v;
  });

  document.getElementById('cpf').addEventListener('input', function () {
    let v = this.value.replace(/\D/g, '');
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    this.value = v;
  });
}

// --- RESUMO EM TEMPO REAL (aba "Finalizar Pedido") ---

/** Recalcula e redesenha o resumo do pedido (sabores, equipe, preço). */
function atualizarResumoPedido() {
  // Sabores salgados
  const listaSalgadas = document.getElementById('resumoSalgadas');
  const salgadasSelecionadas = obterSaboresSelecionadosCompletos().filter((s) => s.tipo === 'salgada');
  listaSalgadas.innerHTML = salgadasSelecionadas.length
    ? salgadasSelecionadas.map((s) => `<li>${s.nome}</li>`).join('')
    : '<li style="color:var(--gray);font-style:italic;font-size:0.82rem;">Nenhum salgado selecionado</li>';

  // Sabores doces
  const listaDoces = document.getElementById('resumoDoces');
  const docesSelecionados = obterSaboresSelecionadosCompletos().filter((s) => s.tipo === 'doce');
  listaDoces.parentElement.classList.toggle('doce-grupo', docesSelecionados.length > 0);
  listaDoces.innerHTML = docesSelecionados.length
    ? docesSelecionados.map((s) => `<li>${s.nome}</li>`).join('')
    : '<li style="color:var(--gray);font-style:italic;font-size:0.82rem;">Nenhum doce selecionado</li>';

  // Equipe e preço, calculados a partir da quantidade de pessoas informada
  const pessoas = Number(document.getElementById('numPessoas').value) || 0;
  const equipe = Math.ceil(pessoas / estadoValores.pessoasPorEquipe) || 0;
  const total = pessoas * estadoValores.precoPorPessoa;

  document.getElementById('numPizzaiolos').textContent = equipe;
  document.getElementById('numGarcons').textContent = equipe;
  document.getElementById('resumoPessoas').textContent = pessoas;
  document.getElementById('precoTotal').textContent = formatarReais(total);

  // Espelha o total na barra fixa exibida em telas pequenas.
  document.getElementById('precoTotalMobile').textContent = formatarReais(total);
}

/** Liga os eventos que recalculam o resumo sempre que algo relevante muda. */
function iniciarResumoAoVivo() {
  document.getElementById('numPessoas').addEventListener('input', atualizarResumoPedido);
}

// --- VALIDAÇÃO E ENVIO DO PEDIDO ---

const CAMPOS_OBRIGATORIOS = [
  { id: 'nomeCompleto', errId: 'err-nome', msg: 'Nome completo é obrigatório' },
  { id: 'cpf', errId: 'err-cpf', msg: 'CPF é obrigatório' },
  { id: 'whatsapp', errId: 'err-whatsapp', msg: 'WhatsApp é obrigatório' },
  { id: 'numPessoas', errId: 'err-pessoas', msg: 'Número de pessoas é obrigatório' },
  { id: 'dataEvento', errId: 'err-data', msg: 'Data do evento é obrigatória' },
  { id: 'horaEvento', errId: 'err-hora', msg: 'Horário do evento é obrigatório' },
  { id: 'rua', errId: 'err-rua', msg: 'Rua é obrigatória' },
  { id: 'bairro', errId: 'err-bairro', msg: 'Bairro é obrigatório' },
  { id: 'cidade', errId: 'err-cidade', msg: 'Cidade é obrigatória' },
];

/** Valida os campos do formulário no navegador (validação "de primeira camada"). */
function validarFormularioPedido() {
  let valido = true;

  CAMPOS_OBRIGATORIOS.forEach(({ id, errId, msg }) => {
    const input = document.getElementById(id);
    const errEl = document.getElementById(errId);
    if (!input.value.trim()) {
      input.classList.add('error');
      errEl.textContent = msg;
      valido = false;
    } else {
      input.classList.remove('error');
      errEl.textContent = '';
    }
  });

  if (Number(document.getElementById('numPessoas').value) < 1) {
    document.getElementById('numPessoas').classList.add('error');
    document.getElementById('err-pessoas').textContent = 'Mínimo de 1 pessoa';
    valido = false;
  }

  if (obterIdsSaboresSelecionados().length === 0) {
    document.getElementById('err-geral').textContent = 'Selecione ao menos um sabor na aba "Montar Pedido".';
    valido = false;
  }

  return valido;
}

/** Monta o payload e envia o pedido para a API. */
async function confirmarPedido() {
  const erroGeralEl = document.getElementById('err-geral');
  erroGeralEl.textContent = '';

  if (!validarFormularioPedido()) {
    const primeiroErro = document.querySelector('.dados-form input.error');
    if (primeiroErro) primeiroErro.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  const payload = {
    nomeCompleto: document.getElementById('nomeCompleto').value.trim(),
    cpf: document.getElementById('cpf').value.trim(),
    whatsapp: document.getElementById('whatsapp').value.trim(),
    formaPagamento: document.querySelector('input[name="formaPagamento"]:checked').value,
    quantidadePessoas: Number(document.getElementById('numPessoas').value),
    dataEvento: document.getElementById('dataEvento').value,
    horaEvento: document.getElementById('horaEvento').value,
    rua: document.getElementById('rua').value.trim(),
    bairro: document.getElementById('bairro').value.trim(),
    cidade: document.getElementById('cidade').value.trim(),
    referencia: document.getElementById('referencia').value.trim(),
    saborIds: obterIdsSaboresSelecionados(),
  };

  // Botão principal (dentro do formulário) e o da barra fixa mobile são
  // mantidos em sincronia: ambos disparam a mesma ação de confirmação.
  const botoes = [document.getElementById('btnConfirmarPedido'), document.getElementById('btnConfirmarPedidoMobile')];
  botoes.forEach((b) => {
    b.disabled = true;
    b.querySelector('span').textContent = 'Enviando...';
  });

  try {
    const pedidoSalvo = await api.criarPedido(payload);
    exibirTelaAgradecimento(pedidoSalvo, payload);
  } catch (erro) {
    erroGeralEl.textContent = erro.message;
  } finally {
    botoes.forEach((b) => {
      b.disabled = false;
      b.querySelector('span').textContent = 'Confirmar Pedido';
    });
  }
}

/** Preenche e exibe o overlay de agradecimento (dialog nativo) com os dados do pedido salvo. */
function exibirTelaAgradecimento(pedidoSalvo, payloadEnviado) {
  document.getElementById('obrigadoNome').textContent = payloadEnviado.nomeCompleto;
  document.getElementById('obrigadoTel').textContent = payloadEnviado.whatsapp;
  document.getElementById('obrigadoData').textContent =
    `${formatarData(payloadEnviado.dataEvento)} às ${payloadEnviado.horaEvento}`;
  document.getElementById('obrigadoPessoas').textContent = `${payloadEnviado.quantidadePessoas} convidados`;
  document.getElementById('obrigadoPreco').textContent = formatarReais(pedidoSalvo.preco_total);

  // showModal() dá foco automático, trava o foco dentro do diálogo e liga a tecla Esc — tudo de graça.
  document.getElementById('obrigadoOverlay').showModal();
}

/** Liga os controles de fechamento do overlay de agradecimento. */
function iniciarOverlayAgradecimento() {
  const overlay = document.getElementById('obrigadoOverlay');

  document.getElementById('btnFecharObrigado').addEventListener('click', () => overlay.close());

  // Fecha ao clicar fora do card (no backdrop nativo do <dialog>).
  overlay.addEventListener('click', (evento) => {
    if (evento.target === overlay) overlay.close();
  });
}

// --- UTILITÁRIOS DE FORMATAÇÃO ---
function formatarReais(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarData(dataStr) {
  if (!dataStr) return '–';
  const [ano, mes, dia] = dataStr.split('-');
  return `${dia}/${mes}/${ano}`;
}