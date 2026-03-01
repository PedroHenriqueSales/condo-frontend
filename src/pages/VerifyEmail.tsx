import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { useAuth } from "../hooks/useAuth";
import * as AuthService from "../services/auth.service";

type Status = "loading" | "success" | "error";

export function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { token: authToken, setEmailVerified } = useAuth();
  const [status, setStatus] = useState<Status>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token || token.trim() === "") {
      setStatus("error");
      setErrorMessage("Link inválido. Falta o token de verificação.");
      return;
    }
    AuthService.verifyEmail(token)
      .then(() => {
        if (authToken) setEmailVerified(true);
        setStatus("success");
      })
      .catch((err: any) => {
        setStatus("error");
        const msg = err?.response?.data?.message ?? err?.response?.data?.error ?? err?.message;
        setErrorMessage(msg || "Token inválido ou expirado.");
      });
  }, [token, authToken, setEmailVerified]);

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-md px-4 py-10">
        <div className="mb-6">
          <div className="text-2xl font-semibold">Verificação de email</div>
          <div className="mt-1 text-sm text-muted">
            Confirmando sua conta no Aquidolado.
          </div>
        </div>

        <Card>
          {status === "loading" && (
            <div className="py-6 text-center text-muted">Verificando...</div>
          )}

          {status === "success" && (
            <div className="space-y-4">
              <p className="text-text">
                Seu email foi confirmado. Você já pode entrar na sua conta.
              </p>
              <Link to="/login">
                <Button className="w-full">Ir para o login</Button>
              </Link>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-4">
              <p className="text-sm text-danger">{errorMessage}</p>
              <p className="text-sm text-muted">
                Faça login e use a opção &quot;Reenviar verificação&quot; para receber um novo email, ou
                crie uma nova conta.
              </p>
              <div className="flex flex-col gap-2">
                <Link to="/login">
                  <Button className="w-full">Ir para o login</Button>
                </Link>
                <Link to="/register">
                  <Button variant="ghost" className="w-full">Criar conta</Button>
                </Link>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
