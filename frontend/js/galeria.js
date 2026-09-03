// ============================================================
// GALERIA — fotos de eventos realizados
// ============================================================
// Busca as fotos cadastradas pela equipe na API, desenha o grid
// da aba "Galeria de Eventos" (+ prévia na página inicial) e
// cuida do lightbox que amplia a foto ao clicar.
// ============================================================

const estadoGaleria = { fotos: [] };

/** Liga os eventos do lightbox (abrir/fechar). */
function iniciarGaleria() {
  const lightbox = document.getElementById('galeriaLightbox');
  const btnFechar = document.getElementById('btnFecharLightbox');
  if (!lightbox || !btnFechar) return;

  btnFechar.addEventListener('click', () => lightbox.close());

  // Fecha ao clicar fora da imagem (na área do ::backdrop nativo do <dialog>).
  lightbox.addEventListener('click', (evento) => {
    if (evento.target === lightbox) lightbox.close();
  });
}

/** Busca as fotos na API e desenha o grid da aba Galeria + prévia da Início. */
async function carregarGaleria() {
  const grid = document.getElementById('gridGaleria');
  const preview = document.getElementById('galeriaPreviewInicio');

  try {
    const fotos = await api.buscarGaleria();
    estadoGaleria.fotos = fotos || [];

    if (estadoGaleria.fotos.length === 0) {
      grid.innerHTML = '<p class="teaser-vazio">Em breve, fotos de festas incríveis por aqui!</p>';
      preview.innerHTML = '<p class="teaser-vazio">Em breve, fotos de festas incríveis por aqui!</p>';
      return;
    }

    grid.innerHTML = estadoGaleria.fotos.map(criarCardGaleria).join('');
    grid.querySelectorAll('.galeria-item').forEach((item) => {
      item.addEventListener('click', () => abrirLightbox(item.dataset.id));
      item.addEventListener('keydown', (evento) => {
        if (evento.key === 'Enter' || evento.key === ' ') {
          evento.preventDefault();
          abrirLightbox(item.dataset.id);
        }
      });
    });

    preview.innerHTML = estadoGaleria.fotos
      .slice(0, 3)
      .map((f) => `<img src="${f.url}" alt="${escaparAtributo(f.titulo)}" loading="lazy" />`)
      .join('');
  } catch (erro) {
    // Mantém a experiência calma mesmo se a rota ainda não existir no back-end.
    grid.innerHTML = '<p class="teaser-vazio">Não foi possível carregar a galeria agora.</p>';
    preview.innerHTML = '<p class="teaser-vazio">Em breve, fotos de festas incríveis por aqui!</p>';
    console.error('Não foi possível carregar a galeria.', erro);
  }
}

/** Monta o HTML de um item do grid da galeria. */
function criarCardGaleria(foto) {
  return `
    <div class="galeria-item" data-id="${foto.id}" tabindex="0" role="button" aria-label="Ampliar foto: ${escaparAtributo(foto.titulo)}">
      <img src="${foto.url}" alt="${escaparAtributo(foto.titulo)}" loading="lazy" />
      <div class="galeria-item-titulo">${escaparAtributo(foto.titulo)}</div>
    </div>`;
}

/** Abre o lightbox com a foto selecionada. */
function abrirLightbox(fotoId) {
  const foto = estadoGaleria.fotos.find((f) => String(f.id) === String(fotoId));
  if (!foto) return;

  document.getElementById('galeriaLightboxImg').src = foto.url;
  document.getElementById('galeriaLightboxImg').alt = foto.titulo;
  document.getElementById('galeriaLightboxTitulo').textContent = foto.titulo;
  document.getElementById('galeriaLightboxDesc').textContent = foto.descricao || '';

  document.getElementById('galeriaLightbox').showModal();
}

function escaparAtributo(texto) {
  const div = document.createElement('div');
  div.textContent = texto ?? '';
  return div.innerHTML;
}
