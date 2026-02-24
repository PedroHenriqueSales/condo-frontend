import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import logoNameDark from "../assets/logo-name-dark.png";
import { Button } from "./Button";
import * as CondominiumService from "../services/condominium.service";
import type { CommunityResponse } from "../services/contracts";

export function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [adminCommunities, setAdminCommunities] = useState<CommunityResponse[] | null>(null);

  useEffect(() => {
    if (menuOpen && user) {
      CondominiumService.listAdminCommunities()
        .then(setAdminCommunities)
        .catch(() => setAdminCommunities([]));
    } else if (!menuOpen) {
      setAdminCommunities(null);
    }
  }, [menuOpen, user]);

  return (
    <>
      <div className="sticky top-0 z-10 border-b border-white/10 bg-[#1c1612]">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link
            to="/feed"
            className="flex items-center rounded overflow-hidden bg-[#1c1612]"
            aria-label="Aquidolado - Início"
          >
            <img
              src={logoNameDark}
              alt="Aqui do Lado"
              className="h-14 w-auto bg-transparent sm:h-16 mix-blend-lighten"
            />
          </Link>

          <div className="flex items-center gap-2 text-white">
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
              {adminCommunities && adminCommunities.length > 0 ? (
                adminCommunities.length === 1 ? (
                  <Link
                    to={`/communities/${adminCommunities[0].id}/admin`}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-surface/60"
                    onClick={() => setMenuOpen(false)}
                  >
                    Administrar Comunidade
                  </Link>
                ) : (
                  <>
                    <div className="rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
                      Administrar Comunidade
                    </div>
                    {adminCommunities.map((c) => (
                      <Link
                        key={c.id}
                        to={`/communities/${c.id}/admin`}
                        className="rounded-lg px-3 py-2 pl-5 text-sm font-medium text-muted hover:bg-surface/60"
                        onClick={() => setMenuOpen(false)}
                      >
                        {c.name}
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
