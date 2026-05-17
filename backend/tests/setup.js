// ----------SETUP GLOBAL DE TESTES----------
// Carrega .env.test se existir, senao usa defaults
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = process.env.LOG_LEVEL || 'silent';
