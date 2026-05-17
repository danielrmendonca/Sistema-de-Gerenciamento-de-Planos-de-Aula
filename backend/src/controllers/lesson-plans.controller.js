// CRUD dos planos de aula

// ----------CONTROLLER DE PLANOS DE AULA----------
const service = require('../services/lesson-plans.service');

async function list(req, res) {
  const result = await service.list(req.query);
  return res.json(result);
}

async function getById(req, res) {
  const result = await service.getById(req.params.id);
  return res.json(result);
}

async function create(req, res) {
  const result = await service.create(req.body);
  return res.status(201).json(result);
}

async function update(req, res) {
  const result = await service.update(req.params.id, req.body);
  return res.json(result);
}

async function remove(req, res) {
  await service.remove(req.params.id);
  return res.status(204).send();
}

module.exports = { list, getById, create, update, remove };