// ----------SELECT BASE----------
import { forwardRef, type SelectHTMLAttributes } from 'react';

type Option = { value: string; label: string };

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
  options: Option[];
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, id, options, className = '', ...rest },
  ref,
) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm text-slate-700">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={id}
        className={`border rounded px-3 py-2 text-sm bg-white focus:outline-none ${
          error
            ? 'border-danger-500 focus:border-danger-600'
            : 'border-slate-300 focus:border-brand-500'
        } ${className}`}
        {...rest}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-danger-600">{error}</span>}
    </div>
  );
});
