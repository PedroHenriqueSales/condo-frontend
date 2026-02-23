import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import * as AuthService from "../services/auth.service";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await AuthService.forgotPassword(email.trim());
      setSent(true);
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Não foi possível processar. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-md px-4 py-10">
        <div className="mb-6">
          <div className="text-2xl font-semibold">Esqueci minha senha</div>
          <div className="mt-1 text-sm text-muted">
            Informe seu email e enviaremos um link para redefinir a senha.
          </div>
        </div>

        <Card>
          {sent ? (
            <div className="space-y-4">
              <p className="text-text">
                Se existir uma conta com esse email, você receberá um link para redefinir a senha em
                alguns minutos. Verifique também a pasta de spam.
              </p>
              <Link to="/login">
                <Button className="w-full">Voltar ao login</Button>
              </Link>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={onSubmit}>
              <Input
                label="Email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {error ? <div className="text-sm text-danger">{error}</div> : null}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Enviando..." : "Enviar link"}
              </Button>
              <div className="text-center text-sm text-muted">
                <Link className="font-medium text-accent-strong hover:underline" to="/login">
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
