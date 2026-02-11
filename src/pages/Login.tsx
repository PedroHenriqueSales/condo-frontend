import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { useAuth } from "../hooks/useAuth";

export function Login() {
  const nav = useNavigate();
  const location = useLocation();
  const { token, login } = useAuth();
  const from = (location.state as { from?: { pathname: string; search: string } } | null)?.from;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      const target = from ? `${from.pathname}${from.search ?? ""}` : "/feed";
      nav(target, { replace: true });
    }
  }, [token, from, nav]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login({ email, password });
      const target = from ? `${from.pathname}${from.search ?? ""}` : "/gate";
      nav(target, { replace: true });
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

            {error ? <div className="text-sm text-danger">{error}</div> : null}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>

            <div className="text-center text-sm text-muted">
              Não tem conta?{" "}
              <Link className="font-medium text-primary-strong hover:underline" to="/register">
                Criar agora
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

