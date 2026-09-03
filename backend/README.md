# Magic Pizza — Back-end

API em Express que serve o front-end estático e expõe as rotas usadas
pelo site (cardápio, pedidos, valores, feedback, galeria e login da equipe).

## Como rodar

```bash
npm install
cp .env.example .env
```

Abra o `.env` e defina:

- `ADMIN_SENHA` — a senha usada para entrar na "Área da Equipe" no site
- `JWT_SECRET` — qualquer string longa e aleatória (usada para assinar o login)

Depois:

```bash
npm start
```

O servidor sobe em `http://localhost:3000` (ou na porta definida em `PORT`)
e já serve o front-end da pasta `../frontend`.

## Estrutura

```
backend/
├── app.js                  # monta o Express (middlewares + rotas)
├── server.js                # ponto de entrada (lê .env e chama app.listen)
├── middleware/
│   └── authMiddleware.js    # protege rotas de admin (verifica o token JWT)
├── routes/
│   ├── authRoutes.js        # POST /api/auth/login
│   ├── saborRoutes.js       # GET/POST /api/sabores
│   ├── pedidoRoutes.js      # POST /api/pedidos
│   ├── configRoutes.js      # GET /api/config/valores
│   ├── feedbackRoutes.js    # GET/POST /api/feedback
│   └── galeriaRoutes.js     # GET/POST /api/galeria
├── utils/
│   └── jsonStore.js         # persistência simples em arquivos .json
└── data/                    # criado automaticamente na primeira execução
```

## Persistência

Os dados ficam em arquivos JSON dentro de `data/` (criados automaticamente
na primeira leitura). É suficiente para o volume de um site institucional
simples. Se o projeto crescer — muitos pedidos simultâneos, múltiplos
atendentes cadastrando ao mesmo tempo — vale migrar para um banco de dados
de verdade (Postgres, MongoDB etc.); as rotas já estão isoladas em
`utils/jsonStore.js` para facilitar essa troca depois.

## Segurança

- A senha da equipe fica só no `.env`, nunca no código.
- O login gera um token JWT válido por 4 horas; as rotas de cadastro
  (`POST /sabores`, `POST /galeria`) exigem esse token no header
  `Authorization: Bearer <token>`.
- Nunca commite o arquivo `.env` de verdade (já está no `.gitignore`).
