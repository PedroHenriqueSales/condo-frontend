import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useSearchParams, useLocation, Link } from "react-router-dom";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { useAuth } from "../hooks/useAuth";
import { useCondominium } from "../hooks/useCondominium";
import * as CondominiumService from "../services/condominium.service";

export function CondominiumGate() {
  const nav = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { logout } = useAuth();
  const from = (location.state as { from?: { pathname: string; search: string } } | null)?.from;
  const codeFromUrl = searchParams.get("code") ?? "";
  const {
    communities,
    activeCommunityId,
    isLoading,
    refresh,
    setActiveCommunityId,
  } = useCondominium();

  const [accessCode, setAccessCode] = useState(codeFromUrl || "");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState<"join" | null>(null);

  useEffect(() => {
    if (codeFromUrl) setAccessCode(codeFromUrl);
  }, [codeFromUrl]);

  useEffect(() => {
    refresh().catch((err) => {
      setError(err?.response?.data?.error ?? "Falha ao carregar comunidades.");
    });
  }, [refresh]);

  // Redireciona só quando chegou na gate sem "from" (ex.: após login) e já tem comunidade ativa.
  // Se veio de "Entrar em uma comunidade" (state from), permanece na gate para poder entrar em outra.
  useEffect(() => {
    if (!from && communities.length > 0 && activeCommunityId) {
      nav("/communities", { replace: true });
    }
  }, [from, communities.length, activeCommunityId, nav]);

  async function onJoin(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setBusy("join");
    try {
      const c = await CondominiumService.joinCommunity({ accessCode: accessCode.trim() });
      if (c.joinPending) {
        setSuccessMessage("Solicitação enviada. Aguarde a aprovação do administrador da comunidade.");
        setAccessCode("");
        return;
      }
      setActiveCommunityId(c.id);
      await refresh();
      const target = from ? `${from.pathname}${from.search ?? ""}` : "/communities";
      nav(target, { replace: true });
    } catch (err: any) {
      const msg = err?.response?.data?.error;
      if (msg) {
        setError(msg);
      } else {
        setError("Não foi possível entrar. Verifique o código e tente novamente.");
      }
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

        {error ? (
          <div className="mb-4 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
            {error}
          </div>
        ) : null}
        {successMessage ? (
          <div className="mb-4 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary-strong">
            {successMessage}
          </div>
        ) : null}

        <div className="flex max-w-sm flex-col gap-4">
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

          <Card className="border-2 border-dashed border-border">
            <p className="mb-3 text-sm text-muted">
              Quer criar uma nova comunidade? Você será o administrador inicial.
            </p>
            <Link to="/communities/new">
              <Button type="button" variant="ghost" className="w-full">
                Criar comunidade
              </Button>
            </Link>
          </Card>
          {communities.length > 0 ? (
            <p className="text-center text-sm text-muted">
              <Link to="/communities" className="font-medium text-accent-strong hover:underline">
                Voltar para Minhas comunidades
              </Link>
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

