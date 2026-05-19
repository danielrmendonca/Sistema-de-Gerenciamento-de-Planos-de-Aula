// ----------HOOK DE DEBOUNCE----------
// Atrasa a propagacao de um valor para evitar chamadas excessivas a API enquanto o usuario digita
import { useEffect, useState } from 'react';

export function useDebouncedValue<T>(value: T, delayMs = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    // Reinicia o timer a cada nova mudanca de valor.
    // Se nada mudar dentro do intervalo, o valor final e propagado para o consumidor
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}
