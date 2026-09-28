# Magic Pizza — API

Express + SQLite. Estrutura em camadas: **rotas → serviços → repositórios**.

```
src/
├── server.js, app.js, config.js, db.js
├── routes/index.js            # todas as rotas
├── services/                  # regras (validação, login, tokens)
├── repositories/              # único lugar com SQL
├── middleware/                # auth por papel, limite de tentativas
└── utils/                     # validação, segurança, erros
schema.sql                     # tabelas
test/                          # testes HTTP (node:test)
```

## Rodar

Node **22.13+**. `cp .env.example .env`, preencha os segredos e `npm install && npm start`.
O servidor se recusa a subir se `RG_PEPPER` ou `TOKEN_SECRET` tiverem menos de 16 caracteres.

## Rotas (`/api`)

| Método e rota | Quem acessa | O que faz |
|---|---|---|
| `GET /health` | todos | verifica se está no ar |
| `POST /employees` | todos (limitado por IP) | cadastra funcionário |
| `POST /auth/login` `{ rg }` | todos (limitado por IP) | devolve `{ token, employee }` |
| `GET /employees/me` | funcionário | dados do próprio funcionário |
| `PUT /employees/me/availability` | funcionário | salva a semana `{ disponibilidade }` |
| `GET /feedback` | todos | últimas 200 avaliações |
| `POST /feedback` | todos (limitado por IP) | envia avaliação |
| `POST /manager/login` `{ codigo }` | todos (limitado por IP) | devolve `{ token }` de gestor |
| `GET /manager/team` | gestor | equipe com a disponibilidade de todos |

Erros seguem `{ "error": { "code", "message", "details?" } }`.
Tokens vão em `Authorization: Bearer <token>`; duram 12 h (funcionário) e 8 h (gestor).

## Como o RG é tratado

O RG nunca é gravado nem devolvido. O banco guarda só `HMAC-SHA256(RG, RG_PEPPER)` para
localizar o funcionário no login. Trocar `RG_PEPPER` depois de haver cadastros faz todos
os logins por RG deixarem de funcionar. Um RG tem poucas combinações possíveis, então quem
obtiver o banco **e** o `RG_PEPPER` consegue descobrir RGs por tentativa: proteja os dois.

## Usar outro banco (o do seu repositório original)

Eu não consegui abrir a pasta do backend do repositório `magic-pizza` (o GitHub bloqueia a
leitura automática), então esta API é independente e usa tabelas próprias. Para ligar a
outro banco:

1. Adapte `schema.sql` (tipos de data e booleano) e crie as tabelas no seu banco.
2. Reescreva só `src/db.js` e `src/repositories/*.js`. Serviços, rotas e testes não mudam,
   desde que os repositórios devolvam os mesmos objetos.
3. Se o banco for assíncrono (PostgreSQL, MySQL), os repositórios passam a devolver Promises:
   adicione `await` nos serviços e `async` nos handlers de `routes/index.js`.

## Antes de publicar

- Sirva atrás de HTTPS (o token viaja em cabeçalho).
- `CORS_ORIGIN` = endereço real do frontend.
- Atrás de proxy (Render, Railway, Nginx): `TRUST_PROXY=1`, senão o limite de tentativas
  enxerga o IP do proxy e conta todo mundo junto.
- O limite de tentativas fica na memória do processo: reiniciar zera, e com várias
  instâncias cada uma conta separado.
- Faça backup do arquivo `DB_FILE`.
