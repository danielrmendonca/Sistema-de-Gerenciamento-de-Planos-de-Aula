// error-handler.js Captura erros lançados em qualquer camada e devolve uma resposta padronizada

// ----------MIDDLEWARE GLOBAL DE TRATAMENTO DE ERROS----------
const logger = require('../config/logger');
const HttpError = require('../utils/http-error');

function errorHandler(err, req, res, _next) {
  // Erros HTTP conhecidos
  if (err instanceof HttpError) {
    logger.warn(
      { statusCode: err.statusCode, path: req.path, details: err.details },
      err.message,
    );
    return res.status(err.statusCode).json({
      error: err.message,
      details: err.details,
    });
  }

  // Erros inesperados sao logados como error e devolvem 500
  logger.error({ err, path: req.path }, 'Erro nao tratado');
  return res.status(500).json({
    error: 'Erro interno do servidor',
  });
}

module.exports = errorHandler;