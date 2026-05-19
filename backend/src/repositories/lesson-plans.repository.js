// ----------REPOSITORIO DE PLANOS DE AULA----------
// Unica camada que executa SQL. Todas as funcoes recebem valores simples e devolvem objetos camelCase.
const { query } = require('../config/db');

// Converte linha do banco (snake_case) para modelo da aplicacao (camelCase).
// Centralizar aqui evita repetir a conversao em cada funcao do repositorio.
function toModel(row) {
  return {
    id: row.id,
    title: row.title,
    objective: row.objective,
    summary: row.summary,
    scheduledDate: row.scheduled_date,
    discipline: row.discipline,
    contents: row.contents,
    supportResources: row.support_resources,
    tags: row.tags,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function findAll({
  page,
  pageSize,
  search,
  discipline,
  tag,
  scheduledDate,
  sortBy,
  sortOrder,
}) {
  // conditions acumula os trechos SQL dos filtros ativos,
  // params acumula os valores correspondentes na mesma ordem
  const conditions = [];
  const params = [];

  if (search) {
    params.push(`%${search}%`); // envolve o termo com % para o operador ILIKE fazer busca parcial
    conditions.push(`title ILIKE $${params.length}`); // $N referencia a posicao atual em params
  }
  if (discipline) {
    params.push(discipline);
    conditions.push(`discipline = $${params.length}`);
  }
  if (tag) {
    params.push(tag);
    // ANY(tags) verifica se o valor existe dentro do array de tags armazenado no PostgreSQL
    conditions.push(`$${params.length} = ANY(tags)`);
  }
  if (scheduledDate) {
    params.push(scheduledDate);
    // ::date faz o cast explicito no banco, necessario pois o parametro chega como objeto Date do JS
    conditions.push(`scheduled_date = $${params.length}::date`);
  }

  // Se nenhum filtro foi ativado, where fica vazio e a query retorna todos os registros
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  // Whitelist para evitar injecao via sortBy/sortOrder - nao usar esses valores diretamente na query
  const column = sortBy === 'title' ? 'title' : 'created_at';
  const order = sortOrder === 'asc' ? 'ASC' : 'DESC';

  // Primeira query: conta o total de registros com os filtros aplicados, sem paginar
  const countResult = await query(`SELECT COUNT(*) FROM lesson_plans ${where}`, params);
  const total = parseInt(countResult.rows[0].count, 10); // COUNT retorna string, converte para numero

  // LIMIT e OFFSET sao adicionados ao mesmo array params apos o COUNT,
  // pois o COUNT usa os mesmos $N de filtro e nao precisa de paginacao
  params.push(pageSize, (page - 1) * pageSize);
  const dataResult = await query(
    `SELECT * FROM lesson_plans ${where} ORDER BY ${column} ${order} LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  );

  return {
    data: dataResult.rows.map(toModel), // converte cada linha para camelCase antes de retornar
    pagination: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
  };
}

async function findById(id) {
  const result = await query('SELECT * FROM lesson_plans WHERE id = $1', [id]);
  // rows[0] e undefined quando nenhuma linha e encontrada, entao retorna null para o service tratar
  return result.rows[0] ? toModel(result.rows[0]) : null;
}

async function create(data) {
  // Desestrutura apenas os campos conhecidos para evitar passar campos extras ao banco
  const { title, objective, summary, scheduledDate, discipline, contents, supportResources, tags } =
    data;
  const result = await query(
    // RETURNING * faz o INSERT devolver a linha inserida, incluindo id e timestamps gerados pelo banco
    `INSERT INTO lesson_plans (title, objective, summary, scheduled_date, discipline, contents, support_resources, tags)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [title, objective, summary, scheduledDate, discipline, contents, supportResources, tags],
  );
  return toModel(result.rows[0]);
}

async function update(id, data) {
  const { title, objective, summary, scheduledDate, discipline, contents, supportResources, tags } =
    data;
  const result = await query(
    // updated_at = NOW() atualiza o timestamp de modificacao diretamente no banco
    // RETURNING * devolve a linha atualizada, ou nada se o WHERE nao encontrar o id
    `UPDATE lesson_plans
     SET title = $1, objective = $2, summary = $3, scheduled_date = $4, discipline = $5,
         contents = $6, support_resources = $7, tags = $8, updated_at = NOW()
     WHERE id = $9
     RETURNING *`,
    [title, objective, summary, scheduledDate, discipline, contents, supportResources, tags, id],
  );
  // rows[0] vazio significa que o id nao existia - o service interpreta null como 404
  return result.rows[0] ? toModel(result.rows[0]) : null;
}

async function remove(id) {
  // RETURNING id e usado apenas para que o banco confirme qual linha foi removida
  const result = await query('DELETE FROM lesson_plans WHERE id = $1 RETURNING id', [id]);
  // rowCount indica quantas linhas foram afetadas - 0 significa que o id nao existia
  return result.rowCount > 0;
}

module.exports = { findAll, findById, create, update, remove };
