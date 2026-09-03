// ============================================================
// APP — configuração do Express
// ============================================================
// Monta o app: middlewares globais, arquivos estáticos do
// front-end e as rotas da API. Quem efetivamente "liga" o
// servidor é o server.js.
// ============================================================

const path = require('path');
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const saborRoutes = require('./routes/saborRoutes');
const pedidoRoutes = require('./routes/pedidoRoutes');
const configRoutes = require('./routes/configRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const galeriaRoutes = require('./routes/galeriaRoutes');

const app = express();

// --- middlewares globais ---
app.use(cors());               // libera o front-end (mesmo em outra porta/origem) a chamar a API
app.use(express.json());       // permite ler JSON no corpo das requisições (req.body)

// --- arquivos estáticos do front-end (index.html, css, js) ---
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// --- rotas da API ---
app.use('/api/auth', authRoutes);
app.use('/api/sabores', saborRoutes);
app.use('/api/pedidos', pedidoRoutes);
app.use('/api/config', configRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/galeria', galeriaRoutes);

// --- checagem simples de saúde da API ---
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// --- rota não encontrada dentro de /api (evita cair no fallback de estáticos) ---
app.use('/api', (req, res) => res.status(404).json({ erro: 'Rota não encontrada.' }));

// --- tratador de erros central: qualquer next(erro) das rotas cai aqui ---
app.use((erro, req, res, next) => {
  console.error(erro);
  res.status(500).json({ erro: 'Erro interno no servidor. Tente novamente em instantes.' });
});

module.exports = app;
