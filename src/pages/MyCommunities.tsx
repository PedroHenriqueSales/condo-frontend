import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Navbar } from "../components/Navbar";
import { useCondominium } from "../hooks/useCondominium";

export function MyCommunities() {
  const nav = useNavigate();
  const { communities, isLoading } = useCondominium();

  return (
    <div className="min-h-screen bg-bg pb-20">
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
                <Card className="flex flex-row flex-wrap items-center justify-between gap-3">
                  <span className="font-medium text-text">{c.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => nav(`/communities/${c.id}`)}
                  >
                    Detalhe
                  </Button>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
