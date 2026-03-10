import { NavLink, Outlet } from "react-router-dom";
import { useState } from "react";

const navItems = [
  { to: "/admin", end: true, label: "Dashboard" },
  { to: "/admin/communities", end: false, label: "Comunidades" },
  { to: "/admin/ads", end: false, label: "Anúncios" },
  { to: "/admin/users", end: false, label: "Usuários" },
  { to: "/admin/reports", end: false, label: "Denúncias" },
  { to: "/admin/map", end: false, label: "Mapa" },
  { to: "/admin/settings", end: false, label: "Configurações" },
  { to: "/admin/status", end: false, label: "Status" },
];

export function AdminLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-bg sm:flex-row">
      {/* Top bar (mobile) */}
      <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3 sm:hidden">
        <button
          type="button"
          className="mr-2 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-sm font-medium"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Alternar menu do painel admin"
        >
          ☰
        </button>
        <div className="min-w-0 flex-1 text-center">
          <span className="truncate text-sm font-semibold uppercase tracking-wide text-muted">
            Painel Admin
          </span>
        </div>
        <NavLink
          to="/feed"
          className="ml-2 text-xs text-muted hover:text-fg"
        >
          Voltar
        </NavLink>
      </header>

      {/* Sidebar desktop + drawer mobile */}
      <aside
        className={`z-20 w-60 shrink-0 border-r border-border bg-card transition-transform sm:static sm:translate-x-0 ${
          menuOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0"
        }`}
      >
        <div className="sticky top-0 max-h-screen overflow-y-auto p-4">
          <h2 className="mb-4 hidden text-sm font-semibold uppercase tracking-wide text-muted sm:block">
            Painel Admin
          </h2>
          <nav className="flex flex-col gap-1">
            {navItems.map(({ to, end, label }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/15 text-primary"
                      : "text-muted hover:bg-surface hover:text-fg"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
          <NavLink
            to="/feed"
            className="mt-4 hidden rounded-lg px-3 py-2 text-sm text-muted hover:bg-surface hover:text-fg sm:block"
          >
            ← Voltar ao app
          </NavLink>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-auto bg-surface/30 px-3 py-4 sm:px-6 sm:py-8">
        {/* Área centralizada tipo painel administrativo */}
        <div className="mx-auto max-w-5xl rounded-2xl border border-border bg-card/80 p-4 shadow-sm backdrop-blur-sm sm:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
