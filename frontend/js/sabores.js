// ============================================================
// SABORES — carregamento, renderização e seleção de pizzas
// ============================================================
// Busca o cardápio na API e cuida de toda a aba "Montar Pedido":
// desenhar os cards, marcar/desmarcar seleção e manter os
// contadores atualizados.
// ============================================================

// Estado global de sabores, compartilhado com os outros módulos (pedido.js).
const estadoSabores = {
  cardapio: { salgadas: [], doces: [] }, // dados vindos da API
  selecionadas: new Set(),               // ids dos sabores salgados escolhidos
  selecionadasDoces: new Set(),          // ids dos sabores doces escolhidos
};

/** Busca o cardápio na API e desenha os cards na tela. */
async function carregarCardapio() {
  const gridS = document.getElementById('gridSalgadas');
  const gridD = document.getElementById('gridDoces');

  try {
    const cardapio = await api.buscarCardapio();
    estadoSabores.cardapio = cardapio;

    gridS.innerHTML = '';
    gridD.innerHTML = '';

    cardapio.salgadas.forEach((sabor) => gridS.appendChild(criarCardSabor(sabor, 'salgada')));
    cardapio.doces.forEach((sabor) => gridD.appendChild(criarCardSabor(sabor, 'doce')));
  } catch (erro) {
    gridS.innerHTML = `<p class="field-error">Não foi possível carregar o cardápio: ${erro.message}</p>`;
  }
}

/** Cria o elemento HTML de um card de sabor (com suporte a teclado). */
function criarCardSabor(sabor, tipo) {
  const div = document.createElement('div');
  div.className = 'pizza-card';
  div.dataset.id = sabor.id;
  div.dataset.tipo = tipo;

  // Torna o card operável por teclado (Tab + Enter/Espaço), além do clique/toque.
  div.tabIndex = 0;
  div.setAttribute('role', 'checkbox');
  div.setAttribute('aria-checked', 'false');
  div.setAttribute('aria-label', `${sabor.nome} — ${sabor.descricao}`);

  div.innerHTML = `
    <div class="pizza-check" aria-hidden="true">✓</div>
    <div class="pizza-info">
      <div class="pizza-name">${sabor.nome}</div>
      <div class="pizza-desc">${sabor.descricao}</div>
    </div>
  `;

  div.addEventListener('click', () => alternarSelecaoSabor(div, sabor.id, tipo));
  div.addEventListener('keydown', (evento) => {
    if (evento.key === 'Enter' || evento.key === ' ') {
      evento.preventDefault();
      alternarSelecaoSabor(div, sabor.id, tipo);
    }
  });

  return div;
}

/** Marca ou desmarca um sabor como selecionado. */
function alternarSelecaoSabor(card, saborId, tipo) {
  const conjunto = tipo === 'salgada' ? estadoSabores.selecionadas : estadoSabores.selecionadasDoces;
  const classeSelecionado = tipo === 'salgada' ? 'selected' : 'selected-doce';

  if (conjunto.has(saborId)) {
    conjunto.delete(saborId);
    card.classList.remove(classeSelecionado);
    card.setAttribute('aria-checked', 'false');
  } else {
    conjunto.add(saborId);
    card.classList.add(classeSelecionado);
    card.setAttribute('aria-checked', 'true');
  }

  atualizarContadoresSabores();
}

/** Atualiza os contadores de sabores selecionados (aba "Montar Pedido"). */
function atualizarContadoresSabores() {
  document.getElementById('counterSalgadas').textContent = estadoSabores.selecionadas.size;
  document.getElementById('counterDoces').textContent = estadoSabores.selecionadasDoces.size;

  const total = estadoSabores.selecionadas.size + estadoSabores.selecionadasDoces.size;
  const msg = document.getElementById('pizzaSelectMsg');
  msg.textContent =
    total === 0
      ? 'Selecione ao menos 1 sabor para continuar'
      : `${total} sabor(es) selecionado(s) – você está indo bem! 🍕`;
}

/** Retorna a lista de todos os ids de sabores selecionados (salgados + doces). */
function obterIdsSaboresSelecionados() {
  return [...estadoSabores.selecionadas, ...estadoSabores.selecionadasDoces];
}

/** Retorna os objetos completos (nome, tipo etc.) dos sabores selecionados. */
function obterSaboresSelecionadosCompletos() {
  const todos = [...estadoSabores.cardapio.salgadas, ...estadoSabores.cardapio.doces];
  return todos.filter((sabor) => obterIdsSaboresSelecionados().includes(sabor.id));
}