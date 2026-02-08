import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { Navbar } from "../components/Navbar";
import { ShareCommunityModal } from "../components/ShareCommunityModal";
import { useCondominium } from "../hooks/useCondominium";
import type { CommunityResponse } from "../services/contracts";
import * as CondominiumService from "../services/condominium.service";

export function MyCommunities() {
  const nav = useNavigate();
  const {
    communities,
    activeCommunityId,
    setActiveCommunityId,
    refresh,
    isLoading,
  } = useCondominium();
  const [shareCommunity, setShareCommunity] = useState<CommunityResponse | null>(null);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"create" | number | null>(null);

  function onSwitch(id: number) {
    setActiveCommunityId(id);
    nav("/feed", { replace: true });
  }

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy("create");
    try {
      const c = await CondominiumService.createCommunity({ name: newName.trim() });
      setActiveCommunityId(c.id);
      await refresh();
      setNewName("");
      nav("/feed", { replace: true });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg ?? "Falha ao criar comunidade.");
    } finally {
      setBusy(null);
    }
  }

  async function onLeave(c: CommunityResponse) {
    if (!confirm(`Tem certeza que deseja sair da comunidade "${c.name}"?`)) return;
    setError(null);
    setBusy(c.id);
    try {
      await CondominiumService.leaveCommunity(c.id);
      const remaining = communities.filter((x) => x.id !== c.id);
      if (remaining.length > 0 && activeCommunityId === c.id) {
        setActiveCommunityId(remaining[0].id);
      }
      await refresh();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg ?? "Falha ao sair da comunidade.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="min-h-screen bg-bg pb-20">
      <Navbar />
      <div className="mx-auto max-w-2xl px-4 py-6">
        <div className="mb-4 text-2xl font-semibold">Minhas comunidades</div>
        <p className="mb-4 text-sm text-muted">
          Gerencie suas comunidades e compartilhe o código de acesso com vizinhos.
        </p>

        {error ? <div className="mb-4 text-sm text-danger">{error}</div> : null}

        <Card className="mb-4">
          <div className="mb-3 text-sm font-semibold">Criar comunidade</div>
          <form className="space-y-3" onSubmit={onCreate}>
            <Input
              label="Nome do condomínio"
              placeholder="Ex.: Residencial Jardim"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" disabled={busy !== null}>
              {busy === "create" ? "Criando..." : "Criar comunidade"}
            </Button>
          </form>
        </Card>

        {isLoading ? (
          <div className="text-sm text-muted">Carregando...</div>
        ) : (
          <div className="grid gap-3">
            {communities.map((c) => (
              <Card key={c.id}>
                <div className="flex items-start justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => onSwitch(c.id)}
                    className={`min-w-0 flex-1 cursor-pointer rounded-lg py-1 pr-2 text-left transition focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                      activeCommunityId === c.id
                        ? "bg-primary/10"
                        : "hover:bg-surface/60"
                    }`}
                  >
                    <div className="font-semibold">{c.name}</div>
                    <div className="mt-1 text-xs text-muted">
                      Código: <span className="font-mono">{c.accessCode}</span>
                    </div>
                  </button>
                  <div className="flex flex-shrink-0 flex-wrap justify-end gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShareCommunity(c);
                      }}
                    >
                      Compartilhar
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onLeave(c);
                      }}
                      disabled={busy !== null}
                    >
                      {busy === c.id ? "Saindo..." : "Deixar"}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

            {communities.length === 0 ? (
              <div className="rounded-2xl border border-border bg-surface p-6 text-center text-sm text-muted shadow-soft">
                Você ainda não participa de nenhuma comunidade. Crie uma acima ou peça um código para entrar.
              </div>
            ) : null}
          </div>
        )}
      </div>

      {shareCommunity ? (
        <ShareCommunityModal
          community={shareCommunity}
          onClose={() => setShareCommunity(null)}
        />
      ) : null}
    </div>
  );
}
