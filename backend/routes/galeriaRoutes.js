// ============================================================
// GALERIA ROUTES — fotos de eventos realizados
// ============================================================
// Guardamos apenas a URL da imagem (hospedada externamente,
// por exemplo em um serviço de imagens ou storage próprio) —
// não fazemos upload/armazenamento de arquivos aqui.
// ============================================================

const express = require('express');
const { ler, escrever, gerarId } = require('../utils/jsonStore');
const { exigirAdmin } = require('../middleware/authMiddleware');
const { textoPreenchido, urlValida } = require('../utils/validacao');

const router = express.Router();
const ARQUIVO = 'galeria.json';

/** GET /api/galeria — lista pública de fotos, mais recentes primeiro. */
router.get('/', async (req, res, next) => {
  try {
    const fotos = await ler(ARQUIVO, []);
    res.json([...fotos].sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm)));
  } catch (erro) {
    next(erro);
  }
});

/** POST /api/galeria — cadastra uma nova foto (apenas equipe autenticada). */
router.post('/', exigirAdmin, async (req, res, next) => {
  try {
    const { titulo, url, descricao } = req.body || {};

    if (!textoPreenchido(titulo)) return res.status(400).json({ erro: 'Informe o título do evento.' });

    if (!urlValida(url)) {
      return res.status(400).json({ erro: 'Informe uma URL de imagem válida (começando com http:// ou https://).' });
    }

    const foto = {
      id: gerarId(),
      titulo: titulo.trim(),
      url: url.trim(),
      descricao: descricao ? descricao.trim() : '',
      criadoEm: new Date().toISOString(),
    };

    const fotos = await ler(ARQUIVO, []);
    fotos.push(foto);
    await escrever(ARQUIVO, fotos);

    res.status(201).json(foto);
  } catch (erro) {
    next(erro);
  }
});

module.exports = router;
