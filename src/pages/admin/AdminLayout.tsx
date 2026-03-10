import { NavLink, Outlet } from "react-router-dom";

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
  return (
    <div className="flex min-h-screen bg-bg">
      <aside className="w-56 shrink-0 border-r border-border bg-card">
        <div className="sticky top-0 p-4">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
            Painel Admin
          </h2>
          <nav className="flex flex-col gap-1">
            {navItems.map(({ to, end, label }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
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
            className="mt-4 block rounded-lg px-3 py-2 text-sm text-muted hover:bg-surface hover:text-fg"
          >
            ← Voltar ao app
          </NavLink>
        </div>
      </aside>
      <main className="min-w-0 flex-1 overflow-auto bg-surface/30 py-8 px-6">
        {/* Área centralizada tipo painel administrativo */}
        <div className="mx-auto max-w-5xl rounded-2xl border border-border bg-card/80 p-6 shadow-sm backdrop-blur-sm sm:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
