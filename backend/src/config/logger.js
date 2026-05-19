// logger.js Configura e exporta a instância do Pino (logger estruturado)

// ----------LOGGER ESTRUTURADO (PINO)----------
const pino = require('pino');
const env = require('./env');

// Em desenvolvimento usa pino-pretty para legibilidade no terminal
const transport =
  env.NODE_ENV === 'development'
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:HH:MM:ss.l',
          ignore: 'pid,hostname',
        },
      }
    : undefined;

const logger = pino({
  level: env.LOG_LEVEL,
  base: { service: 'lesson-plans-api' },
  timestamp: pino.stdTimeFunctions.isoTime,
  transport,
});

module.exports = logger;
