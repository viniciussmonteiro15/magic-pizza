# 🧑‍💻 TUTORIAL — Guia para Desenvolvedores

Este guia explica, passo a passo, como rodar o projeto do zero e onde mexer para
alterar cada parte do site (visual, estrutura das páginas, comportamento e back-end).

---

## 1. Pré-requisitos

- [Node.js](https://nodejs.org) versão 18 ou superior instalado (inclui o `npm`).
- Um editor de código, como o [VS Code](https://code.visualstudio.com/).
- Nenhum banco de dados externo precisa ser instalado — o projeto usa SQLite, que
  funciona em um único arquivo, criado automaticamente.

Para conferir se o Node está instalado, rode no terminal:

```bash
node -v
npm -v
```

---

## 2. Rodando o back-end (API + banco de dados)

Todo o site — inclusive o front-end — é servido pelo back-end. Ou seja, você só
precisa rodar **um** processo para o site inteiro funcionar.

```bash
# 1. Entre na pasta do backend
cd backend

# 2. Instale as dependências (só precisa fazer isso uma vez)
npm install

# 3. Crie o arquivo de variáveis de ambiente a partir do exemplo
cp .env.example .env
```

### 2.1. Configurando a senha da área administrativa

A senha do cadastro de sabores não fica escrita em nenhum arquivo — você gera um
"hash" dela (uma versão embaralhada e irreversível) e cola esse hash no `.env`.

```bash
npm run gerar-senha "escolha-uma-senha-forte"
```

Isso vai imprimir algo como:

```
Adicione esta linha ao seu arquivo .env:

ADMIN_PASSWORD_HASH=$2a$10$g67olmsHgpaU4GEyKm9SguYuAY1k2Azn3zd/bdWIU/kU9jSnLX1Cu
```

Copie essa linha para dentro do arquivo `.env` (substituindo a linha
`ADMIN_PASSWORD_HASH=` que já está lá).

### 2.2. Subindo o servidor

```bash
npm start
```

Se tudo deu certo, você verá no terminal:

```
🍕 Magic Pizza rodando em http://localhost:3000
```

Abra **http://localhost:3000** no navegador — o site completo (front-end + API) vai
estar funcionando ali. Na primeira vez que o servidor sobe, o banco de dados é criado
automaticamente (arquivo `backend/database/magic_pizza.db`) e já vem populado com os
50 sabores originais e o preço padrão de R$ 40,00 por pessoa.

> 💡 Durante o desenvolvimento, use `npm run dev` em vez de `npm start`: o servidor
> reinicia sozinho sempre que você salva um arquivo do backend.

---

## 3. Mexendo no HTML (`frontend/index.html`)

O HTML está dividido em `<section class="tab-panel" id="tab-...">`, uma para cada
aba do menu. Para adicionar um campo novo em um formulário, por exemplo, procure a
seção correspondente e siga o padrão já usado:

```html
<div class="form-group">
    <label for="meuCampo">Meu Campo <span class="req">*</span></label>
    <input type="text" id="meuCampo" placeholder="Exemplo" required />
    <span class="field-error" id="err-meuCampo"></span>
</div>
```

- `class="req"` marca campos obrigatórios com um asterisco vermelho.
- `<span class="field-error">` é onde a mensagem de erro daquele campo aparece
  (preenchida via JavaScript, veja `frontend/js/pedido.js`).

Se adicionar um campo novo ao formulário de "Finalizar Pedido", lembre-se de:
1. Ler o valor dele em `js/pedido.js`, na função `confirmarPedido()`.
2. Adicionar a validação correspondente em `backend/services/pedidoService.js`.
3. Adicionar a coluna no banco em `backend/database/schema.sql` (tabela `pedidos`).

---

## 4. Mexendo no CSS (`frontend/css/style.css`)

Todo o visual é controlado por variáveis no topo do arquivo, dentro de `:root`:

```css
:root {
  --black:      #121212;  /* fundo principal do site */
  --black-soft: #1A1A1A;  /* fundo de cabeçalho e caixas secundárias */
  --black-card: #1F1F1F;  /* fundo dos cartões (cards) */
  --red:        #D6362C;  /* vermelho de destaque (botões, seleção, preço) */
  --red-light:  #EA5248;  /* vermelho mais claro (hover, títulos em destaque) */
  --white:      #F7F5F2;  /* texto principal */
  --radius:     18px;     /* arredondamento das bordas — aumente/diminua para
                              deixar o visual mais ou menos "suave" */
}
```

Para mudar a cor de destaque do site inteiro, por exemplo, basta alterar o valor de
`--red` — todos os botões, bordas de seleção e textos em vermelho mudam juntos.

O CSS está organizado em blocos, com comentários indicando a qual aba cada bloco
pertence (ex.: `/* ABA — MONTAR PEDIDO */`). Use `Ctrl+F` para achar rápido a seção
que você quer alterar.

---

## 5. Mexendo no JavaScript do front-end (`frontend/js/`)

O JS está dividido em módulos, cada um com uma responsabilidade (isso é o que o
enunciado chama de "código organizado" — cada arquivo faz uma coisa só):

| Arquivo | Responsabilidade |
|---|---|
| `api.js` | Único lugar que faz `fetch()` para o back-end. Se a URL da API mudar, só aqui precisa ser ajustado. |
| `sabores.js` | Busca o cardápio na API, desenha os cards de pizza e controla quais estão selecionados. |
| `admin.js` | Login da área administrativa e envio do formulário de cadastro de sabor. |
| `pedido.js` | Máscaras de CPF/WhatsApp, simulador de preço, resumo em tempo real e envio do pedido final. |
| `main.js` | "Liga tudo": troca de abas e chama as funções de inicialização dos outros arquivos quando a página carrega. |

Os arquivos são carregados nessa ordem no `index.html` — respeite essa ordem se
adicionar um script novo, pois `main.js` depende de funções definidas nos arquivos
anteriores.

### Exemplo: como adicionar uma nova aba pública

1. No `index.html`, adicione um botão no `<nav class="tab-nav">`:
   ```html
   <button class="tab-btn" data-tab="minhaAba">Minha Aba</button>
   ```
2. Adicione a seção correspondente dentro de `<main>`:
   ```html
   <section class="tab-panel" id="tab-minhaAba">
     <!-- conteúdo -->
   </section>
   ```
3. Pronto — a navegação em `main.js` já funciona automaticamente para qualquer aba
   que siga o padrão `data-tab="x"` / `id="tab-x"`, sem precisar mexer no JS.

---

## 6. Mexendo no back-end

O back-end segue o padrão **routes → controllers → services → repositories**.
Ao adicionar uma funcionalidade nova, o fluxo normal é:

1. **`repositories/`** — escreva a query SQL (ex.: buscar/inserir algo no banco).
2. **`services/`** — escreva a regra de negócio (validações, cálculos) que usa o
   repository.
3. **`controllers/`** — receba a requisição HTTP, chame o service e devolva a
   resposta.
4. **`routes/`** — registre a nova rota apontando para o controller.
5. Se a rota precisar de senha (como o cadastro de sabor), adicione o middleware
   `exigirLoginAdmin` na rota (veja `routes/saborRoutes.js` como exemplo).

### Exemplo: alterando o preço por pessoa

O preço não está "fixo" no código — ele mora na tabela `configuracoes` do banco.
Para mudá-lo sem editar código, você pode rodar diretamente no terminal (com o
servidor **parado**):

```bash
cd backend
node -e "
const { db } = require('./config/database');
db.prepare(\"UPDATE configuracoes SET valor = ? WHERE chave = 'preco_por_pessoa'\").run('45');
console.log('Preço atualizado para R\$45');
"
```

O site vai passar a usar o novo valor automaticamente (a aba "Consultar Valores" e o
cálculo do pedido buscam esse valor via `GET /api/config/valores`).

### Migrando de SQLite para MySQL/PostgreSQL (opcional)

O projeto usa SQLite por ser simples de rodar sem instalar nada. Se, no futuro, você
quiser usar MySQL ou PostgreSQL:

1. Troque a dependência `better-sqlite3` por `mysql2` (ou `pg`) no `package.json`.
2. Reescreva `backend/config/database.js` para abrir a conexão com o novo banco.
3. No `backend/database/schema.sql`, troque `INTEGER PRIMARY KEY AUTOINCREMENT` por
   `INT AUTO_INCREMENT PRIMARY KEY` (MySQL) ou `SERIAL PRIMARY KEY` (PostgreSQL).
4. Os arquivos em `repositories/` usam SQL bem simples (`SELECT`, `INSERT`,
   `UPDATE`) — a sintaxe é praticamente igual nos três bancos, então a quantidade de
   ajuste necessária é pequena.

---

## 7. Testando as rotas da API manualmente

Com o servidor rodando, você pode testar a API direto pelo terminal com `curl`:

```bash
# Ver o cardápio
curl http://localhost:3000/api/sabores

# Ver os valores atuais
curl http://localhost:3000/api/config/valores

# Fazer login administrativo
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"senha":"escolha-uma-senha-forte"}'

# Cadastrar um sabor (troque SEU_TOKEN pelo token recebido no login acima)
curl -X POST http://localhost:3000/api/sabores \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{"nome":"Marguerita Especial","descricao":"Molho, mussarela de búfala, manjericão fresco","tipo":"salgada"}'
```

---

## 8. Dúvidas frequentes

**O site abre em branco / os sabores não aparecem.**
Confira se o back-end está rodando (`npm start` dentro de `backend/`) e se você está
acessando `http://localhost:3000` (e não abrindo o `index.html` direto no navegador
com duplo clique — nesse caso o `fetch()` para a API não funciona).

**Mudei o `.env` mas nada mudou.**
É preciso reiniciar o servidor (`Ctrl+C` e `npm start` de novo) depois de editar o
`.env` — ele só é lido quando o processo sobe.

**Esqueci a senha da área administrativa.**
Gere um novo hash com `npm run gerar-senha "nova-senha"` e substitua o valor de
`ADMIN_PASSWORD_HASH` no `.env`, depois reinicie o servidor.
