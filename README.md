# 🍕 Magic Pizza — Rodízio Domiciliar

Site completo (front-end + back-end + banco de dados) para uma empresa fictícia de
**rodízio domiciliar de pizza**. O cliente escolhe os sabores, informa os dados do
evento e finaliza o pedido; a equipe da pizzaria cadastra novos sabores em uma área
administrativa protegida por senha.

---

## ✨ O que o site faz

O site é dividido em 5 abas:

| Aba | O que faz | Acesso |
|---|---|---|
| **Nossa História** | Apresenta a empresa, como funciona o rodízio domiciliar e números da marca. | Público |
| **Consultar Valores** | Mostra o preço por pessoa, como a equipe é dimensionada e um simulador de preço. | Público |
| **Montar Pedido** | Grade com todos os sabores salgados (até 40) e doces (até 10) para o cliente escolher. | Público |
| **Finalizar Pedido** | Formulário com nome completo, CPF, WhatsApp, forma de pagamento, data/hora, endereço e quantidade de convidados. Mostra em tempo real os sabores escolhidos, o tamanho da equipe e o preço final, e envia o pedido para o banco de dados. | Público |
| **Cadastrar Sabor** | Formulário para cadastrar novos sabores no cardápio. | **Protegido por senha** (login administrativo) |

Regras de negócio principais:

- **R$ 40,00 por pessoa** (valor configurável no banco, sem precisar mexer no código).
- A cada **25 convidados**, o sistema calcula automaticamente **1 pizzaiolo + 1 garçom** extra.
- O **preço final é sempre calculado no back-end** (nunca confiando em valores vindos do navegador), para evitar que alguém manipule o preço pelo DevTools do navegador.
- O cadastro de sabores exige **login com senha** — só quem souber a senha administrativa consegue adicionar sabores ao cardápio público.

---

## 🗂️ Estrutura do projeto

```
magic-pizza/
├── frontend/                  # HTML, CSS e JS que o navegador do cliente carrega
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── api.js             # todas as chamadas à API (fetch)
│       ├── sabores.js          # renderização e seleção de sabores
│       ├── admin.js            # login e cadastro de sabores
│       ├── pedido.js           # validação, resumo e envio do pedido
│       └── main.js             # navegação entre abas e inicialização
│
├── backend/                   # API em Node.js + Express
│   ├── config/                 # configuração (env, conexão com o banco)
│   ├── controllers/            # recebem a requisição HTTP e chamam os services
│   ├── services/                # regras de negócio (validações, cálculos)
│   ├── repositories/            # acesso direto ao banco de dados (SQL)
│   ├── routes/                  # definição das rotas da API
│   ├── middlewares/              # proteção de rotas (login administrativo)
│   ├── database/
│   │   ├── schema.sql            # criação das tabelas
│   │   └── seed.js                # dados iniciais (cardápio + preço)
│   ├── utils/
│   │   └── gerarHashSenha.js       # gera o hash da senha do admin
│   ├── app.js                       # configuração do Express
│   ├── server.js                    # ponto de entrada (sobe o servidor)
│   ├── package.json
│   └── .env.example
│
├── README.md                  # este arquivo
└── TUTORIAL.md                 # guia passo a passo para desenvolvedores
```

Essa organização segue o padrão **Controller → Service → Repository**:

- **Controller**: fala com o mundo HTTP (recebe `req`, devolve `res`).
- **Service**: contém as regras de negócio (validações, cálculos de preço, limites do cardápio).
- **Repository**: é a única camada que sabe escrever SQL e conversar com o banco.

Isso deixa o código organizado e fácil de dar manutenção: se um dia o banco mudar de
SQLite para MySQL, por exemplo, só a camada `repositories/` e `config/database.js`
precisam ser tocadas — o resto do sistema nem percebe a diferença.

---

## 🛠️ Tecnologias usadas

- **Front-end**: HTML5, CSS3 (puro, sem framework) e JavaScript puro (Vanilla JS).
- **Back-end**: [Node.js](https://nodejs.org) + [Express](https://expressjs.com).
- **Banco de dados**: SQL, via [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) — um banco SQL real, salvo em um único arquivo, sem precisar instalar um servidor de banco separado. Veja o `TUTORIAL.md` para instruções de como migrar para MySQL ou PostgreSQL, se preferir.
- **Autenticação**: senha com hash [bcrypt](https://www.npmjs.com/package/bcryptjs) + token [JWT](https://jwt.io/) para proteger o cadastro de sabores.

---

## 🚀 Como rodar o projeto

Veja o passo a passo completo, com explicações para quem nunca mexeu no projeto, no
**[TUTORIAL.md](./TUTORIAL.md)**. Resumo rápido:

```bash
cd backend
npm install
cp .env.example .env
npm run gerar-senha "sua-senha-aqui"   # copie o hash gerado para dentro do .env
npm start
```

Depois é só abrir **http://localhost:3000** no navegador — o próprio back-end já serve
o front-end, então não é preciso rodar dois servidores.

---

## 🔒 Sobre a área administrativa

A senha da aba **Cadastrar Sabor** nunca fica salva em texto puro: você gera um hash
bcrypt dela (com `npm run gerar-senha`) e coloca esse hash no `.env`. Quando alguém
faz login, o back-end compara a senha digitada com o hash — a senha original nunca
trafega nem fica guardada em lugar nenhum além da cabeça de quem a criou.
