// ----------SCHEMAS ZOD PARA PLANOS DE AULA----------
const { z } = require('zod');

// Stub inicial: campos completos serao definidos na feature de CRUD
const lessonPlanBodySchema = z.object({
  title: z.string().min(1, 'Titulo e obrigatorio').max(200),
  objective: z.string().min(1, 'Objetivo e obrigatorio'),
  summary: z.string().min(1, 'Ementa e obrigatoria'),
  scheduledDate: z.coerce.date(),
  discipline: z.string().min(1, 'Disciplina e obrigatoria').max(100),
  contents: z.array(z.string()).default([]),
  supportResources: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
});

const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  discipline: z.string().optional(),
  tag: z.string().optional(),
  scheduledDate: z.coerce.date().optional(),
  sortBy: z.enum(['title', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

const idParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

module.exports = {
  lessonPlanBodySchema,
  listQuerySchema,
  idParamsSchema,
};
