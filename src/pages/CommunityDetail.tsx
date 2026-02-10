import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Navbar } from "../components/Navbar";
import { useCondominium } from "../hooks/useCondominium";
import * as CondominiumService from "../services/condominium.service";
import type { CommunityResponse } from "../services/contracts";

function formatCreatedAt(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function CommunityDetail() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const { refresh } = useCondominium();
  const [community, setCommunity] = useState<CommunityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leaveBusy, setLeaveBusy] = useState(false);
  const [leaveError, setLeaveError] = useState<string | null>(null);

  useEffect(() => {
    const rawId = id ?? "";
    const numId = Number(rawId);
    if (!rawId || Number.isNaN(numId)) {
      setError("Comunidade inválida.");
      setLoading(false);
      return;
    }
    setError(null);
    setLoading(true);
    CondominiumService.getCommunityById(numId)
      .then(setCommunity)
      .catch((err) => {
        setError(err?.response?.data?.error ?? "Falha ao carregar detalhes da comunidade.");
        setCommunity(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleLeave() {
    if (!community || leaveBusy) return;
    setLeaveError(null);
    setLeaveBusy(true);
    try {
      await CondominiumService.leaveCommunity(community.id);
      await refresh();
      nav("/communities", { replace: true });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setLeaveError(msg ?? "Não foi possível sair da comunidade.");
    } finally {
      setLeaveBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg pb-20">
        <Navbar />
        <div className="mx-auto max-w-2xl px-4 py-6">
          <div className="text-sm text-muted">Carregando...</div>
        </div>
      </div>
    );
  }

  if (error || !community) {
    return (
      <div className="min-h-screen bg-bg pb-20">
        <Navbar />
        <div className="mx-auto max-w-2xl px-4 py-6">
          <p className="mb-4 text-sm text-danger">{error ?? "Comunidade não encontrada."}</p>
          <Button variant="ghost" onClick={() => nav("/communities")}>
            Voltar para Minhas comunidades
          </Button>
        </div>
      </div>
    );
  }

  const memberNames = community.memberNames ?? [];

  return (
    <div className="min-h-screen bg-bg pb-20">
      <Navbar />
      <div className="mx-auto max-w-2xl px-4 py-6">
        <div className="mb-2 flex items-center gap-2 text-sm text-muted">
          <Link to="/communities" className="hover:text-primary-strong">
            Minhas comunidades
          </Link>
          <span aria-hidden>/</span>
          <span className="text-text">{community.name}</span>
        </div>
        <h1 className="mb-6 text-2xl font-semibold">Detalhes da minha comunidade</h1>

        <div className="space-y-4">
          <Card>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-muted">Nome da comunidade</dt>
                <dd className="font-medium text-text">{community.name}</dd>
              </div>
              <div>
                <dt className="text-muted">Código de acesso</dt>
                <dd className="font-mono text-lg font-semibold tracking-wider text-text">
                  {community.accessCode}
                </dd>
              </div>
              <div>
                <dt className="text-muted">Data de criação</dt>
                <dd className="text-text">{formatCreatedAt(community.createdAt)}</dd>
              </div>
              {community.createdByName != null && (
                <div>
                  <dt className="text-muted">Criada por</dt>
                  <dd className="text-text">{community.createdByName}</dd>
                </div>
              )}
            </dl>
          </Card>

          <Card>
            <h2 className="mb-3 text-sm font-semibold text-text">Membros</h2>
            {memberNames.length === 0 ? (
              <p className="text-sm text-muted">Nenhum membro listado.</p>
            ) : (
              <ul className="list-inside list-disc space-y-1 text-sm text-text">
                {memberNames.map((name) => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
            )}
          </Card>

          {leaveError ? (
            <p className="text-sm text-danger">{leaveError}</p>
          ) : null}

          <Button
            variant="danger"
            className="w-full sm:w-auto"
            disabled={leaveBusy}
            onClick={handleLeave}
          >
            {leaveBusy ? "Saindo..." : "Deixar comunidade"}
          </Button>
        </div>
      </div>
    </div>
  );
}
