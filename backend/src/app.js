// ----------CONFIGURACAO DA APLICACAO EXPRESS----------
const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const requestLogger = require('./middlewares/request-logger');
const errorHandler = require('./middlewares/error-handler');
const routes = require('./routes');

const app = express();

// ----------MIDDLEWARES GLOBAIS----------
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json({ limit: '1mb' }));
app.use(requestLogger);

// ----------ROTAS DA API----------
app.use('/api', routes);

// Health check tambem exposto na raiz para facilitar probes do Docker/nginx
app.use('/health', require('./routes/health.routes'));

// ----------404 PADRAO----------
app.use((req, res) => {
  res.status(404).json({ error: 'Rota nao encontrada', path: req.path });
});

// ----------HANDLER GLOBAL DE ERROS----------
app.use(errorHandler);

module.exports = app;
