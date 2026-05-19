// ----------TELA DE FORMULARIO DE PLANO DE AULA----------
// A mesma tela atende criacao e edicao. Detecta o modo pela presenca de :id na rota.
// react-hook-form gerencia estado e validacao, zodResolver aplica o schema importado.
// mode 'onChange' valida em tempo real conforme o usuario digita
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createLessonPlan, getLessonPlan, updateLessonPlan } from '../api/lesson-plans';
import { lessonPlanFormSchema, type LessonPlanFormData } from '../schemas/lesson-plan.schema';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Spinner } from '../components/ui/Spinner';
import { TagInput } from '../components/ui/TagInput';
import { Textarea } from '../components/ui/Textarea';

// Valores iniciais usados no modo criacao. No modo edicao sao substituidos via reset() quando a query carrega
const emptyValues: LessonPlanFormData = {
  title: '',
  objective: '',
  summary: '',
  scheduledDate: '',
  discipline: '',
  contents: [],
  supportResources: [],
  tags: [],
};

// Backend devolve scheduledDate como ISO 8601 ('2026-06-01T03:00:00.000Z'),
// mas o input type=date exige formato 'YYYY-MM-DD'. Esta funcao corta a parte da data
function isoToDateInput(iso: string) {
  return iso.slice(0, 10);
}

export function LessonPlanFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Presenca do parametro :id na rota indica modo edicao
  const isEditing = Boolean(id);
  const numericId = id ? Number(id) : undefined;

  // ----------CARREGAMENTO NO MODO EDICAO----------
  // enabled false quando estamos criando evita disparar a query a toa
  const { data: existingPlan, isLoading: isLoadingPlan } = useQuery({
    queryKey: ['lesson-plans', numericId],
    queryFn: () => getLessonPlan(numericId as number),
    enabled: isEditing,
  });

  // ----------CONFIG DO FORM----------
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = useForm<LessonPlanFormData>({
    resolver: zodResolver(lessonPlanFormSchema),
    mode: 'onChange', // valida a cada alteracao para feedback em tempo real
    defaultValues: emptyValues,
  });

  // Quando a query da edicao retorna, popula o form com os valores existentes.
  // reset substitui todos os valores e ja recalcula a validade
  useEffect(() => {
    if (existingPlan) {
      reset({
        title: existingPlan.title,
        objective: existingPlan.objective,
        summary: existingPlan.summary,
        scheduledDate: isoToDateInput(existingPlan.scheduledDate),
        discipline: existingPlan.discipline,
        contents: existingPlan.contents,
        supportResources: existingPlan.supportResources,
        tags: existingPlan.tags,
      });
    }
  }, [existingPlan, reset]);

  // ----------MUTATIONS----------
  const createMutation = useMutation({
    mutationFn: createLessonPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-plans'] });
      navigate('/');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: LessonPlanFormData) => updateLessonPlan(numericId as number, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-plans'] });
      navigate('/');
    },
  });

  function onSubmit(values: LessonPlanFormData) {
    if (isEditing) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  }

  // ----------ESTADOS DE CARGA E ERRO DA MUTATION----------
  const submitError = createMutation.error ?? updateMutation.error;
  const isSubmittingMutation = isSubmitting || createMutation.isPending || updateMutation.isPending;

  if (isEditing && isLoadingPlan) {
    return (
      <div className="py-8 flex justify-center">
        <Spinner label="Carregando plano..." />
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          {isEditing ? 'Editar plano de aula' : 'Novo plano de aula'}
        </h1>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <Input
          id="title"
          label="Titulo da aula"
          placeholder="Ex: Introducao ao OSPF"
          error={errors.title?.message}
          {...register('title')}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            id="discipline"
            label="Disciplina"
            placeholder="Ex: Redes"
            error={errors.discipline?.message}
            {...register('discipline')}
          />
          <Input
            id="scheduledDate"
            type="date"
            label="Data prevista"
            error={errors.scheduledDate?.message}
            {...register('scheduledDate')}
          />
        </div>

        <Textarea
          id="objective"
          label="Objetivo"
          placeholder="O que o aluno deve ser capaz de fazer ao fim da aula"
          error={errors.objective?.message}
          {...register('objective')}
        />

        <Textarea
          id="summary"
          label="Ementa / resumo"
          placeholder="Resumo dos topicos abordados"
          error={errors.summary?.message}
          {...register('summary')}
        />

        {/* Controller e necessario para campos sem ref nativa do react-hook-form,
            no caso o TagInput que e um componente customizado controlado por value/onChange */}
        <Controller
          control={control}
          name="contents"
          render={({ field, fieldState }) => (
            <TagInput
              id="contents"
              label="Conteudos"
              placeholder="Ex: LSA, Areas, DR/BDR"
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="supportResources"
          render={({ field, fieldState }) => (
            <TagInput
              id="supportResources"
              label="Recursos de apoio"
              placeholder="Ex: RFC 2328, Slides aula 3"
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="tags"
          render={({ field, fieldState }) => (
            <TagInput
              id="tags"
              label="Tags"
              placeholder="Ex: redes, roteamento"
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />

        {submitError && (
          <div className="border border-danger-100 bg-danger-50 text-danger-700 rounded p-3 text-sm">
            Falha ao salvar:{' '}
            {submitError instanceof Error ? submitError.message : 'Erro desconhecido'}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={() => navigate('/')}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmittingMutation || !isValid}>
            {isSubmittingMutation ? 'Salvando...' : isEditing ? 'Salvar alteracoes' : 'Criar plano'}
          </Button>
        </div>
      </form>
    </section>
  );
}
