// ----------CONFIGURACAO DE ROTAS----------
import { createBrowserRouter } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { LessonPlansListPage } from './pages/LessonPlansListPage';
import { LessonPlanFormPage } from './pages/LessonPlanFormPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <LessonPlansListPage /> },
      { path: 'novo', element: <LessonPlanFormPage /> },
      { path: 'planos/:id/editar', element: <LessonPlanFormPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
