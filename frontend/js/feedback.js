// ============================================================
// FEEDBACK — depoimentos de clientes
// ============================================================
// Cuida da aba "Feedback": envia o depoimento do cliente para a
// API e lista os depoimentos existentes (na aba e na prévia da
// página inicial).
// ============================================================

/** Liga o envio do formulário de depoimento. */
function iniciarFeedback() {
  const form = document.getElementById('feedbackForm');
  if (!form) return;

  form.addEventListener('submit', (evento) => {
    evento.preventDefault();
    enviarFeedback();
  });
}

/** Valida e envia o depoimento para a API. */
async function enviarFeedback() {
  const nome = document.getElementById('feedbackNome').value.trim();
  const nota = Number(document.querySelector('input[name="feedbackNota"]:checked').value);
  const comentarioEl = document.getElementById('feedbackComentario');
  const comentario = comentarioEl.value.trim();

  const erroEl = document.getElementById('err-feedback');
  const erroComentarioEl = document.getElementById('err-feedback-comentario');
  const sucessoEl = document.getElementById('sucesso-feedback');
  erroEl.textContent = '';
  sucessoEl.textContent = '';
  erroComentarioEl.textContent = '';
  comentarioEl.classList.remove('error');

  if (!comentario) {
    erroComentarioEl.textContent = 'Conte pra gente como foi a sua festa';
    comentarioEl.classList.add('error');
    return;
  }

  const botao = document.getElementById('btnEnviarFeedback');
  botao.disabled = true;

  try {
    await api.criarFeedback({ nome: nome || 'Cliente Magic Pizza', nota, comentario });
    sucessoEl.textContent = 'Obrigado pelo depoimento! 🍕';
    document.getElementById('feedbackForm').reset();
    carregarFeedbacks();
  } catch (erro) {
    erroEl.textContent = erro.message;
  } finally {
    botao.disabled = false;
  }
}

/** Busca os depoimentos na API e desenha a lista (aba Feedback + prévia da Início). */
async function carregarFeedbacks() {
  const lista = document.getElementById('listaFeedbacks');
  const preview = document.getElementById('feedbackPreviewInicio');

  try {
    const feedbacks = await api.buscarFeedbacks();

    if (!feedbacks || feedbacks.length === 0) {
      lista.innerHTML = '<p class="teaser-vazio">Ainda não há depoimentos. Seja o primeiro a avaliar!</p>';
      preview.innerHTML = '<p class="teaser-vazio">Seja o primeiro a deixar um depoimento!</p>';
      return;
    }

    lista.innerHTML = feedbacks.map(criarCardFeedback).join('');

    preview.innerHTML = feedbacks
      .slice(0, 2)
      .map(
        (f) => `
          <div class="teaser-feedback-item">
            <p>"${escaparHtml(f.comentario)}"</p>
            <span>${escaparHtml(f.nome)} — ${'★'.repeat(f.nota)}${'☆'.repeat(5 - f.nota)}</span>
          </div>`
      )
      .join('');
  } catch (erro) {
    // Mantém a experiência calma mesmo se a rota ainda não existir no back-end.
    lista.innerHTML = `<p class="teaser-vazio">Não foi possível carregar os depoimentos agora.</p>`;
    preview.innerHTML = '<p class="teaser-vazio">Seja o primeiro a deixar um depoimento!</p>';
    console.error('Não foi possível carregar os depoimentos.', erro);
  }
}

/** Monta o HTML de um card de depoimento. */
function criarCardFeedback(feedback) {
  const estrelas = '★'.repeat(feedback.nota) + '☆'.repeat(5 - feedback.nota);
  const data = feedback.criadoEm ? formatarDataFeedback(feedback.criadoEm) : '';

  return `
    <article class="feedback-item">
      <div class="feedback-item-head">
        <span class="feedback-nome">${escaparHtml(feedback.nome)}</span>
        <span class="feedback-estrelas" aria-label="${feedback.nota} de 5 estrelas">${estrelas}</span>
      </div>
      <p class="feedback-comentario">${escaparHtml(feedback.comentario)}</p>
      ${data ? `<span class="feedback-data">${data}</span>` : ''}
    </article>`;
}

/** Evita que texto digitado pelo cliente quebre o HTML da página. */
function escaparHtml(texto) {
  const div = document.createElement('div');
  div.textContent = texto ?? '';
  return div.innerHTML;
}

function formatarDataFeedback(dataStr) {
  try {
    return new Date(dataStr).toLocaleDateString('pt-BR');
  } catch {
    return '';
  }
}
