// ============================================================
// AUTH MIDDLEWARE — protege rotas que só a equipe pode usar
// ============================================================
// Espera um header "Authorization: Bearer <token>" com um JWT
// válido, emitido por POST /api/auth/login. Se estiver ausente
// ou inválido, corta a requisição com 401.
// ============================================================

const jwt = require('jsonwebtoken');

function exigirAdmin(req, res, next) {
  const header = req.headers.authorization || '';
  const [tipo, token] = header.split(' ');

  if (tipo !== 'Bearer' || !token) {
    return res.status(401).json({ erro: 'Faça login na área da equipe para continuar.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== 'admin') throw new Error('role inválida');

    req.admin = true;
    next();
  } catch (erro) {
    return res.status(401).json({ erro: 'Sessão inválida ou expirada. Faça login novamente.' });
  }
}

module.exports = { exigirAdmin };
