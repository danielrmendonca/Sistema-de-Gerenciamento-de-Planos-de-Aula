// ----------SERVICO DE INTEGRACAO COM GOOGLE AI STUDIO----------
// Faz chamada a API da LLM com persona "Assistente Pedagogico" e retorna JSON estruturado
const axios = require('axios');
const env = require('../config/env');
const logger = require('../config/logger');
const HttpError = require('../utils/http-error');

const GOOGLE_AI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

// Monta o prompt com Persona prompting e output formatting
function buildPrompt({ title, discipline, summary }) {
  return [
    'Voce e um Assistente Pedagogico especializado em planejamento de aulas.',
    'Dado o titulo, disciplina e ementa de uma aula, sugira:',
    '- contents: lista de 3 a 5 conteudos complementares relevantes',
    '- extraTopics: lista de 2 a 4 topicos extras para aprofundamento',
    '- tags: exatamente 3 tags curtas (uma ou duas palavras cada)',
    '',
    'Responda APENAS com JSON valido no formato:',
    '{ "contents": string[], "extraTopics": string[], "tags": string[] }',
    '',
    `Titulo: ${title}`,
    `Disciplina: ${discipline}`,
    `Ementa: ${summary}`,
  ].join('\n');
}

async function generateRecommendations({ title, discipline, summary }) {
  if (!env.GOOGLE_AI_API_KEY) {
    throw HttpError.internal('GOOGLE_AI_API_KEY nao configurada');
  }

  const url = `${GOOGLE_AI_BASE_URL}/models/${env.GOOGLE_AI_MODEL}:generateContent`;
  const body = {
    contents: [{ parts: [{ text: buildPrompt({ title, discipline, summary }) }] }],
    generationConfig: {
      response_mime_type: 'application/json',
      temperature: 0.7,
    },
  };

  const start = Date.now();
  try {
    const response = await axios.post(url, body, {
      params: { key: env.GOOGLE_AI_API_KEY },
      timeout: env.GOOGLE_AI_TIMEOUT_MS,
      headers: { 'Content-Type': 'application/json' },
    });

    const latencyMs = Date.now() - start;
    const tokenUsage = response.data?.usageMetadata?.totalTokenCount ?? 0;

    // Log estruturado
    logger.info(
      { title, discipline, tokenUsage, latencyMs },
      `AI Request: Title="${title}", Discipline="${discipline}", TokenUsage=${tokenUsage}, Latency=${(latencyMs / 1000).toFixed(2)}s`,
    );

    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw HttpError.internal('Resposta da IA sem conteudo');

    return JSON.parse(text);
  } catch (err) {
    const latencyMs = Date.now() - start;
    logger.error(
      { err: err.message, title, discipline, latencyMs },
      'Falha ao chamar Google AI Studio',
    );
    if (err instanceof HttpError) throw err;
    throw HttpError.internal('Falha ao gerar recomendacoes via IA');
  }
}

module.exports = { generateRecommendations };