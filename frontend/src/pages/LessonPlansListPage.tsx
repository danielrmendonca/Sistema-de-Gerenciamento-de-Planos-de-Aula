// ----------TELA DE LISTAGEM DE PLANOS DE AULA----------
// Exibe tabela paginada com filtros (disciplina, tag, data prevista), busca por titulo e ordenacao.
// React Query cuida do cache por chave de query, e o backend recebe todos os filtros como query params.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteLessonPlan, listLessonPlans } from '../api/lesson-plans';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Spinner } from '../components/ui/Spinner';
import type { LessonPlanFilters } from '../types/lesson-plan';

// Tamanho fixo de pagina - poderia virar select se necessario,
// mas manter constante deixa a interface mais simples e cobre o caso de uso comum
const PAGE_SIZE = 10;

// Mapeia uma escolha do select de ordenacao para os parametros sortBy/sortOrder esperados pelo backend.
// Concentrar isso em um lugar evita espalhar essa logica pela UI
const sortOptions = [
  { value: 'createdAt:desc', label: 'Mais recentes' },
  { value: 'createdAt:asc', label: 'Mais antigos' },
  { value: 'title:asc', label: 'Titulo A-Z' },
  { value: 'title:desc', label: 'Titulo Z-A' },
] as const;

type SortValue = (typeof sortOptions)[number]['value'];

function parseSort(value: SortValue): Pick<LessonPlanFilters, 'sortBy' | 'sortOrder'> {
  const [sortBy, sortOrder] = value.split(':') as ['title' | 'createdAt', 'asc' | 'desc'];
  return { sortBy, sortOrder };
}

// Converte ISO 8601 vindo do banco para dd/mm/aaaa.
// pt-BR no Intl ja produz esse formato sem precisar de biblioteca externa
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

