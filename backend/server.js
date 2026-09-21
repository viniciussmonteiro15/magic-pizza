// ============================================================
// SERVER — ponto de entrada da aplicação
// ============================================================
// Carrega as variáveis de ambiente e liga o servidor Express
// definido em app.js.
// ============================================================

require('dotenv').config();

const app = require('./app');

const PORTA = process.env.PORT || 3000;

if (!process.env.ADMIN_SENHA_HASH || !process.env.JWT_SECRET) {
  console.warn('⚠ Atenção: ADMIN_SENHA_HASH e/ou JWT_SECRET não estão definidos no .env — o login da equipe não vai funcionar.');
  console.warn('  Gere o hash com: npm run gerar-senha "sua-senha-aqui"');
}

app.listen(PORTA, () => {
  console.log(`◇ Magic Pizza rodando em http://localhost:${PORTA}`);
});
