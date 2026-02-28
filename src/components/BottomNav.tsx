import { Link, useLocation } from "react-router-dom";

const navItems: { to: string; label: string; icon: React.ReactNode; match?: (path: string) => boolean }[] = [
  {
    to: "/feed",
    label: "Início",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    match: (path) => path === "/feed",
  },
  {
    to: "/my-ads",
    label: "Meus Anúncios",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    match: (path) => path === "/my-ads",
  },
  {
    to: "/ads/new",
    label: "Anunciar",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
      </svg>
    ),
    match: (path) => path === "/ads/new",
  },
  {
    to: "/communities",
    label: "Comunidades",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    match: (path) => path === "/communities" || path.startsWith("/communities/"),
  },
  {
    to: "/my-account",
    label: "Minha Conta",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    match: (path) => path === "/my-account",
  },
];

export function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-20 border-t border-white/10 bg-[#382D20] dark:border-border dark:bg-bg/95 dark:backdrop-blur supports-[backdrop-filter]:dark:bg-bg/90"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0)" }}
      aria-label="Navegação principal"
    >
      <div className="flex w-full items-start justify-between px-2 py-2">
        {navItems.map(({ to, label, icon, match }) => {
          const isCenter = to === "/ads/new";
          const isActive = match ? match(pathname) : pathname === to || pathname.startsWith(to + "/");

          const linkClass =
            "flex flex-col items-center gap-1 min-w-0 flex-1 py-1 rounded-xl transition " +
            (isActive
              ? "text-white dark:text-accent-strong"
              : "text-white/85 hover:text-white dark:text-muted dark:hover:text-text active:bg-white/10 dark:active:bg-surface/60");
          const labelClass = "text-[10px] font-medium leading-tight text-center max-w-[4.5rem] line-clamp-2 min-h-[2.25rem]";

          return (
            <Link
              key={to}
              to={to}
              className={`${linkClass} ${isCenter ? "-mt-5" : ""}`}
              aria-current={isActive ? "page" : undefined}
            >
              <span
                className={
                  isCenter
                    ? "flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-soft"
                    : "flex items-center justify-center"
                }
              >
                {icon}
              </span>
              <span className={labelClass}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
