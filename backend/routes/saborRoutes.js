// ============================================================
// SABOR ROUTES — cardápio de pizzas (salgadas e doces)
// ============================================================

const express = require('express');
const { ler, escrever, gerarId } = require('../utils/jsonStore');
const { exigirAdmin } = require('../middleware/authMiddleware');

const router = express.Router();
const ARQUIVO = 'sabores.json';

const SABORES_PADRAO = [
  { id: 's1', tipo: 'salgada', nome: 'Mussarela', descricao: 'Molho de tomate, mussarela e orégano' },
  { id: 's2', tipo: 'salgada', nome: 'Calabresa', descricao: 'Calabresa fatiada, cebola e azeitonas' },
  { id: 's3', tipo: 'salgada', nome: 'Quatro Queijos', descricao: 'Mussarela, provolone, parmesão e gorgonzola' },
  { id: 'd1', tipo: 'doce', nome: 'Chocolate com Morango', descricao: 'Chocolate ao leite e morangos frescos' },
  { id: 'd2', tipo: 'doce', nome: 'Banana com Canela', descricao: 'Banana, canela e leite condensado' },
];

/** GET /api/sabores — cardápio público, já separado em salgadas/doces. */
router.get('/', async (req, res, next) => {
  try {
    const sabores = await ler(ARQUIVO, SABORES_PADRAO);
    res.json({
      salgadas: sabores.filter((s) => s.tipo === 'salgada'),
      doces: sabores.filter((s) => s.tipo === 'doce'),
    });
  } catch (erro) {
    next(erro);
  }
});

/** POST /api/sabores — cadastra um novo sabor (apenas equipe autenticada). */
router.post('/', exigirAdmin, async (req, res, next) => {
  try {
    const { nome, descricao, tipo } = req.body || {};

    if (!nome || !nome.trim()) return res.status(400).json({ erro: 'Informe o nome do sabor.' });
    if (!descricao || !descricao.trim()) return res.status(400).json({ erro: 'Informe a descrição do sabor.' });
    if (!['salgada', 'doce'].includes(tipo)) return res.status(400).json({ erro: 'Tipo de sabor inválido.' });

    const sabores = await ler(ARQUIVO, SABORES_PADRAO);
    const novoSabor = { id: gerarId(), nome: nome.trim(), descricao: descricao.trim(), tipo };

    sabores.push(novoSabor);
    await escrever(ARQUIVO, sabores);

    res.status(201).json(novoSabor);
  } catch (erro) {
    next(erro);
  }
});

module.exports = router;
