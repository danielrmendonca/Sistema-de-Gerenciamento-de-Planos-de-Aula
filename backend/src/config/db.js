//db.js Cria e exporta o pool de conexões com o PostgreSQL  

// ----------POOL DE CONEXOES POSTGRESQL----------
const { Pool } = require('pg');
const env = require('./env');
const logger = require('./logger');

const pool = new Pool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  logger.error({ err }, 'Erro inesperado no pool do PostgreSQL');
});

// Helper que loga a query e o tempo de execucao
async function query(text, params) {
  const start = Date.now();
  const result = await pool.query(text, params);
  const durationMs = Date.now() - start;
  logger.debug({ query: text, durationMs, rows: result.rowCount }, 'Query executada');
  return result;
}

module.exports = { pool, query };