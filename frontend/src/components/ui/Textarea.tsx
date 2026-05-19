// ----------TEXTAREA BASE----------
import { forwardRef, type TextareaHTMLAttributes } from 'react';

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, id, className = '', ...rest },
  ref,
) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm text-slate-700">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={id}
        className={`border rounded px-3 py-2 text-sm focus:outline-none min-h-[80px] ${
          error
            ? 'border-danger-500 focus:border-danger-600'
            : 'border-slate-300 focus:border-brand-500'
        } ${className}`}
        {...rest}
      />
      {error && <span className="text-xs text-danger-600">{error}</span>}
    </div>
  );
});
