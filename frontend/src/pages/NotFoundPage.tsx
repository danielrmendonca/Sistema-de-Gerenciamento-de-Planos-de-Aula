// ----------TELA DE 404----------
import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <section className="text-center py-16">
      <h1 className="text-3xl font-semibold mb-2">404</h1>
      <p className="text-slate-600 mb-6">Pagina nao encontrada.</p>
      <Link to="/" className="text-brand-700 hover:underline">
        Voltar para a listagem
      </Link>
    </section>
  );
}
