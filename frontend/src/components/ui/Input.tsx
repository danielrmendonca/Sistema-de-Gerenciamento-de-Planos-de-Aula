// ----------INPUT BASE----------
import { forwardRef, type InputHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, id, className = '', ...rest },
  ref,
) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm text-slate-700">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={`border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-brand-500 ${className}`}
        {...rest}
      />
    </div>
  );
});
