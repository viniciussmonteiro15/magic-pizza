// ============================================================
// MAIN — navegação (sidebar), progresso e inicialização geral
// ============================================================
// Este é o único arquivo que "liga tudo": chama as funções de
// carregamento dos outros módulos e cuida da troca de abas e
// da gaveta lateral (sidebar) no mobile.
// ============================================================

// Título amigável exibido na barra superior para cada aba.
const TITULO_POR_ABA = {
  inicio: 'Início',
  historia: 'Nossa História',
  valores: 'Consultar Valores',
  pedidos: 'Montar Pedido',
  finalizar: 'Finalizar Pedido',
  feedback: 'Feedback',
  galeria: 'Galeria de Eventos',
  admin: 'Área da Equipe',
};

// Porcentagem da barra de progresso — só faz sentido dentro do fluxo de pedido.
const PROGRESSO_POR_ABA = { valores: 33, pedidos: 66, finalizar: 100 };

/** Troca a aba visível, atualiza a navegação, o título e a barra de progresso. */
function irParaAba(tabId) {
  document.querySelectorAll('.nav-link').forEach((btn) => {
    const ativo = btn.dataset.tab === tabId;
    btn.classList.toggle('active', ativo);
    btn.setAttribute('aria-selected', ativo ? 'true' : 'false');
  });

  document.querySelectorAll('.tab-panel').forEach((panel) => {
    panel.classList.toggle('active', panel.id === `tab-${tabId}`);
  });

  document.getElementById('topbarTitle').textContent = TITULO_POR_ABA[tabId] || '';

  const progresso = PROGRESSO_POR_ABA[tabId];
  const progressBar = document.getElementById('progressBar');
  if (progresso) {
    progressBar.hidden = false;
    document.getElementById('progressFill').style.width = `${progresso}%`;
    progressBar.setAttribute('aria-valuenow', String(progresso));
  } else {
    progressBar.hidden = true;
  }

  // Ao entrar na aba de finalizar, recalcula o resumo com os dados atuais.
  if (tabId === 'finalizar') atualizarResumoPedido();

  fecharSidebar();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/** Abre a gaveta lateral (usado no mobile/tablet). */
function abrirSidebar() {
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('sidebarOverlay').classList.add('visible');
  document.getElementById('btnSidebarToggle').setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

/** Fecha a gaveta lateral. Não faz nada se ela já estiver escondida (desktop). */
function fecharSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('visible');
  document.getElementById('btnSidebarToggle').setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

/** Liga os cliques de navegação: sidebar, botões "data-goto" e a gaveta mobile. */
function iniciarNavegacao() {
  document.querySelectorAll('.nav-link').forEach((btn) => {
    btn.addEventListener('click', () => irParaAba(btn.dataset.tab));
  });

  // Botões espalhados pelas abas com atributo data-goto="idDaAba".
  document.querySelectorAll('[data-goto]').forEach((btn) => {
    btn.addEventListener('click', () => irParaAba(btn.dataset.goto));
  });

  document.getElementById('btnSidebarToggle').addEventListener('click', abrirSidebar);
  document.getElementById('btnSidebarClose').addEventListener('click', fecharSidebar);
  document.getElementById('sidebarOverlay').addEventListener('click', fecharSidebar);

  document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape') fecharSidebar();
  });

  document.getElementById('btnConfirmarPedido').addEventListener('click', confirmarPedido);
  document.getElementById('btnConfirmarPedidoMobile').addEventListener('click', confirmarPedido);

  document.getElementById('btnNovoPedido').addEventListener('click', () => location.reload());
}

/** Ponto de entrada: roda assim que o HTML termina de carregar. */
document.addEventListener('DOMContentLoaded', () => {
  iniciarNavegacao();
  iniciarAreaAdmin();
  iniciarMascarasInput();
  iniciarResumoAoVivo();
  iniciarSimulador();
  iniciarOverlayAgradecimento();
  iniciarFeedback();
  iniciarGaleria();

  carregarCardapio();
  carregarValores();
  carregarFeedbacks();
  carregarGaleria();
});