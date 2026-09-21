// ============================================================
// JSON STORE — persistência simples em arquivos .json
// ============================================================
// Este projeto não usa um banco de dados de verdade: os dados
// ficam em arquivos JSON dentro de backend/data/. É suficiente
// para o volume de um site institucional simples. Se o projeto
// crescer, troque estas funções por chamadas a um banco real
// (Postgres, MongoDB etc.) sem precisar mexer nas rotas.
// ============================================================

const fs = require('fs/promises');
const path = require('path');
const { randomUUID } = require('crypto');

const DATA_DIR = path.join(__dirname, '..', 'data');

/** Lê um arquivo JSON da pasta data/. Se não existir, cria com o valor padrão. */
async function ler(nomeArquivo, valorPadrao) {
  const caminho = path.join(DATA_DIR, nomeArquivo);

  try {
    const conteudo = await fs.readFile(caminho, 'utf8');
    return JSON.parse(conteudo);
  } catch (erro) {
    if (erro.code === 'ENOENT') {
      await escrever(nomeArquivo, valorPadrao);
      return valorPadrao;
    }
    throw erro;
  }
}

/** Escreve (sobrescrevendo) um arquivo JSON na pasta data/. */
async function escrever(nomeArquivo, dados) {
  const caminho = path.join(DATA_DIR, nomeArquivo);
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(caminho, JSON.stringify(dados, null, 2), 'utf8');
}

/** Gera um id único usando o gerador nativo do Node (sem dependências externas). */
function gerarId() {
  return randomUUID();
}

module.exports = { ler, escrever, gerarId };
