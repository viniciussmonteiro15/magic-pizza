// ============================================================
// PEDIDO ROUTES — recebe os pedidos finalizados pelo cliente
// ============================================================

const express = require('express');
const { ler, escrever, gerarId } = require('../utils/jsonStore');
const { camposFaltando } = require('../utils/validacao');
const { CONFIG_PADRAO } = require('../config/constantes');

const router = express.Router();
const ARQUIVO = 'pedidos.json';

const CAMPOS_OBRIGATORIOS = [
  'nomeCompleto', 'cpf', 'whatsapp', 'formaPagamento',
  'quantidadePessoas', 'dataEvento', 'horaEvento', 'rua', 'bairro', 'cidade',
];

/** POST /api/pedidos — valida, calcula o preço total e salva o pedido. */
router.post('/', async (req, res, next) => {
  try {
    const dados = req.body || {};

    const faltando = camposFaltando(dados, CAMPOS_OBRIGATORIOS);

    if (faltando.length > 0) {
      return res.status(400).json({ erro: `Campos obrigatórios faltando: ${faltando.join(', ')}.` });
    }

    const quantidadePessoas = Number(dados.quantidadePessoas);
    if (!Number.isFinite(quantidadePessoas) || quantidadePessoas < 1) {
      return res.status(400).json({ erro: 'Quantidade de pessoas inválida.' });
    }

    if (!Array.isArray(dados.saborIds) || dados.saborIds.length === 0) {
      return res.status(400).json({ erro: 'Selecione ao menos um sabor.' });
    }

    const config = await ler('config.json', CONFIG_PADRAO);
    const precoTotal = quantidadePessoas * config.precoPorPessoa;

    const pedido = {
      id: gerarId(),
      nomeCompleto: String(dados.nomeCompleto).trim(),
      cpf: String(dados.cpf).trim(),
      whatsapp: String(dados.whatsapp).trim(),
      formaPagamento: String(dados.formaPagamento).trim(),
      quantidadePessoas,
      dataEvento: dados.dataEvento,
      horaEvento: dados.horaEvento,
      rua: String(dados.rua).trim(),
      bairro: String(dados.bairro).trim(),
      cidade: String(dados.cidade).trim(),
      referencia: dados.referencia ? String(dados.referencia).trim() : '',
      saborIds: dados.saborIds,
      preco_total: precoTotal,
      criadoEm: new Date().toISOString(),
    };

    const pedidos = await ler(ARQUIVO, []);
    pedidos.push(pedido);
    await escrever(ARQUIVO, pedidos);

    res.status(201).json(pedido);
  } catch (erro) {
    next(erro);
  }
});

module.exports = router;
