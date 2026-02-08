import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Button } from "./Button";

export function Navbar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  const item = (to: string, label: string) => {
    const active = pathname === to || pathname.startsWith(to + "/");
    return (
      <Link
        to={to}
        className={
          "rounded-xl px-3 py-2 text-sm font-medium transition " +
          (active ? "bg-primary/10 text-primary-strong" : "text-muted hover:bg-surface/60")
        }
      >
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
          <Button variant="ghost" size="sm" onClick={logout}>
            Sair
          </Button>
        </div>
      </div>
    </div>
  );
}

