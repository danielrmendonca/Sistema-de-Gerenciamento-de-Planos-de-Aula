// ----------TESTES DE INTEGRACAO DE PLANOS DE AULA----------
const request = require('supertest');

// mockQuery e criado antes do require do app pois jest.mock e elevado (hoisted) pelo Jest,
// garantindo que o modulo db ja esteja substituido quando o app for carregado
const mockQuery = jest.fn();
jest.mock('../../src/config/db', () => ({
  pool: { query: jest.fn() },
  query: mockQuery, // substitui a funcao real de query do pool pelo mock controlavel
}));

const app = require('../../src/app');

// Linha do banco simulada (snake_case, como o PostgreSQL retorna)
// O repositorio converte para camelCase antes de devolver ao service
const dbRow = {
  id: 1,
  title: 'Introducao ao React',
  objective: 'Aprender os fundamentos do React',
  summary: 'Hooks, componentes e estado',
  scheduled_date: new Date('2024-06-01'),
  discipline: 'Programacao Web',
  contents: ['JSX', 'Props'],
  support_resources: ['Documentacao React'],
  tags: ['react', 'frontend'],
  created_at: new Date('2024-01-01T00:00:00.000Z'),
  updated_at: new Date('2024-01-01T00:00:00.000Z'),
};

// Corpo valido para POST/PUT - usa camelCase como esperado pelo schema Zod do backend
const validBody = {
  title: 'Introducao ao React',
  objective: 'Aprender os fundamentos do React',
  summary: 'Hooks, componentes e estado',
  scheduledDate: '2024-06-01',
  discipline: 'Programacao Web',
  contents: ['JSX', 'Props'],
  supportResources: ['Documentacao React'],
  tags: ['react', 'frontend'],
};

// Limpa o historico de chamadas e retornos do mock antes de cada teste
// para evitar que um teste interfira no estado do proximo
beforeEach(() => {
  mockQuery.mockReset();
});

// ----------LISTAGEM----------
describe('GET /api/lesson-plans', () => {
  it('retorna lista paginada com valores padrao', async () => {
    // A listagem dispara duas queries em sequencia: COUNT para calcular o total e SELECT para buscar a pagina
    // mockResolvedValueOnce encadeia retornos, um para cada chamada ao mockQuery
    mockQuery
      .mockResolvedValueOnce({ rows: [{ count: '1' }] }) // COUNT
      .mockResolvedValueOnce({ rows: [dbRow] }); // SELECT

    const res = await request(app).get('/api/lesson-plans');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title).toBe('Introducao ao React');
    // Verifica que o objeto de paginacao esta completo e consistente com os dados mockados
    expect(res.body.pagination).toMatchObject({ total: 1, page: 1, pageSize: 10, totalPages: 1 });
  });

  it('encaminha parametro search para a query', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ count: '0' }] }).mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get('/api/lesson-plans?search=react');

    expect(res.status).toBe(200);
    // mockQuery.mock.calls e um array onde cada item representa uma chamada,
    // e cada item contem [sql, params] - aqui inspecionamos os params da primeira chamada (COUNT)
    const countCall = mockQuery.mock.calls[0];
    expect(countCall[1]).toContain('%react%'); // o repositorio envolve o termo com % para ILIKE
  });

  it('encaminha filtro de disciplina', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ count: '0' }] }).mockResolvedValueOnce({ rows: [] });

    await request(app).get('/api/lesson-plans?discipline=Matematica');

    // Confirma que o valor chegou nos parametros da query sem modificacao
    const countCall = mockQuery.mock.calls[0];
    expect(countCall[1]).toContain('Matematica');
  });

  it('encaminha filtro de tag', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ count: '0' }] }).mockResolvedValueOnce({ rows: [] });

    await request(app).get('/api/lesson-plans?tag=algebra');

    // Tags sao armazenadas em array no PostgreSQL, o filtro usa o operador @> ou ANY
    const countCall = mockQuery.mock.calls[0];
    expect(countCall[1]).toContain('algebra');
  });

  it('encaminha filtro de data', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ count: '0' }] }).mockResolvedValueOnce({ rows: [] });

    await request(app).get('/api/lesson-plans?scheduledDate=2024-06-01');

    // Zod coerce.date transforma a string em Date antes de chegar ao repo,
    // entao o parametro que chega ao banco e um objeto Date, nao uma string
    const countCall = mockQuery.mock.calls[0];
    expect(countCall[1][0]).toBeInstanceOf(Date);
  });

  it('rejeita paginacao invalida com 400', async () => {
    // O middleware de validacao rejeita antes de chamar o banco, nenhum mock e necessario
    const res = await request(app).get('/api/lesson-plans?page=abc');
    expect(res.status).toBe(400);
  });

  it('rejeita sortBy invalido com 400', async () => {
    // Zod usa z.enum para limitar os valores aceitos em sortBy, rejeitando qualquer outro valor
    const res = await request(app).get('/api/lesson-plans?sortBy=invalido');
    expect(res.status).toBe(400);
  });
});

