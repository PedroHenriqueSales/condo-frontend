import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import * as AuthService from "../services/auth.service";

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get("token") ?? "";
  const [token, setToken] = useState(tokenFromUrl);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setToken(tokenFromUrl);
  }, [tokenFromUrl]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    if (!token.trim()) {
      setError("Link inválido. Use o link que enviamos no seu email.");
      return;
    }
    setIsLoading(true);
    try {
      await AuthService.resetPassword(token.trim(), password);
      setSuccess(true);
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Link inválido ou expirado. Solicite um novo.");
    } finally {
      setIsLoading(false);
    }
  }

  if (!tokenFromUrl.trim()) {
    return (
      <div className="min-h-screen bg-bg">
        <div className="mx-auto max-w-md px-4 py-10">
          <div className="mb-6">
            <div className="text-2xl font-semibold">Redefinir senha</div>
            <div className="mt-1 text-sm text-muted">
              Use o link que enviamos no seu email para redefinir a senha.
            </div>
          </div>
          <Card>
            <p className="text-sm text-muted mb-4">
              Este link está incompleto. Acesse o email que enviamos e clique no link de
              redefinição.
            </p>
            <Link to="/forgot-password">
              <Button variant="ghost" className="w-full">Solicitar novo link</Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-md px-4 py-10">
        <div className="mb-6">
          <div className="text-2xl font-semibold">Nova senha</div>
          <div className="mt-1 text-sm text-muted">
            Defina uma nova senha para sua conta.
          </div>
        </div>

        <Card>
          {success ? (
            <div className="space-y-4">
              <p className="text-text">Sua senha foi alterada. Faça login com a nova senha.</p>
              <Link to="/login">
                <Button className="w-full">Ir para o login</Button>
              </Link>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={onSubmit}>
              <Input
                label="Nova senha"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <Input
                label="Confirmar nova senha"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
              {error ? <div className="text-sm text-danger">{error}</div> : null}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Salvando..." : "Redefinir senha"}
              </Button>
              <div className="text-center text-sm text-muted">
                <Link className="font-medium text-primary-strong hover:underline" to="/login">
                  Voltar ao login
                </Link>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
