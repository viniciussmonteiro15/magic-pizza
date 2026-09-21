# 🍕 Magic Pizza — Rodízio Domiciliar

Site completo (front-end + back-end) para uma empresa fictícia de **rodízio
domiciliar de pizza**. O cliente monta o próprio cardápio, escolhe data e
endereço da festa, acompanha o preço em tempo real e envia o pedido. A equipe
da pizzaria tem uma área administrativa protegida por senha para cadastrar
novos sabores e fotos de eventos.

> ℹ️ Esta versão do README foi revisada para descrever **exatamente o que o
> código faz hoje**. Versões anteriores da documentação mencionavam SQLite,
> bcrypt e uma camada `controllers/services/repositories` que não existem
> mais no projeto — veja a seção [Diferenças em relação à documentação antiga](#-diferenças-em-relação-à-documentação-antiga).

---

## ✨ O que o site faz

O site é uma **SPA de página única** (`index.html`) dividida em abas
controladas por JavaScript puro, sem nenhum framework:

| Aba | O que faz | Acesso |
|---|---|---|
| **Início** | Landing page com chamada para ação, "como funciona" e prévias de galeria/feedback. | Público |
| **Nossa História** | Apresenta a empresa e números da marca. | Público |
| **Consultar Valores** | Preço por pessoa, dimensionamento de equipe e um simulador de preço ao vivo. | Público |
| **Montar Pedido** | Grade com os sabores salgados e doces cadastrados, para o cliente selecionar. | Público |
| **Finalizar Pedido** | Formulário (dados pessoais, pagamento, data/hora, endereço) + resumo em tempo real do pedido e envio para a API. | Público |
| **Feedback** | Lista depoimentos de clientes e permite enviar um novo. | Público |
| **Galeria de Eventos** | Mostra fotos de festas já realizadas. | Público para ver · cadastro exige login |
| **Área da Equipe** | Login por senha; permite cadastrar novos sabores e fotos da galeria. | 🔒 Protegido |

### Regras de negócio principais

- **R$ 40,00 por pessoa**, valor configurável (arquivo de dados, sem precisar mexer em código).
- A cada **25 convidados**, o sistema soma automaticamente **+1 pizzaiolo** e **+1 garçom**.
- O **preço final é sempre recalculado no back-end** a partir da quantidade de pessoas — o valor exibido no navegador nunca é aceito como verdade, para evitar manipulação via DevTools.
- O cadastro de sabores e de fotos da galeria exige um **token de login** (JWT), obtido em `/api/auth/login` com a senha administrativa.

---

## 🗂️ Estrutura do projeto

```
magic-pizza/
├── frontend/                      # tudo que o navegador do cliente carrega
│   ├── index.html                  # página única; cada aba é uma <section class="tab-panel">
│   ├── css/
│   │   └── style.css                # estilos (tokens em :root + componentes)
│   └── js/
│       ├── api.js                    # única camada que fala com a API (fetch)
│       ├── main.js                    # navegação entre abas, sidebar mobile, barra de progresso
│       ├── sabores.js                  # carrega o cardápio e controla a seleção de sabores
│       ├── pedido.js                    # simulador de preço, máscaras de input, resumo e envio do pedido
│       ├── admin.js                      # login administrativo e formulário de cadastro de sabor
│       └── feedback.js / galeria.js       # depoimentos e fotos de eventos
│
├── backend/                       # API em Node.js + Express
│   ├── app.js                      # monta o Express: middlewares, arquivos estáticos e rotas
│   ├── server.js                    # ponto de entrada — lê o .env e sobe o servidor
│   ├── middleware/
│   │   └── authMiddleware.js         # exige um JWT válido nas rotas de admin
│   ├── routes/
│   │   ├── authRoutes.js              # POST /api/auth/login
│   │   ├── saborRoutes.js              # GET  /api/sabores · POST /api/sabores (admin)
│   │   ├── pedidoRoutes.js              # POST /api/pedidos
│   │   ├── configRoutes.js               # GET  /api/config/valores
│   │   ├── feedbackRoutes.js              # GET/POST /api/feedback
│   │   └── galeriaRoutes.js                # GET /api/galeria · POST /api/galeria (admin)
│   ├── utils/
│   │   └── jsonStore.js                    # ler()/escrever()/gerarId() — persistência em arquivos .json
│   ├── data/                       # criado automaticamente na 1ª execução (sabores.json, pedidos.json...)
│   ├── package.json
│   ├── .env.example
│   └── .env                         # ⚠️ NÃO deveria ser versionado — ver seção de Segurança
│
├── README.md
└── TUTORIAL.md
```

### Como as camadas se relacionam

```
Navegador (index.html + js/*.js)
        │  fetch() via api.js
        ▼
Express (app.js) ── monta rotas e serve o front-end estático
        │
        ▼
routes/*.js  ── recebe a requisição, valida o corpo (req.body)
        │        e calcula regras simples (ex.: preço total)
        ▼
utils/jsonStore.js ── lê/escreve os arquivos .json em backend/data/
```

Não há camadas separadas de `controller`/`service`/`repository`: cada
arquivo em `routes/` já contém validação + regra de negócio + chamada de
persistência, porque o volume e a complexidade do projeto ainda não
justificam essa divisão. O comentário no topo de `jsonStore.js` deixa isso
explícito: se o projeto crescer, essa é a única camada que precisa mudar
para migrar para um banco de verdade (Postgres, MongoDB etc.), sem tocar
nas rotas.

### Autenticação

1. A equipe faz `POST /api/auth/login` com `{ senha }`.
2. O back-end compara com `process.env.ADMIN_SENHA` (definida no `.env`).
3. Se bater, devolve um token **JWT** assinado com `JWT_SECRET`, válido por 4 horas.
4. O front-end guarda esse token e o envia como `Authorization: Bearer <token>` nas rotas protegidas (`POST /sabores`, `POST /galeria`).
5. `middleware/authMiddleware.js` verifica o token em toda rota protegida antes de deixá-la executar.

---

## 🛠️ Tecnologias usadas

- **Front-end**: HTML5, CSS3 puro (sem framework) e JavaScript puro (Vanilla JS), organizado em módulos por responsabilidade.
- **Back-end**: [Node.js](https://nodejs.org) + [Express](https://expressjs.com).
- **Persistência**: arquivos JSON (`backend/data/*.json`), lidos e escritos por `backend/utils/jsonStore.js` — sem banco de dados externo.
- **Autenticação**: senha comparada via variável de ambiente + token [JWT](https://jwt.io/) (`jsonwebtoken`) para proteger as rotas de cadastro.
- **CORS**: liberado via pacote `cors`, para permitir chamadas do front-end mesmo se um dia for servido de outra origem.

---

## 🚀 Como rodar o projeto

```bash
cd backend
npm install
cp .env.example .env      # depois edite o .env com sua própria senha/segredo
npm start
```

Abra **http://localhost:3000** — o próprio back-end serve o front-end
estático (`app.use(express.static('../frontend'))`), então não é preciso
rodar dois servidores.

Para desenvolvimento com reinício automático ao salvar arquivos:

```bash
npm run dev
```

Veja o passo a passo detalhado, com explicações para quem nunca mexeu no projeto, em **[TUTORIAL.md](./TUTORIAL.md)**.

---

## 🔒 Segurança e boas práticas — pontos de atenção

- **`.env` e `node_modules` não deveriam ser versionados.** Adicione um `.gitignore` na raiz do `backend/` com `node_modules/`, `.env` e `data/`, e remova-os do histórico do Git (`git rm -r --cached node_modules .env`).
- A senha do admin hoje é comparada **em texto puro** contra o valor do `.env`. Funciona, mas para produção real vale trocar por um hash (`bcryptjs`) — assim, mesmo que o `.env` vaze, a senha original não fica exposta diretamente.
- Não há limite de tentativas em `/api/auth/login`. Um pacote como `express-rate-limit` evita tentativas de força bruta.
- O preço final é sempre recalculado a partir de `config.json` no back-end — o valor que o front-end mostra é só uma prévia, nunca é confiado para gravar o pedido.

---

## 🔁 Diferenças em relação à documentação antiga

Versões anteriores do `README.md`/`TUTORIAL.md` descreviam uma arquitetura
com **SQLite** (`better-sqlite3`), **bcrypt** e camadas
`controllers/services/repositories`. O código atual do repositório **não
usa nada disso** — a persistência é por arquivos JSON e as rotas ficam em
`backend/routes/`, sem camadas intermediárias. Esta versão do README foi
atualizada para descrever fielmente o que está implementado hoje. Se a
migração para um banco relacional (SQLite/Postgres) ainda for um objetivo
do projeto, ela deve ser tratada como um item de roadmap futuro, não como
o estado atual.