export function LessonPlansListPage() {
  const queryClient = useQueryClient();

  // ----------ESTADO DOS FILTROS----------
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [discipline, setDiscipline] = useState('');
  const [tag, setTag] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [sort, setSort] = useState<SortValue>('createdAt:desc');

  // Busca textual aciona requisicao a cada caractere; debounce evita uma chamada por tecla,
  // disparando so apos uma pausa curta. Filtros estruturais usam o valor cru por terem cardinalidade baixa
  const debouncedSearch = useDebouncedValue(search, 400);

  const filters: LessonPlanFilters = {
    page,
    pageSize: PAGE_SIZE,
    search: debouncedSearch || undefined,
    discipline: discipline || undefined,
    tag: tag || undefined,
    scheduledDate: scheduledDate || undefined,
    ...parseSort(sort),
  };

  // ----------QUERY DE LISTAGEM----------
  // queryKey inclui todos os filtros para que cada combinacao tenha seu proprio cache.
  // keepPreviousData mantem os dados anteriores enquanto a proxima pagina e buscada, evitando piscar
  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ['lesson-plans', filters],
    queryFn: () => listLessonPlans(filters),
    placeholderData: (previous) => previous,
  });

  // ----------MUTATION DE DELETE----------
  const deleteMutation = useMutation({
    mutationFn: deleteLessonPlan,
    onSuccess: () => {
      // Invalida o cache de todas as variacoes de listagem para forcar refetch da pagina atual
      queryClient.invalidateQueries({ queryKey: ['lesson-plans'] });
    },
  });

  // ----------HANDLERS----------
  // Qualquer alteracao de filtro reseta a paginacao para a primeira pagina,
  // caso contrario o usuario pode acabar em uma pagina inexistente do novo resultado
  function updateFilter<T>(setter: (v: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(1);
    };
  }

  function handleDelete(id: number, title: string) {
    const confirmed = window.confirm(
      `Excluir o plano "${title}"? Essa acao nao pode ser desfeita.`,
    );
    if (confirmed) deleteMutation.mutate(id);
  }

  // ----------RENDER----------
  const plans = data?.data ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;

  return (
    <section className="flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Planos de Aula</h1>
        <Link to="/novo">
          <Button>Novo plano</Button>
        </Link>
      </header>

      {/* ----------BARRA DE FILTROS---------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 bg-slate-50 border border-slate-200 rounded p-4">
        <Input
          id="search"
          label="Buscar por titulo"
          placeholder="Digite parte do titulo"
          value={search}
          onChange={(e) => updateFilter(setSearch)(e.target.value)}
        />
        <Input
          id="discipline"
          label="Disciplina"
          placeholder="Ex: Matematica"
          value={discipline}
          onChange={(e) => updateFilter(setDiscipline)(e.target.value)}
        />
        <Input
          id="tag"
          label="Tag"
          placeholder="Ex: algebra"
          value={tag}
          onChange={(e) => updateFilter(setTag)(e.target.value)}
        />
        <Input
          id="scheduledDate"
          label="Data prevista"
          type="date"
          value={scheduledDate}
          onChange={(e) => updateFilter(setScheduledDate)(e.target.value)}
        />
        <Select
          id="sort"
          label="Ordenar por"
          value={sort}
          onChange={(e) => updateFilter(setSort)(e.target.value as SortValue)}
          options={sortOptions.map((opt) => ({ value: opt.value, label: opt.label }))}
        />
      </div>

      {/* ----------ESTADOS DE CARREGAMENTO E ERRO---------- */}
      {isLoading && (
        <div className="py-8 flex justify-center">
          <Spinner label="Carregando planos..." />
        </div>
      )}

      {isError && !isLoading && (
        <div className="border border-danger-100 bg-danger-50 text-danger-700 rounded p-4 flex items-center justify-between">
          <span>
            Falha ao carregar: {error instanceof Error ? error.message : 'Erro desconhecido'}
          </span>
          <Button variant="secondary" onClick={() => refetch()}>
            Tentar novamente
          </Button>
        </div>
      )}

      {/* ----------TABELA---------- */}
      {!isLoading && !isError && (
        <div className="overflow-x-auto border border-slate-200 rounded">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="text-left px-3 py-2 font-medium">Titulo</th>
                <th className="text-left px-3 py-2 font-medium">Disciplina</th>
                <th className="text-left px-3 py-2 font-medium">Data prevista</th>
                <th className="text-left px-3 py-2 font-medium">Tags</th>
                <th className="text-right px-3 py-2 font-medium">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {plans.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-slate-500">
                    Nenhum plano encontrado com os filtros atuais.
                  </td>
                </tr>
              )}
              {plans.map((plan) => (
                <tr key={plan.id} className="border-t border-slate-200 hover:bg-slate-50">
                  <td className="px-3 py-2">{plan.title}</td>
                  <td className="px-3 py-2">{plan.discipline}</td>
                  <td className="px-3 py-2">{formatDate(plan.scheduledDate)}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {plan.tags.map((t) => (
                        <span
                          key={t}
                          className="bg-brand-100 text-brand-700 rounded px-2 py-0.5 text-xs"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2 justify-end">
                      <Link to={`/planos/${plan.id}/editar`}>
                        <Button variant="secondary">Editar</Button>
                      </Link>
                      <Button
                        variant="danger"
                        onClick={() => handleDelete(plan.id, plan.title)}
                        disabled={deleteMutation.isPending}
                      >
                        Excluir
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ----------PAGINACAO---------- */}
      {pagination && pagination.total > 0 && (
        <footer className="flex items-center justify-between text-sm text-slate-600">
          <span>
            {pagination.total} resultado{pagination.total === 1 ? '' : 's'}
            {isFetching && ' (atualizando...)'}
          </span>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              Anterior
            </Button>
            <span>
              Pagina {pagination.page} de {totalPages}
            </span>
            <Button
              variant="secondary"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Proxima
            </Button>
          </div>
        </footer>
      )}
    </section>
  );
}
