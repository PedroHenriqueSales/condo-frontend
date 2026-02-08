import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { useCondominium } from "../hooks/useCondominium";
import * as CondominiumService from "../services/condominium.service";

export function CondominiumGate() {
  const nav = useNavigate();
  const {
    communities,
    activeCommunityId,
    isLoading,
    refresh,
    setActiveCommunityId,
  } = useCondominium();

  const [accessCode, setAccessCode] = useState("");
  const [newName, setNewName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"join" | "create" | null>(null);

  useEffect(() => {
    refresh().catch((err) => {
      setError(err?.response?.data?.error ?? "Falha ao carregar comunidades.");
    });
  }, [refresh]);

  useEffect(() => {
    if (communities.length && activeCommunityId) {
      nav("/feed", { replace: true });
    }
  }, [communities.length, activeCommunityId, nav]);

  async function onJoin(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy("join");
    try {
      const c = await CondominiumService.joinCommunity({ accessCode: accessCode.trim() });
      setActiveCommunityId(c.id);
      await refresh();
      nav("/feed", { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Código inválido.");
    } finally {
      setBusy(null);
    }
  }

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy("create");
    try {
      const c = await CondominiumService.createCommunity({ name: newName.trim() });
      setActiveCommunityId(c.id);
      await refresh();
      nav("/feed", { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Falha ao criar comunidade.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-6">
          <div className="text-2xl font-semibold">Entrar ou criar comunidade</div>
          <div className="mt-1 text-sm text-muted">
            Para manter a confiança e exclusividade, você só entra por convite (código de acesso).
          </div>
        </div>

        {isLoading ? (
          <div className="text-sm text-muted">Carregando...</div>
        ) : null}

        {error ? <div className="mb-4 text-sm text-danger">{error}</div> : null}

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <div className="mb-3 text-sm font-semibold">Tenho um código</div>
            <form className="space-y-3" onSubmit={onJoin}>
              <Input
                label="Código de acesso"
                placeholder="Ex.: A1B2C3D4"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                required
              />
              <Button className="w-full" disabled={busy !== null}>
                {busy === "join" ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          </Card>

          <Card>
            <div className="mb-3 text-sm font-semibold">Criar comunidade</div>
            <form className="space-y-3" onSubmit={onCreate}>
              <Input
                label="Nome do condomínio"
                placeholder="Ex.: Residencial Jardim"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
              <Button className="w-full" disabled={busy !== null}>
                {busy === "create" ? "Criando..." : "Criar"}
              </Button>
              <div className="text-xs text-muted">
                Ao criar, você entra automaticamente como membro e recebe um código para convidar vizinhos.
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}

