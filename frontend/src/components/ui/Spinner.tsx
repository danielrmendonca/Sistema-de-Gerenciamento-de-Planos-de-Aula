// ----------COMPONENTE DE LOADING----------
type SpinnerProps = {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
};

const sizeClass = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-4',
};

export function Spinner({ size = 'md', label }: SpinnerProps) {
  return (
    <div className="flex items-center gap-2" role="status" aria-live="polite">
      <div
        className={`animate-spin rounded-full border-brand-100 border-t-brand-500 ${sizeClass[size]}`}
      />
      {label && <span className="text-sm text-slate-600">{label}</span>}
    </div>
  );
}
