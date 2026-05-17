// ----------API DE PLANOS DE AULA----------
import { apiClient } from './client';
import type {
  LessonPlan,
  LessonPlanFilters,
  LessonPlanInput,
  Paginated,
} from '../types/lesson-plan';

export async function listLessonPlans(filters: LessonPlanFilters = {}) {
  const { data } = await apiClient.get<Paginated<LessonPlan>>('/lesson-plans', {
    params: filters,
  });
  return data;
}

export async function getLessonPlan(id: number) {
  const { data } = await apiClient.get<LessonPlan>(`/lesson-plans/${id}`);
  return data;
}

export async function createLessonPlan(payload: LessonPlanInput) {
  const { data } = await apiClient.post<LessonPlan>('/lesson-plans', payload);
  return data;
}

export async function updateLessonPlan(id: number, payload: LessonPlanInput) {
  const { data } = await apiClient.put<LessonPlan>(`/lesson-plans/${id}`, payload);
  return data;
}

export async function deleteLessonPlan(id: number) {
  await apiClient.delete(`/lesson-plans/${id}`);
}
