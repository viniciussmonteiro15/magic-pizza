# Changelog — Revisão de código (Set/2026)

Resumo objetivo de tudo que mudou nesta rodada, para facilitar a conferência
antes de aplicar no repositório real.

## 🔒 Segurança
- Adicionado `backend/.gitignore` (`node_modules/`, `.env`, `data/`).
- **Senha do admin deixou de ser texto puro**: agora o `.env` guarda um hash
  bcrypt (`ADMIN_SENHA_HASH`), gerado com `npm run gerar-senha "senha"`
  (novo script em `backend/utils/gerarHashSenha.js`).
- Adicionado rate limiting simples no login (`backend/middleware/rateLimitMiddleware.js`),
  sem dependências novas: bloqueia um IP após 10 tentativas em 15 minutos.
- **Ação manual que você ainda precisa fazer**: rodar
  `git rm -r --cached backend/node_modules backend/.env` no repositório real
  para tirar esses arquivos do histórico do Git (o `.gitignore` sozinho só
  evita commits *futuros*).

## 🧹 Backend — clean code
- `CONFIG_PADRAO` duplicado em `configRoutes.js` e `pedidoRoutes.js` →
  extraído para `backend/config/constantes.js`.
- Checagens repetidas de campo obrigatório (`!campo || !campo.trim()`) →
  extraídas para `backend/utils/validacao.js` (`textoPreenchido`,
  `camposFaltando`, `urlValida`) e reaproveitadas em `saborRoutes.js`,
  `pedidoRoutes.js`, `galeriaRoutes.js` e `feedbackRoutes.js`.
- `gerarId()` caseiro (`Date.now() + random`) → `crypto.randomUUID()`
  nativo do Node, em `backend/utils/jsonStore.js`.
- `bcryptjs` adicionado ao `package.json`; script `npm run gerar-senha`
  criado.

## 🏷️ Frontend — HTML semântico
- `<mark>` (destaque de texto) usado como badge visual → trocado por
  `<span class="historia-badge">` (2 ocorrências, aba "Nossa História").
- `<dialog>` usado como barra de progresso → trocado por
  `<div role="progressbar">`. Os outros dois `<dialog>` do projeto
  (lightbox da galeria e overlay de agradecimento) **foram mantidos**,
  pois usam `.showModal()`/`.close()` corretamente — são modais de verdade.
- `<fieldset>` em volta de um botão único de navegação (admin) → trocado
  por `<div>`, já que `<fieldset>` deveria agrupar campos de formulário.

## 🎨 Frontend — CSS
- `frontend/css/style.css` (1.277 linhas em um único arquivo) dividido em
  5 arquivos por responsabilidade:
  - `base.css` — tokens (`:root`), reset, ajustes globais (movimento
    reduzido, scrollbar)
  - `layout.css` — estrutura do app (sidebar, topbar, responsividade)
  - `components.css` — botões e overlay de agradecimento
  - `forms.css` — inputs, fieldsets, formulário de pedido, login admin
  - `pages.css` — estilo específico de cada aba (início, história,
    valores, pedido, feedback, galeria)
- Nenhuma regra foi alterada ou removida — só reorganizada. Cada bloco foi
  conferido byte a byte contra o arquivo original antes da entrega.
- `index.html` atualizado para carregar os 5 arquivos via `<link>`
  (carregamento em paralelo pelo navegador, mais rápido que `@import`).

## ✅ Testado
O back-end foi executado localmente após as mudanças: health check,
listagem de cardápio, login com senha correta (gera token) e login com
senha errada (rejeita com 401) — todos funcionando como esperado.

## Não incluído nesta rodada (fica de sugestão para o futuro)
- Migração de `data/*.json` para um banco de dados de verdade
  (SQLite/Postgres), caso o volume do projeto cresça.
- Testes automatizados (não havia nenhum antes).
