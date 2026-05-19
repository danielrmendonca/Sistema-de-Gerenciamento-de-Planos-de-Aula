// ----------SERVICO DE PLANOS DE AULA----------
// Camada intermediaria entre o controller e o repositorio.
// Responsavel pelas regras de negocio: validar existencia do recurso e lancar erros semanticos.
// O controller nao consulta o banco diretamente, e o repositorio nao conhece HTTP - o service e a ponte.
const repository = require('../repositories/lesson-plans.repository');
const HttpError = require('../utils/http-error');

// Lista nao precisa verificar resultado vazio: uma lista vazia e um retorno valido, nao um erro
async function list(filters) {
  return repository.findAll(filters);
}

async function getById(id) {
  const plan = await repository.findById(id);
  // O repositorio retorna null quando nenhuma linha e encontrada,
  // o service converte esse null em um erro HTTP semantico com status 404
  if (!plan) throw HttpError.notFound('Plano de aula nao encontrado');
  return plan;
}

// Criacao nao requer verificacao pos-insercao: o repositorio usa RETURNING,
// entao sempre devolve a linha criada ou lanca erro de banco em caso de falha
async function create(data) {
  return repository.create(data);
}

async function update(id, data) {
  const plan = await repository.update(id, data);
  // UPDATE ... RETURNING devolve a linha alterada ou nada se o id nao existia,
  // portanto null aqui significa que o recurso nao foi encontrado
  if (!plan) throw HttpError.notFound('Plano de aula nao encontrado');
  return plan;
}

async function remove(id) {
  const found = await repository.remove(id);
  // O repositorio retorna null quando rowCount e 0, ou seja, nenhuma linha foi deletada
  if (!found) throw HttpError.notFound('Plano de aula nao encontrado');
  // Retorno vazio intencional: o controller responde com 204 No Content sem corpo
}

// Exportacao nomeada para cada operacao do CRUD
module.exports = { list, getById, create, update, remove };
