import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Button } from "./Button";

export function Navbar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const item = (to: string, label: string, closeOnClick = false) => {
    const active = pathname === to || pathname.startsWith(to + "/");
    const baseClass =
      "block rounded-xl px-3 py-2.5 text-sm font-medium transition " +
      (active ? "bg-primary/10 text-primary-strong" : "text-muted hover:bg-surface/60");

    return closeOnClick ? (
      <Link to={to} className={baseClass} onClick={() => setMenuOpen(false)}>
        {label}
      </Link>
    ) : (
      <Link to={to} className={baseClass}>
        {label}
      </Link>
    );
  };

  return (
    <div className="sticky top-0 z-10 border-b border-border bg-bg/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/feed" className="text-sm font-semibold text-text">
          ComuMinha
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {item("/feed", "Feed")}
          {item("/ads/new", "Criar")}
          {item("/my-ads", "Meus anúncios")}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <span className="hidden text-xs text-muted sm:inline">{user.name}</span>
          ) : null}
          <Button variant="ghost" size="sm" onClick={logout} className="hidden sm:inline-flex">
            Sair
          </Button>

          <button
            type="button"
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
            className="flex h-10 w-10 flex-shrink-0 flex-col items-center justify-center gap-1.5 rounded-xl hover:bg-surface/60 sm:hidden"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span
              className={`h-0.5 w-5 rounded-full bg-text transition ${menuOpen ? "translate-y-2 rotate-45" : ""}`}
            />
            <span className={`h-0.5 w-5 rounded-full bg-text transition ${menuOpen ? "opacity-0" : ""}`} />
            <span
              className={`h-0.5 w-5 rounded-full bg-text transition ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`}
            />
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div className="border-t border-border bg-bg px-4 py-3 sm:hidden">
          <nav className="flex flex-col gap-0.5">
            {item("/feed", "Feed", true)}
            {item("/my-ads", "Meus anúncios", true)}
            <button
              type="button"
              className="mt-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-muted hover:bg-surface/60"
              onClick={() => {
                setMenuOpen(false);
                logout();
              }}
            >
              Sair
            </button>
          </nav>
        </div>
      ) : null}
    </div>
  );
}

