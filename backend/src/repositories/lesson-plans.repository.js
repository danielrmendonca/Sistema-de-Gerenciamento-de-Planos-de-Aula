// ----------REPOSITORIO DE PLANOS DE AULA----------
// Acesso direto ao banco; sera implementado na feature de CRUD
const { query } = require('../config/db');

async function findAll(_filters) {
  // Implementar listagem com paginacao, filtros e ordenacao
  throw new Error('Nao implementado');
}

async function findById(_id) {
  // Implementar busca por id
  throw new Error('Nao implementado');
}

async function create(_data) {
  // Implementar insercão
  throw new Error('Nao implementado');
}

async function update(_id, _data) {
  // Implementar atualizacão
  throw new Error('Nao implementado');
}

async function remove(_id) {
  // Implementar exclusão
  throw new Error('Nao implementado');
}

module.exports = { findAll, findById, create, update, remove, query };
