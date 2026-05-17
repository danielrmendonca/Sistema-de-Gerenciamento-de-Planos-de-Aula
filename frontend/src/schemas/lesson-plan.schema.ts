// ----------SCHEMAS ZOD DO FORMULARIO DE PLANO DE AULA----------
import { z } from 'zod';

export const lessonPlanFormSchema = z.object({
  title: z.string().min(1, 'Titulo e obrigatorio').max(200, 'Maximo 200 caracteres'),
  objective: z.string().min(1, 'Objetivo e obrigatorio'),
  summary: z.string().min(1, 'Ementa e obrigatoria'),
  scheduledDate: z.string().min(1, 'Data prevista e obrigatoria'),
  discipline: z.string().min(1, 'Disciplina e obrigatoria').max(100),
  contents: z.array(z.string()).default([]),
  supportResources: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
});

export type LessonPlanFormData = z.infer<typeof lessonPlanFormSchema>;
