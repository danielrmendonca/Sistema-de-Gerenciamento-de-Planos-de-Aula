// ----------SERVICO DE PLANOS DE AULA----------
// Camada de regras de negocio; orquestra repositorio e regras de dominio
const repository = require('../repositories/lesson-plans.repository');

async function list(filters) {
  return repository.findAll(filters);
}

async function getById(id) {
  return repository.findById(id);
}

async function create(data) {
  return repository.create(data);
}

async function update(id, data) {
  return repository.update(id, data);
}

async function remove(id) {
  return repository.remove(id);
}

module.exports = { list, getById, create, update, remove };