# Magic Pizza — Equipe & Feedback

Módulo de **gestão de equipe** e **feedback de clientes** para o projeto
[magic-pizza](https://github.com/viniciussmonteiro15/magic-pizza), construído como
uma aplicação React separada, pronta para ser integrada ao frontend existente.

## Rodando localmente

```bash
npm install
npm run dev       # http://localhost:5173
```

Outros comandos:

```bash
npm run build      # build de produção em dist/
npm run preview    # serve o build de produção localmente
npm test           # roda a suíte de testes (Vitest + Testing Library)
```

## O que tem aqui

- **Aba Feedback** (`#feedback`): formulário de avaliação (tipo, nota geral,
  notas por categoria, mensagem), painel de estatísticas (média, distribuição
  de estrelas, médias por categoria) e lista filtrável de avaliações.
- **Aba Gestão** (`#gestao`): protegida por código de gestor. Grade semanal com a
  disponibilidade de toda a equipe, filtro por função e linha de cobertura que
  aponta os dias sem garçom ou sem pizzaiolo ("Ambos" conta nas duas funções).
- **Aba Equipe** (`#equipe`): cadastro de funcionário (nome, RG, idade, CNH,
  cargo) → login por RG em modal → painel privado de disponibilidade semanal
  com presets de horário e linha do tempo visual.

## Estrutura

```
src/
├── App.jsx, main.jsx        # composição raiz e import de todos os CSS
├── styles/                  # tokens.css (paleta/tipografia) e base.css
├── components/
│   ├── layout/               # Header, Footer, PageHeader
│   ├── ui/                    # Button, Field, ChoiceGroup, Modal, Toast,
│   │                           StarRating, Tag, EmptyState — reutilizáveis
│   ├── team/                  # RegisterForm, AuthModal, AvailabilityPanel, TeamTab
│   ├── feedback/               # FeedbackForm, FeedbackStats, FeedbackCard,
│   │                             FeedbackList, FeedbackTab
│   └── manager/                # ManagerGate, ManagerTab, AvailabilityGrid
├── hooks/                    # useHashTab, useSession, useFeedback, useTeam, useDialog
├── services/                  # employeeService, feedbackService, storage
│                                (contrato assíncrono — troque o corpo por
│                                 fetch() para ligar ao backend Express)
├── utils/                     # constants, validators, rg, time, format, feedbackStats
└── __tests__/                  # testes de fluxo completo (Vitest + RTL)
```

## Modo local × modo servidor

Os componentes só conhecem `src/services/employeeService.js`, `feedbackService.js` e
`managerService.js`. Cada um escolhe a implementação:

| `VITE_API_URL` | Implementação | Onde ficam os dados |
|---|---|---|
| vazia | `*.local.js` | `localStorage` do navegador |
| `http://localhost:3001` | `*.api.js` (via `api.js`) | banco do backend |

As duas implementações têm as mesmas assinaturas, então trocar de modo não exige mexer em
nenhum componente. Erros do servidor chegam como `ServiceError` (`code`, `message`,
`status`); um `401` apaga o token vencido e a aba Gestão volta a pedir o código.

## Paleta e tipografia

| Token | Valor | Uso |
|---|---|---|
| `--c-bg` | `#1a222d` | Fundo da aplicação |
| `--c-surface` | `#212b38` | Cartões e superfícies |
| `--c-brass` | `#c9a265` | Acento único (botões, links ativos, estrelas) |
| `--font-display` | Marcellus | Títulos |
| `--font-body` | Hanken Grotesk | Texto corrido |

Tudo isso vive em `src/styles/tokens.css` — é o único lugar que precisa mudar
para reestilizar a aplicação inteira.
