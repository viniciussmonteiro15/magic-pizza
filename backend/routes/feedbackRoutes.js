// ============================================================
// FEEDBACK ROUTES — depoimentos de clientes
// ============================================================

const express = require('express');
const { ler, escrever, gerarId } = require('../utils/jsonStore');

const router = express.Router();
const ARQUIVO = 'feedbacks.json';

/** GET /api/feedback — lista pública, mais recentes primeiro. */
router.get('/', async (req, res, next) => {
  try {
    const feedbacks = await ler(ARQUIVO, []);
    res.json([...feedbacks].sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm)));
  } catch (erro) {
    next(erro);
  }
});

/** POST /api/feedback — qualquer cliente pode enviar (sem login). */
router.post('/', async (req, res, next) => {
  try {
    const { nome, nota, comentario } = req.body || {};

    const notaNum = Number(nota);
    if (!Number.isInteger(notaNum) || notaNum < 1 || notaNum > 5) {
      return res.status(400).json({ erro: 'A nota deve ser um número inteiro de 1 a 5.' });
    }

    if (!comentario || !comentario.trim()) {
      return res.status(400).json({ erro: 'Escreva um comentário sobre a sua experiência.' });
    }

    const feedback = {
      id: gerarId(),
      nome: nome && nome.trim() ? nome.trim() : 'Cliente Magic Pizza',
      nota: notaNum,
      comentario: comentario.trim().slice(0, 600),
      criadoEm: new Date().toISOString(),
    };

    const feedbacks = await ler(ARQUIVO, []);
    feedbacks.push(feedback);
    await escrever(ARQUIVO, feedbacks);

    res.status(201).json(feedback);
  } catch (erro) {
    next(erro);
  }
});

module.exports = router;
