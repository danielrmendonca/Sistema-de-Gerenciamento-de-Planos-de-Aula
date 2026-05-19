-- ----------MIGRATION: CRIACAO DA TABELA lesson_plans----------
CREATE TABLE IF NOT EXISTS lesson_plans (
  id               SERIAL PRIMARY KEY,
  title            VARCHAR(200)  NOT NULL,
  objective        TEXT          NOT NULL,
  summary          TEXT          NOT NULL,
  scheduled_date   DATE          NOT NULL,
  discipline       VARCHAR(100)  NOT NULL,
  contents         TEXT[]        NOT NULL DEFAULT '{}',
  support_resources TEXT[]       NOT NULL DEFAULT '{}',
  tags             TEXT[]        NOT NULL DEFAULT '{}',
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
