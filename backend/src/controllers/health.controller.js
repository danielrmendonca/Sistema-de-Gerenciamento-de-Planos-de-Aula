// endpoint /health

// ----------CONTROLLER DE HEALTH CHECK----------
const { pool } = require('../config/db');

async function check(req, res) {
  // Verifica conectividade com o banco antes de reportar saudavel
  let dbStatus;
  try {
    await pool.query('SELECT 1');
    dbStatus = 'up';
  } catch {
    dbStatus = 'down';
  }

  const status = dbStatus === 'up' ? 'ok' : 'degraded';
  const httpCode = dbStatus === 'up' ? 200 : 503;

  return res.status(httpCode).json({
    status,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    dependencies: {
      database: dbStatus,
    },
  });
}

module.exports = { check };