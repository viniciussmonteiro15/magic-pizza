// ============================================================
// SERVER — ponto de entrada da aplicação
// ============================================================
// Carrega as variáveis de ambiente e liga o servidor Express
// definido em app.js.
// ============================================================

require('dotenv').config();

const app = require('./app');

const PORTA = process.env.PORT || 3000;

if (!process.env.ADMIN_SENHA || !process.env.JWT_SECRET) {
  console.warn('⚠ Atenção: ADMIN_SENHA e/ou JWT_SECRET não estão definidos no .env — o login da equipe não vai funcionar.');
}

app.listen(PORTA, () => {
  console.log(`◇ Magic Pizza rodando em http://localhost:${PORTA}`);
});
