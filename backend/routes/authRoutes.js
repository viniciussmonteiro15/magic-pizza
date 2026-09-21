// ============================================================
// AUTH ROUTES — login da área da equipe
// ============================================================
// A senha nunca fica em texto puro: o .env guarda apenas o hash
// bcrypt dela (ADMIN_SENHA_HASH), gerado com
// `npm run gerar-senha "sua-senha"`. Login correto = token JWT
// válido por 4 horas. Um rate limiter simples (ver
// middleware/rateLimitMiddleware.js) bloqueia tentativas
// repetidas de força bruta.
// ============================================================

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const { limitarTentativasLogin } = require('../middleware/rateLimitMiddleware');

const router = express.Router();

router.post('/login', limitarTentativasLogin, async (req, res) => {
  const { senha } = req.body || {};

  if (!senha || typeof senha !== 'string') {
    return res.status(400).json({ erro: 'Informe a senha de acesso.' });
  }

  if (!process.env.ADMIN_SENHA_HASH || !process.env.JWT_SECRET) {
    console.error('ADMIN_SENHA_HASH ou JWT_SECRET não configurados no .env');
    return res.status(500).json({ erro: 'Login indisponível no momento. Avise a equipe técnica.' });
  }

  const senhaCorreta = await bcrypt.compare(senha, process.env.ADMIN_SENHA_HASH);

  if (!senhaCorreta) {
    return res.status(401).json({ erro: 'Senha incorreta.' });
  }

  const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '4h' });

  res.json({ token });
});

module.exports = router;
