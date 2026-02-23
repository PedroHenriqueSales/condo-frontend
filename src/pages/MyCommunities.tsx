import { useNavigate, Link } from "react-router-dom";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Navbar } from "../components/Navbar";
import { BottomNav } from "../components/BottomNav";
import { useCondominium } from "../hooks/useCondominium";

export function MyCommunities() {
  const nav = useNavigate();
  const { communities, isLoading, activeCommunityId, setActiveCommunityId } = useCondominium();

  return (
    <div className="min-h-screen bg-bg pb-24">
      <Navbar />
      <div className="mx-auto max-w-2xl px-4 py-6 pb-52">
        <div className="mb-4 text-2xl font-semibold">Minhas comunidades</div>
        <p className="mb-6 text-sm text-muted">
          Selecione uma comunidade para ver detalhes ou compartilhar o código de acesso.
        </p>

        {isLoading ? (
          <div className="text-sm text-muted">Carregando...</div>
        ) : communities.length === 0 ? (
          <Card>
            <p className="text-sm text-muted">Você ainda não participa de nenhuma comunidade.</p>
          </Card>
        ) : (
          <ul className="flex flex-col gap-3">
            {communities.map((c) => (
              <li key={c.id}>
                <Card
                  className="flex cursor-pointer flex-row flex-wrap items-center justify-between gap-3 border-2 border-border py-4 transition hover:border-primary/50 hover:bg-primary/5 active:scale-[0.99] active:bg-primary/10"
                  onClick={() => {
                    if (c.id !== activeCommunityId) setActiveCommunityId(c.id);
                    nav("/feed");
                  }}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span className="font-semibold text-text">{c.name}</span>
                    <span className="text-primary-strong" aria-hidden>
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      nav(`/communities/${c.id}`);
                    }}
                  >
                    Detalhe
                  </Button>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="fixed bottom-24 left-0 right-0 z-30 border-t border-border bg-bg/95 backdrop-blur-sm" style={{ paddingBottom: "env(safe-area-inset-bottom, 0)" }}>
        <div className="mx-auto flex max-w-2xl items-center justify-center gap-6 px-4 py-3">
          <Link
            to="/communities/new"
            className="flex flex-col items-center gap-1.5 rounded-xl p-3 text-primary-strong transition hover:bg-primary/10 active:bg-primary/15"
            aria-label="Criar comunidade"
            title="Criar comunidade"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-soft">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </span>
            <span className="text-xs font-medium text-text">Criar</span>
          </Link>
          <Link
            to="/gate"
            state={{ from: { pathname: "/communities", search: "" } }}
            className="flex flex-col items-center gap-1.5 rounded-xl p-3 text-muted transition hover:bg-surface/80 hover:text-text active:bg-surface"
            aria-label="Entrar em uma comunidade"
            title="Entrar em uma comunidade"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-border bg-surface">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </span>
            <span className="text-xs font-medium">Entrar</span>
          </Link>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
