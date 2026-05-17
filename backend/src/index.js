// ----------BOOTSTRAP DO SERVIDOR----------
const app = require('./app');
const env = require('./config/env');
const logger = require('./config/logger');

const server = app.listen(env.PORT, () => {
  logger.info(`API iniciada em http://localhost:${env.PORT} (env=${env.NODE_ENV})`);
});

// ----------SHUTDOWN COM OBSERVALIDADE----------
function shutdown(signal) {
  logger.info(`Recebido ${signal}, encerrando servidor...`);
  server.close((err) => {
    if (err) {
      logger.error({ err }, 'Erro ao encerrar servidor');
      process.exit(1);
    }
    logger.info('Servidor encerrado com sucesso');
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
