// ============================================================
// RATE LIMIT — proteção simples contra força bruta no login
// ============================================================
// Implementação em memória (sem dependências externas): guarda
// quantas tentativas cada IP fez numa janela de tempo. Para um
// site institucional de baixo tráfego isso já resolve; se o
// projeto crescer para múltiplas instâncias do servidor, troque
// por uma solução com Redis (ex.: pacote `rate-limiter-flexible`).
// ============================================================

const JANELA_MS = 15 * 60 * 1000; // 15 minutos
const MAX_TENTATIVAS = 10;

/** Mapa: ip -> { tentativas, expiraEm } */
const tentativasPorIp = new Map();

function limparExpirados(agora) {
  for (const [ip, registro] of tentativasPorIp) {
    if (registro.expiraEm <= agora) tentativasPorIp.delete(ip);
  }
}

/** Middleware que bloqueia um IP após MAX_TENTATIVAS dentro da JANELA_MS. */
function limitarTentativasLogin(req, res, next) {
  const agora = Date.now();
  limparExpirados(agora);

  const ip = req.ip;
  const registro = tentativasPorIp.get(ip) || { tentativas: 0, expiraEm: agora + JANELA_MS };

  if (registro.tentativas >= MAX_TENTATIVAS) {
    const minutosRestantes = Math.ceil((registro.expiraEm - agora) / 60000);
    return res.status(429).json({
      erro: `Muitas tentativas de login. Tente novamente em ${minutosRestantes} minuto(s).`,
    });
  }

  registro.tentativas += 1;
  tentativasPorIp.set(ip, registro);

  next();
}

module.exports = { limitarTentativasLogin };
