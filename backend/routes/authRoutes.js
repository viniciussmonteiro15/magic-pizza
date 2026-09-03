// ============================================================
// AUTH ROUTES — login da área da equipe
// ============================================================
// A senha correta fica só no .env (ADMIN_SENHA), nunca no
// código-fonte. Login correto = token JWT válido por 4 horas.
// ============================================================

const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();

router.post('/login', (req, res) => {
  const { senha } = req.body || {};

  if (!senha || typeof senha !== 'string') {
    return res.status(400).json({ erro: 'Informe a senha de acesso.' });
  }

  if (!process.env.ADMIN_SENHA || !process.env.JWT_SECRET) {
    console.error('ADMIN_SENHA ou JWT_SECRET não configurados no .env');
    return res.status(500).json({ erro: 'Login indisponível no momento. Avise a equipe técnica.' });
  }

  if (senha !== process.env.ADMIN_SENHA) {
    return res.status(401).json({ erro: 'Senha incorreta.' });
  }

  const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '4h' });

  res.json({ token });
});

module.exports = router;
