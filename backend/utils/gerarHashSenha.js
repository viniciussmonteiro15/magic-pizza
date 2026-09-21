// ============================================================
// GERAR HASH DE SENHA — utilitário de linha de comando
// ============================================================
// Uso:
//   npm run gerar-senha "minha-senha-aqui"
//
// Gera o hash bcrypt da senha informada. Copie o resultado para
// a variável ADMIN_SENHA_HASH no arquivo .env — a senha em texto
// puro nunca precisa ficar salva em lugar nenhum.
// ============================================================

const bcrypt = require('bcryptjs');

const senha = process.argv[2];

if (!senha) {
  console.error('Uso: npm run gerar-senha "sua-senha-aqui"');
  process.exit(1);
}

const SALT_ROUNDS = 10;
const hash = bcrypt.hashSync(senha, SALT_ROUNDS);

console.log('\nHash gerado com sucesso. Copie a linha abaixo para o seu .env:\n');
console.log(`ADMIN_SENHA_HASH=${hash}\n`);
