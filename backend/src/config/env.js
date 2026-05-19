// env.js Lê e valida as variáveis de ambiente do .env, expondo-as de forma segura para o resto do código

// ----------CARREGAMENTO E VALIDACAO DE VARIAVEIS DE AMBIENTE----------
require('dotenv').config();
const { z } = require('zod');

// Schema das variaveis de ambiente esperadas pela aplicacao
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),

  // ----------BANCO DE DADOS----------
  DB_HOST: z.string().min(1).default('localhost'),
  DB_PORT: z.coerce.number().int().positive().default(5432),
  DB_NAME: z.string().min(1).default('lesson_plans'),
  DB_USER: z.string().min(1).default('postgres'),
  DB_PASSWORD: z.string().default(''),

  // ----------INTEGRACAO COM IA (GOOGLE AI STUDIO)----------
  GOOGLE_AI_API_KEY: z.string().optional(),
  GOOGLE_AI_MODEL: z.string().default('gemini-1.5-flash'),
  GOOGLE_AI_TIMEOUT_MS: z.coerce.number().int().positive().default(15000),

  // ----------LOGS----------
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),

  // ----------CORS----------
  CORS_ORIGIN: z.string().default('*'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // Falha cedo se houver variavel obrigatoria invalida
  console.error('Variaveis de ambiente invalidas:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

module.exports = parsed.data;
