// ----------TAG INPUT----------
// Campo controlado para arrays de strings. Cada item vira um chip com botao de remocao.
// Adiciona um novo item ao pressionar Enter ou virgula, evita duplicados e itens vazios
import { useState, type KeyboardEvent } from 'react';

type TagInputProps = {
  id?: string;
  label?: string;
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  error?: string;
};

export function TagInput({ id, label, value, onChange, placeholder, error }: TagInputProps) {
  const [draft, setDraft] = useState('');

  function commit() {
    const trimmed = draft.trim();
    // Ignora entradas vazias e tambem evita duplicar itens ja presentes na lista
    if (!trimmed || value.includes(trimmed)) {
      setDraft('');
      return;
    }
    onChange([...value, trimmed]);
    setDraft('');
  }

  function remove(item: string) {
    onChange(value.filter((v) => v !== item));
  }

  function handleKey(event: KeyboardEvent<HTMLInputElement>) {
    // Enter ou virgula confirmam o item atual.
    // preventDefault evita o submit do form quando o usuario aperta Enter dentro do campo
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      commit();
    }
    // Backspace com input vazio remove o ultimo chip, comportamento padrao de inputs de tag
    if (event.key === 'Backspace' && draft === '' && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm text-slate-700">
          {label}
        </label>
      )}
      <div
        className={`flex flex-wrap items-center gap-1 border rounded px-2 py-1.5 text-sm bg-white focus-within:outline-none ${
          error
            ? 'border-danger-500 focus-within:border-danger-600'
            : 'border-slate-300 focus-within:border-brand-500'
        }`}
      >
        {value.map((item) => (
          <span
            key={item}
            className="bg-brand-100 text-brand-700 rounded px-2 py-0.5 text-xs flex items-center gap-1"
          >
            {item}
            <button
              type="button"
              onClick={() => remove(item)}
              className="text-brand-700 hover:text-brand-900"
              aria-label={`Remover ${item}`}
            >
              x
            </button>
          </span>
        ))}
        <input
          id={id}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKey}
          onBlur={commit}
          placeholder={value.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] px-1 py-1 text-sm focus:outline-none"
        />
      </div>
      <span className="text-xs text-slate-500">Pressione Enter ou virgula para adicionar.</span>
      {error && <span className="text-xs text-danger-600">{error}</span>}
    </div>
  );
}
