// ----------TIPOS DO DOMINIO PLANO DE AULA----------
export type LessonPlan = {
  id: number;
  title: string;
  objective: string;
  summary: string;
  scheduledDate: string;
  discipline: string;
  contents: string[];
  supportResources: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export type LessonPlanInput = Omit<LessonPlan, 'id' | 'createdAt' | 'updatedAt'>;

export type LessonPlanFilters = {
  page?: number;
  pageSize?: number;
  search?: string;
  discipline?: string;
  tag?: string;
  scheduledDate?: string;
  sortBy?: 'title' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
};

export type Paginated<T> = {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};