// ----------BUSCA POR ID----------
describe('GET /api/lesson-plans/:id', () => {
  it('retorna o plano quando encontrado', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [dbRow] });

    const res = await request(app).get('/api/lesson-plans/1');

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(1);
    expect(res.body.title).toBe('Introducao ao React');
    // Verifica a conversao de snake_case (support_resources) para camelCase (supportResources)
    expect(res.body.supportResources).toEqual(['Documentacao React']);
  });

  it('retorna 404 quando nao encontrado', async () => {
    // rows vazio indica que o SELECT nao encontrou nenhum registro com o id informado
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).get('/api/lesson-plans/999');

    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/nao encontrado/i); // /i torna a regex case-insensitive
  });

  it('retorna 400 para id invalido', async () => {
    // Zod valida que o parametro :id e um inteiro positivo antes de consultar o banco
    const res = await request(app).get('/api/lesson-plans/abc');
    expect(res.status).toBe(400);
  });
});

// ----------CRIACAO----------
describe('POST /api/lesson-plans', () => {
  it('cria e retorna o plano com status 201', async () => {
    // O INSERT retorna a linha inserida via RETURNING, simulado aqui pelo dbRow
    mockQuery.mockResolvedValueOnce({ rows: [dbRow] });

    const res = await request(app).post('/api/lesson-plans').send(validBody);

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Introducao ao React');
    expect(res.body.discipline).toBe('Programacao Web');
  });

  it('retorna 400 quando titulo ausente', async () => {
    // Desestruturacao com renomeio: extrai title (descartado como _title) e mantem o restante em semTitulo
    const { title: _title, ...semTitulo } = validBody;
    const res = await request(app).post('/api/lesson-plans').send(semTitulo);
    expect(res.status).toBe(400);
  });

  it('retorna 400 quando scheduledDate invalida', async () => {
    // Spread com sobrescrita: copia validBody e substitui apenas scheduledDate por um valor invalido
    const res = await request(app)
      .post('/api/lesson-plans')
      .send({ ...validBody, scheduledDate: 'nao-e-data' });
    expect(res.status).toBe(400);
  });
});

// ----------ATUALIZACAO----------
describe('PUT /api/lesson-plans/:id', () => {
  it('atualiza e retorna o plano', async () => {
    // Simula o retorno do UPDATE ... RETURNING com o campo alterado
    const atualizado = { ...dbRow, title: 'React Avancado' };
    mockQuery.mockResolvedValueOnce({ rows: [atualizado] });

    const res = await request(app)
      .put('/api/lesson-plans/1')
      .send({ ...validBody, title: 'React Avancado' });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('React Avancado');
  });

  it('retorna 404 quando plano nao existe', async () => {
    // rows vazio no UPDATE indica que o id nao existe na tabela
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).put('/api/lesson-plans/999').send(validBody);

    expect(res.status).toBe(404);
  });
});

// ----------EXCLUSAO----------
describe('DELETE /api/lesson-plans/:id', () => {
  it('exclui e retorna 204', async () => {
    // rowCount indica quantas linhas foram afetadas pelo DELETE,
    // rows com o id serve para confirmar qual registro foi removido
    mockQuery.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 1 }] });

    const res = await request(app).delete('/api/lesson-plans/1');

    // 204 No Content e o status correto para exclusao bem-sucedida, sem corpo na resposta
    expect(res.status).toBe(204);
  });

  it('retorna 404 quando plano nao existe', async () => {
    // rowCount 0 significa que o DELETE nao encontrou nenhuma linha para remover
    mockQuery.mockResolvedValueOnce({ rowCount: 0, rows: [] });

    const res = await request(app).delete('/api/lesson-plans/999');

    expect(res.status).toBe(404);
  });
});
