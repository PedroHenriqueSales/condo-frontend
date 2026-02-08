import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useCondominium } from "../hooks/useCondominium";
import logoIcon from "../assets/logo-icon.png";
import logoName from "../assets/logo-name.png";
import { Button } from "./Button";
import { ShareCommunityModal } from "./ShareCommunityModal";

export function Navbar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const { communities, activeCommunityId } = useCondominium();
  const [menuOpen, setMenuOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const activeCommunity = activeCommunityId
    ? communities.find((c) => c.id === activeCommunityId)
    : null;

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
        <Link to="/feed" className="flex items-center gap-2" aria-label="Aquidolado">
          <img src={logoIcon} alt="" className="h-9 w-auto" />
          <img src={logoName} alt="Aqui do Lado" className="h-6 w-auto sm:h-7" />
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {item("/feed", "Feed")}
          {item("/ads/new", "Criar")}
          {item("/my-ads", "Meus anúncios")}
          {item("/communities", "Minhas comunidades")}
          {item("/my-account", "Minha conta")}
          {activeCommunity ? (
            <Button variant="ghost" size="sm" onClick={() => setShareOpen(true)}>
              Compartilhar
            </Button>
          ) : null}
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
            {item("/communities", "Minhas comunidades", true)}
            {item("/my-account", "Minha conta", true)}
            {activeCommunity ? (
              <button
                type="button"
                className="block rounded-xl px-3 py-2.5 text-left text-sm font-medium text-muted hover:bg-surface/60"
                onClick={() => {
                  setMenuOpen(false);
                  setShareOpen(true);
                }}
              >
                Compartilhar comunidade
              </button>
            ) : null}
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

      {shareOpen && activeCommunity ? (
        <ShareCommunityModal
          community={activeCommunity}
          onClose={() => setShareOpen(false)}
        />
      ) : null}
    </div>
  );
}

