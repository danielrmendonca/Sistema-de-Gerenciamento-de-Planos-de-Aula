// ----------SCHEMA ZOD PARA REQUISICAO DE SMART ASSIST----------
const { z } = require('zod');

const smartAssistBodySchema = z.object({
  title: z.string().min(1, 'Titulo e obrigatorio').max(200),
  discipline: z.string().min(1, 'Disciplina e obrigatoria').max(100),
  summary: z.string().min(1, 'Ementa e obrigatoria'),
});

module.exports = { smartAssistBodySchema };
