# Magic Pizza — Equipe & Feedback

Tudo numa pasta só:

```
magic-pizza-equipe-feedback/
├── frontend/   React + Vite: abas Equipe, Feedback e Gestão
└── backend/    API Express + SQLite (cadastro, login por RG, disponibilidade, feedback, gestor)
```

## Jeito mais rápido: só o frontend (modo local)

Os dados ficam no navegador. Bom para ver e testar a interface.

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
```

Código de acesso da aba Gestão no modo local: `magic2026`
(em `frontend/src/utils/constants.js`, visível no código, só para demonstração).

## Com o servidor (dados compartilhados entre os aparelhos)

Precisa de **Node 22.13 ou mais novo** (o backend usa o SQLite embutido do Node).

```bash
# 1) Backend
cd backend
npm install
cp .env.example .env   # preencha RG_PEPPER, TOKEN_SECRET e MANAGER_PASSWORD
npm start              # http://localhost:3001

# 2) Frontend, em outro terminal
cd frontend
npm install
echo "VITE_API_URL=http://localhost:3001" > .env.local
npm run dev
```

Para gerar os segredos:
`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

## Testes

```bash
cd backend  && npm test    # 16 testes da API (HTTP de verdade, banco em memória)
cd frontend && npm test    # 16 testes: telas, fluxos e integração com o backend real
```

O teste `frontend/src/__tests__/api-mode.test.js` sobe o backend e roda os serviços do
frontend contra ele; só roda se `backend/` tiver `npm install`.

## O que ainda vale saber

- **Login só com RG** (como pedido) é fraco: o RG não é segredo. Quem souber o RG de um
  colega entra como ele e altera a disponibilidade dele. O servidor limita tentativas por IP,
  mas o ideal é somar uma senha ou PIN por funcionário.
- **Um código de gestor só**, compartilhado. Serve para uma equipe pequena; para várias
  pessoas gestoras com registro de quem fez o quê, seria preciso contas individuais.
- **Cadastro e feedback são públicos** (qualquer pessoa com o endereço pode enviar).
  Há limite por IP, mas não é uma defesa completa contra spam.
- O visual foi validado por build e testes, **não abri num navegador de verdade**.
  Confira no celular e no computador.

Detalhes: `frontend/README.md` e `backend/README.md`.
