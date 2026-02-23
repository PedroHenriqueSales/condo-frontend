import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Navbar } from "../components/Navbar";
import { BottomNav } from "../components/BottomNav";
import { ShareCommunityModal } from "../components/ShareCommunityModal";
import * as CondominiumService from "../services/condominium.service";
import type { CommunityResponse, JoinRequestResponse } from "../services/contracts";

export function CommunityAdmin() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const [community, setCommunity] = useState<CommunityResponse | null>(null);
  const [requests, setRequests] = useState<JoinRequestResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionBusy, setActionBusy] = useState<string | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState("");
  const [shareOpen, setShareOpen] = useState(false);

  const communityId = id ? Number(id) : NaN;

  useEffect(() => {
    if (!id || Number.isNaN(communityId)) {
      setError("Comunidade inválida.");
      setLoading(false);
      return;
    }
    setError(null);
    setLoading(true);
    CondominiumService.getCommunityById(communityId)
      .then((c) => {
        if (!c.isAdmin) {
          nav("/communities", { replace: true });
          return;
        }
        setCommunity(c);
        if (c.isPrivate) {
          return CondominiumService.getCommunityJoinRequests(communityId);
        }
        return [];
      })
      .then((reqs) => {
        if (Array.isArray(reqs)) setRequests(reqs);
      })
      .catch((err) => {
        const msg = err?.response?.data?.error ?? "Falha ao carregar.";
        if (err?.response?.status === 400) {
          nav("/communities", { replace: true });
          return;
        }
        setError(msg);
        setCommunity(null);
      })
      .finally(() => setLoading(false));
  }, [id, communityId, nav]);

  async function loadRequests() {
    if (!community?.isPrivate) return;
    try {
      const reqs = await CondominiumService.getCommunityJoinRequests(communityId);
      setRequests(reqs);
    } catch {
      // ignore
    }
  }

  async function handleApprove(requestId: number) {
    setActionBusy(`approve-${requestId}`);
    try {
      await CondominiumService.approveJoinRequest(communityId, requestId);
      await loadRequests();
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Falha ao aprovar.");
    } finally {
      setActionBusy(null);
    }
  }

  async function handleReject(requestId: number) {
    setActionBusy(`reject-${requestId}`);
    try {
      await CondominiumService.rejectJoinRequest(communityId, requestId);
      await loadRequests();
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Falha ao rejeitar.");
    } finally {
      setActionBusy(null);
    }
  }

  async function handleAddAdmin(userId: number) {
    setActionBusy(`admin-${userId}`);
    try {
      await CondominiumService.addCommunityAdmin(communityId, userId);
      const updated = await CondominiumService.getCommunityById(communityId);
      setCommunity(updated);
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Falha ao adicionar administrador.");
    } finally {
      setActionBusy(null);
    }
  }

  async function handleLeaveAdminRole() {
    if (!confirm("Deixar de ser administrador desta comunidade? Você continuará como membro.")) return;
    setActionBusy("leave-role");
    try {
      await CondominiumService.leaveAdminRole(communityId);
      nav(`/communities/${communityId}`, { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Falha ao sair do cargo.");
    } finally {
      setActionBusy(null);
    }
  }

  async function handleSaveName() {
    const name = editNameValue.trim();
    if (!name || name === community.name) {
      setEditingName(false);
      return;
    }
    setActionBusy("save-name");
    try {
      const updated = await CondominiumService.updateCommunityName(communityId, { name });
      setCommunity(updated);
      setEditingName(false);
      setEditNameValue("");
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Falha ao salvar o nome.");
    } finally {
      setActionBusy(null);
    }
  }

  function startEditingName() {
    setEditNameValue(community.name);
    setEditingName(true);
  }

  async function handleRegenerateCode() {
    const ok = confirm(
      "O código atual deixará de funcionar. Quem ainda não entrou na comunidade precisará do novo código para entrar. Deseja realmente gerar um novo código?"
    );
    if (!ok) return;
    setActionBusy("regenerate-code");
    try {
      const updated = await CondominiumService.regenerateAccessCode(communityId);
      setCommunity(updated);
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Falha ao gerar novo código.");
    } finally {
      setActionBusy(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg pb-24">
        <Navbar />
        <div className="mx-auto max-w-2xl px-4 py-6">
          <div className="text-sm text-muted">Carregando...</div>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (error && !community) {
    return (
      <div className="min-h-screen bg-bg pb-24">
        <Navbar />
        <div className="mx-auto max-w-2xl px-4 py-6">
          <p className="mb-4 text-sm text-danger">{error}</p>
          <Button variant="ghost" onClick={() => nav("/communities")}>
            Voltar para Minhas comunidades
          </Button>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!community) return null;

  const adminIds = new Set(community.adminIds ?? []);
  const members = community.members ?? [];

  return (
    <div className="min-h-screen bg-bg pb-24">
      <Navbar />
      <div className="mx-auto max-w-2xl px-4 py-6">
        <h1 className="mb-6 text-2xl font-semibold">Administração da comunidade</h1>

        {error ? (
          <div className="mb-4 text-sm text-danger">{error}</div>
        ) : null}

        <div className="space-y-6">
          <Card>
            <h2 className="mb-3 text-base font-semibold text-text">Dados da comunidade</h2>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-muted">Nome</dt>
                <dd className="font-medium">
                  {editingName ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="text"
                        value={editNameValue}
                        onChange={(e) => setEditNameValue(e.target.value)}
                        className="h-9 flex-1 min-w-0 rounded-lg border border-border bg-surface px-2 text-text"
                        placeholder="Nome da comunidade"
                        autoFocus
                      />
                      <Button
                        size="sm"
                        disabled={actionBusy !== null}
                        onClick={handleSaveName}
                      >
                        {actionBusy === "save-name" ? "Salvando..." : "Salvar"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={actionBusy !== null}
                        onClick={() => { setEditingName(false); setEditNameValue(""); }}
                      >
                        Cancelar
                      </Button>
                    </div>
                  ) : (
                    <span className="flex items-center gap-2">
                      {community.name}
                      <button
                        type="button"
                        className="text-xs font-medium text-primary-strong hover:underline"
                        onClick={startEditingName}
                      >
                        Editar
                      </button>
                    </span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-muted">Tipo</dt>
                <dd className="font-medium">{community.isPrivate ? "Privada" : "Aberta"}</dd>
              </div>
              <div>
                <dt className="text-muted">CEP</dt>
                <dd className="font-medium">{community.postalCode ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-muted">Código de acesso</dt>
                <dd className="font-medium">
                  <span className="font-mono text-lg font-semibold tracking-wider">{community.accessCode}</span>
                  <button
                    type="button"
                    className="ml-2 inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted transition hover:bg-surface/80 hover:text-text disabled:opacity-50"
                    onClick={handleRegenerateCode}
                    disabled={actionBusy !== null}
                    title="Gerar novo código"
                    aria-label="Gerar novo código"
                  >
                    {actionBusy === "regenerate-code" ? (
                      <span className="text-xs">...</span>
                    ) : (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    )}
                  </button>
                </dd>
              </div>
            </dl>
            <Button
              variant="ghost"
              className="mt-3 w-full sm:w-auto"
              onClick={() => setShareOpen(true)}
            >
              Compartilhar comunidade
            </Button>
          </Card>

          {community.isPrivate ? (
            <Card>
              <h2 className="mb-3 text-base font-semibold text-text">Solicitações de entrada</h2>
              {requests.length === 0 ? (
                <p className="text-sm text-muted">Nenhuma solicitação pendente.</p>
              ) : (
                <ul className="space-y-3">
                  {requests.map((r) => (
                    <li
                      key={r.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-surface/30 p-3"
                    >
                      <div>
                        <span className="font-medium">{r.userName}</span>
                        <span className="ml-2 text-xs text-muted">
                          {new Date(r.createdAt).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          disabled={actionBusy !== null}
                          onClick={() => handleApprove(r.id)}
                        >
                          {actionBusy === `approve-${r.id}` ? "Aprovando..." : "Aprovar"}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={actionBusy !== null}
                          onClick={() => handleReject(r.id)}
                        >
                          {actionBusy === `reject-${r.id}` ? "Rejeitando..." : "Rejeitar"}
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          ) : null}

          <Card>
            <h2 className="mb-3 text-base font-semibold text-text">Administradores</h2>
            <p className="mb-3 text-xs text-muted">
              Adicione outros membros como administradores. Eles poderão aprovar solicitações e gerenciar a comunidade.
            </p>
            {members.length === 0 ? (
              <p className="text-sm text-muted">Nenhum membro listado.</p>
            ) : (
              <ul className="space-y-2">
                {members.map((m) => (
                  <li
                    key={m.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-surface/30 px-3 py-2"
                  >
                    <span className="text-sm font-medium">{m.name}</span>
                    {adminIds.has(m.id) ? (
                      <span className="text-xs text-muted">Administrador</span>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={actionBusy !== null}
                        onClick={() => handleAddAdmin(m.id)}
                      >
                        {actionBusy === `admin-${m.id}` ? "Adicionando..." : "Tornar admin"}
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <h2 className="mb-2 text-base font-semibold text-text">Deixar de ser administrador</h2>
            <p className="mb-3 text-xs text-muted">
              Você continuará como membro da comunidade, mas não poderá mais gerenciar solicitações nem administradores.
            </p>
            <Button
              variant="ghost"
              disabled={actionBusy !== null}
              onClick={handleLeaveAdminRole}
            >
              {actionBusy === "leave-role" ? "Saindo do cargo..." : "Deixar de ser administrador"}
            </Button>
          </Card>
        </div>
      </div>

      {shareOpen && (
        <ShareCommunityModal
          community={community}
          onClose={() => setShareOpen(false)}
        />
      )}
      <BottomNav />
    </div>
  );
}
