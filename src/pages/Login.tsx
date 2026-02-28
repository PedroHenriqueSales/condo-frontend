import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { useAuth } from "../hooks/useAuth";
import { useCondominium } from "../hooks/useCondominium";

export function Login() {
  const nav = useNavigate();
  const location = useLocation();
  const { token, login } = useAuth();
  const { refresh, setActiveCommunityId } = useCondominium();
  const from = (location.state as { from?: { pathname: string; search: string } } | null)?.from;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    refresh().then((list) => {
      const isInviteToGate = from?.pathname === "/gate" && from?.search;
      const isAdLink = from?.pathname?.startsWith("/ads/");
      if (isInviteToGate) {
        nav(`/gate${from.search ?? ""}`, { replace: true });
      } else if (isAdLink && from && list.length > 0) {
        if (list.length === 1) setActiveCommunityId(list[0].id);
        nav(`${from.pathname}${from.search ?? ""}`, { replace: true });
      } else if (list.length === 0) {
        nav("/gate", { replace: true });
      } else if (list.length === 1) {
        setActiveCommunityId(list[0].id);
        nav("/feed", { replace: true });
      } else if (from) {
        nav(`${from.pathname}${from.search ?? ""}`, { replace: true });
      } else {
        nav("/communities", { replace: true });
      }
    });
  }, [token, from, nav, refresh, setActiveCommunityId]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login({ email, password });
      // Redirecionamento: o useEffect (ao detectar token) faz refresh e redireciona (1 comunidade → feed, várias → from ou seleção)
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Falha no login. Verifique suas credenciais.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-md px-4 py-10">
        <div className="mb-6">
          <div className="text-2xl font-semibold">Entrar</div>
          <div className="mt-1 text-sm text-muted">
            Acesse sua comunidade do condomínio.
          </div>
        </div>

        <Card>
          <form className="space-y-4" onSubmit={onSubmit}>
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Senha"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="text-right text-sm">
              <Link className="text-accent-strong hover:underline" to="/forgot-password">
                Esqueci minha senha
              </Link>
            </div>

            {error ? <div className="text-sm text-danger">{error}</div> : null}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>

            <div className="text-center text-sm text-muted">
              Não tem conta?{" "}
              <Link className="font-medium text-accent-strong hover:underline" to="/register">
                Criar agora
              </Link>
            </div>
          </form>
        </Card>
        <footer className="mt-8 text-center text-sm text-muted">
          <Link to="/termos-de-uso" className="hover:underline">Termos de Uso</Link>
          {" · "}
          <Link to="/politica-de-privacidade" className="hover:underline">Política de Privacidade</Link>
        </footer>
      </div>
    </div>
  );
}

