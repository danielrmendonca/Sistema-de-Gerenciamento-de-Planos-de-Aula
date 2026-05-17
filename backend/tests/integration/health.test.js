// ----------TESTE DE INTEGRACAO DO HEALTH CHECK----------
const request = require('supertest');

// Mock do pool para nao depender de banco real no teste basico
jest.mock('../../src/config/db', () => ({
  pool: { query: jest.fn().mockResolvedValue({ rows: [{ '?column?': 1 }] }) },
  query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
}));

const app = require('../../src/app');

describe('GET /health', () => {
  it('deve retornar status ok quando o banco responde', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      status: 'ok',
      dependencies: { database: 'up' },
    });
    expect(typeof res.body.uptime).toBe('number');
    expect(typeof res.body.timestamp).toBe('string');
  });
});
