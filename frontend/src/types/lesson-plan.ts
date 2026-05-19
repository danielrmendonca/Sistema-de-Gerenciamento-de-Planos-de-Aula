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

// O backend retorna os metadados de paginacao em um objeto aninhado,
// entao mantemos o mesmo formato aqui para consumir a resposta sem transformacao intermediaria
export type Paginated<T> = {
  data: T[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
};
