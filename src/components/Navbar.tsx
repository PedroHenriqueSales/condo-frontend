import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useCondominium } from "../hooks/useCondominium";
import logoNameDark from "../assets/logo-name-dark.png";
import { Button } from "./Button";
import * as CondominiumService from "../services/condominium.service";
import type { CommunityResponse } from "../services/contracts";

type NavbarProps = { sticky?: boolean };

export function Navbar({ sticky = true }: NavbarProps) {
  const { user, logout } = useAuth();
  const { communities, activeCommunityId } = useCondominium();
  const [menuOpen, setMenuOpen] = useState(false);
  const [adminCommunities, setAdminCommunities] = useState<CommunityResponse[] | null>(null);

  const activeCommunity = activeCommunityId
    ? communities.find((c) => c.id === activeCommunityId)
    : null;

  // Carrega comunidades de admin assim que o usuário está disponível, para o menu não “pular” ao abrir
  useEffect(() => {
    if (user) {
      CondominiumService.listAdminCommunities()
        .then(setAdminCommunities)
        .catch(() => setAdminCommunities([]));
    } else {
      setAdminCommunities(null);
    }
  }, [user]);

  return (
    <>
      <div className={`border-b border-white/10 bg-[#382D20] dark:bg-[#1c1612] ${sticky ? "sticky top-0 z-10" : ""}`}>
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Link
              to="/feed"
              className="flex shrink-0 items-center rounded overflow-hidden bg-[#382D20] dark:bg-[#1c1612]"
              aria-label="Aqui - Início"
            >
              <img
                src={logoNameDark}
                alt="Aqui"
                className="h-14 w-auto bg-transparent sm:h-16 mix-blend-lighten"
              />
            </Link>
            {activeCommunity ? (
              <Link
                to="/communities"
                className="hidden min-w-0 sm:flex sm:items-center sm:gap-2 sm:rounded-lg sm:border sm:border-white/15 sm:bg-white/5 sm:px-3 sm:py-2 sm:transition hover:sm:bg-white/10 hover:sm:border-white/25"
                title={`Selecionar comunidade · ${activeCommunity.name}`}
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/10">
                  <svg className="h-3.5 w-3.5 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </span>
                <span className="min-w-0 truncate text-sm font-medium text-white/95">
                  {activeCommunity.name}
                </span>
                <svg className="h-4 w-4 shrink-0 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </svg>
              </Link>
            ) : null}
          </div>

          <div className="flex flex-shrink-0 items-center gap-2 text-white">
            {user ? (
              <span className="hidden text-xs text-white/90 sm:inline">{user.name}</span>
            ) : null}
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="hidden sm:inline-flex !text-white hover:!bg-white/10 !border-white/30"
            >
              Sair
            </Button>

            <button
              type="button"
              aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={menuOpen}
              className="flex h-10 w-10 flex-shrink-0 flex-col items-center justify-center gap-1.5 rounded-xl hover:bg-white/10 sm:hidden"
              onClick={() => setMenuOpen((o) => !o)}
            >
              <span
                className={`h-0.5 w-5 rounded-full bg-white transition ${menuOpen ? "translate-y-2 rotate-45" : ""}`}
              />
              <span className={`h-0.5 w-5 rounded-full bg-white transition ${menuOpen ? "opacity-0" : ""}`} />
              <span
                className={`h-0.5 w-5 rounded-full bg-white transition ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`}
              />
            </button>
          </div>
        </div>
        {activeCommunity ? (
          <div className="border-t border-white/10 bg-white/5 sm:hidden">
            <div className="mx-auto flex max-w-5xl items-center px-4 py-2">
              <Link
                to="/communities"
                className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 transition active:bg-white/10"
                onClick={() => setMenuOpen(false)}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <svg className="h-4 w-4 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-white">
                  {activeCommunity.name}
                </span>
                <svg className="h-4 w-4 shrink-0 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        ) : null}
      </div>

      {menuOpen ? (
        <div
          className="fixed inset-0 z-50 sm:hidden"
          aria-hidden="false"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          {/* Fundo transparente – clique fecha o menu */}
          <button
            type="button"
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            aria-label="Fechar menu"
            onClick={() => setMenuOpen(false)}
          />
          {/* Menu compacto alinhado ao canto superior direito */}
          <div
            className="absolute right-3 top-14 min-w-[10rem] rounded-xl border border-border bg-bg shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="flex flex-col gap-0.5 p-2">
              {activeCommunity ? (
                <Link
                  to={`/communities/${activeCommunity.id}`}
                  className="flex items-center gap-2 rounded-xl border border-border/60 bg-surface/50 px-3 py-2.5 shadow-sm hover:bg-surface/70"
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/15">
                    <svg className="h-3 w-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </span>
                  <span className="min-w-0 truncate text-sm font-medium text-text">{activeCommunity.name}</span>
                </Link>
              ) : null}
              {user ? (
                <div className="rounded-lg px-3 py-2 text-sm font-medium text-text">
                  {user.name}
                </div>
              ) : null}
              <Link
                to="/my-account"
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-surface/60"
                onClick={() => setMenuOpen(false)}
              >
                Minha conta
              </Link>
              {adminCommunities === null ? (
                <div className="rounded-lg px-3 py-2 text-xs text-muted">Carregando…</div>
              ) : adminCommunities.length > 0 ? (
                adminCommunities.length === 1 ? (
                  <Link
                    to={`/communities/${adminCommunities[0].id}/admin`}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-surface/60"
                    onClick={() => setMenuOpen(false)}
                  >
                    Administrar comunidade
                  </Link>
                ) : (
                  <>
                    <div className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted">
                      Administrar comunidade
                    </div>
                    {adminCommunities.map((c) => (
                      <Link
                        key={c.id}
                        to={`/communities/${c.id}/admin`}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 pl-5 text-sm font-medium text-muted hover:bg-surface/60"
                        onClick={() => setMenuOpen(false)}
                      >
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-muted" aria-hidden />
                        <span className="min-w-0 truncate">{c.name}</span>
                      </Link>
                    ))}
                  </>
                )
              ) : null}
              <button
                type="button"
                className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-muted hover:bg-surface/60"
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                }}
              >
                Sair
              </button>
            </nav>
          </div>
        </div>
      ) : null}
    </>
  );
}
