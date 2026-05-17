// request-logger.js Loga cada requisição que chega (método, rota, tempo de resposta) 

// ----------MIDDLEWARE DE LOG DE REQUISICOES HTTP----------
const pinoHttp = require('pino-http');
const logger = require('../config/logger');

const requestLogger = pinoHttp({
  logger,
  customLogLevel: (_req, res, err) => {
    if (err || res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  customSuccessMessage: (req, res) => `${req.method} ${req.url} -> ${res.statusCode}`,
  customErrorMessage: (req, res, err) =>
    `${req.method} ${req.url} -> ${res.statusCode} (${err.message})`,
});

module.exports = requestLogger;