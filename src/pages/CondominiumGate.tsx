import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { useAuth } from "../hooks/useAuth";
import { useCondominium } from "../hooks/useCondominium";
import * as CondominiumService from "../services/condominium.service";

export function CondominiumGate() {
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const { logout } = useAuth();
  const {
    communities,
    activeCommunityId,
    isLoading,
    refresh,
    setActiveCommunityId,
  } = useCondominium();

  const codeFromUrl = searchParams.get("code") ?? "";
  const [accessCode, setAccessCode] = useState(codeFromUrl || "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"join" | null>(null);

  useEffect(() => {
    if (codeFromUrl) setAccessCode(codeFromUrl);
  }, [codeFromUrl]);

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

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <div className="text-2xl font-semibold">Entrar na comunidade</div>
            <div className="mt-1 text-sm text-muted">
              Para manter a confiança e exclusividade, você entra por convite (código de acesso).
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={logout}>
            Sair
          </Button>
        </div>

        {isLoading ? (
          <div className="text-sm text-muted">Carregando...</div>
        ) : null}

        {error ? <div className="mb-4 text-sm text-danger">{error}</div> : null}

        <div className="max-w-sm">
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
        </div>
      </div>
    </div>
  );
}

