// ----------LAYOUT BASE DA APLICACAO----------
import { Link, NavLink, Outlet } from 'react-router-dom';

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-brand-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-lg font-semibold text-brand-700">
            Planos de Aula
          </Link>
          <nav className="flex gap-4 text-sm">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                isActive ? 'text-brand-700 font-medium' : 'text-slate-700 hover:text-brand-600'
              }
            >
              Listagem
            </NavLink>
            <NavLink
              to="/novo"
              className={({ isActive }) =>
                isActive ? 'text-brand-700 font-medium' : 'text-slate-700 hover:text-brand-600'
              }
            >
              Novo plano
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
