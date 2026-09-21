// ============================================================
// CONFIG ROUTES — valores atuais (preço por pessoa, equipe)
// ============================================================

const express = require('express');
const { ler } = require('../utils/jsonStore');
const { CONFIG_PADRAO } = require('../config/constantes');

const router = express.Router();

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
