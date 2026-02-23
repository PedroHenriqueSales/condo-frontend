import { useNavigate } from "react-router-dom";
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
      <div className="mx-auto max-w-2xl px-4 py-6">
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
      <BottomNav />
    </div>
  );
}
