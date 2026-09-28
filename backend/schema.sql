-- Dialeto SQLite. Para PostgreSQL/MySQL: troque TEXT de datas por TIMESTAMP,
-- INTEGER de "ativo" por BOOLEAN e adapte os CHECKs; a estrutura é a mesma.

CREATE TABLE IF NOT EXISTS employees (
  id         TEXT PRIMARY KEY,
  nome       TEXT NOT NULL,
  -- HMAC(RG normalizado, RG_PEPPER). O RG em si nunca é gravado.
  rg_lookup  TEXT NOT NULL UNIQUE,
  idade      INTEGER NOT NULL CHECK (idade BETWEEN 16 AND 75),
  cnh        TEXT NOT NULL CHECK (cnh IN ('sim', 'nao')),
  cargo      TEXT NOT NULL CHECK (cargo IN ('garcom', 'pizzaiolo', 'ambos')),
  criado_em  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS availability (
  employee_id TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  dia         TEXT NOT NULL CHECK (dia IN ('seg','ter','qua','qui','sex','sab','dom')),
  ativo       INTEGER NOT NULL DEFAULT 0 CHECK (ativo IN (0, 1)),
  inicio      TEXT NOT NULL DEFAULT '18:00',
  fim         TEXT NOT NULL DEFAULT '23:00',
  PRIMARY KEY (employee_id, dia)
);

CREATE TABLE IF NOT EXISTS feedback (
  id         TEXT PRIMARY KEY,
  nome       TEXT NOT NULL DEFAULT '',
  tipo       TEXT NOT NULL CHECK (tipo IN ('elogio', 'sugestao', 'reclamacao')),
  nota       INTEGER NOT NULL CHECK (nota BETWEEN 1 AND 5),
  categorias TEXT NOT NULL DEFAULT '{}',   -- JSON: { "pizzas": 5, "atendimento": 4 }
  mensagem   TEXT NOT NULL,
  criado_em  TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_feedback_criado_em ON feedback (criado_em DESC);
