// ============================================================
// CONFIG ROUTES — valores atuais (preço por pessoa, equipe)
// ============================================================

const express = require('express');
const { ler } = require('../utils/jsonStore');

const router = express.Router();

const CONFIG_PADRAO = { precoPorPessoa: 40, pessoasPorEquipe: 25 };

/** GET /api/config/valores — usado pelo simulador e pelo resumo do pedido. */
router.get('/valores', async (req, res, next) => {
  try {
    const config = await ler('config.json', CONFIG_PADRAO);
    res.json(config);
  } catch (erro) {
    next(erro);
  }
});

module.exports = router;
