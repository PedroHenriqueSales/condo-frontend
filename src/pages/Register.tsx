import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { useAuth } from "../hooks/useAuth";
import { isValidBrazilianPhone, WHATSAPP_PLACEHOLDER, WHATSAPP_VALIDATION_ERROR } from "../utils/whatsapp";
import * as AuthService from "../services/auth.service";

export function Register() {
  const nav = useNavigate();
  const location = useLocation();
  const { register } = useAuth();
  const from = (location.state as { from?: { pathname: string; search: string } } | null)?.from;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [address, setAddress] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [whatsappError, setWhatsappError] = useState<string | null>(null);
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setWhatsappError(null);
    const whatsappTrimmed = whatsapp.trim();
    if (whatsappTrimmed && !isValidBrazilianPhone(whatsappTrimmed)) {
      setWhatsappError(WHATSAPP_VALIDATION_ERROR);
      return;
    }
    setIsLoading(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        whatsapp: whatsapp.trim() || undefined,
        address: address.trim() ? address.trim() : undefined,
        acceptTerms: true,
        acceptPrivacy: true,
      });
      setEmailVerificationSent(true);
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Falha no cadastro.");
    } finally {
      setIsLoading(false);
    }
  }

  async function onResendVerification() {
    setResendError(null);
    setResendLoading(true);
    try {
      await AuthService.resendVerification();
      setResendError(null);
    } catch (err: any) {
      setResendError(err?.response?.data?.error ?? "Não foi possível reenviar. Tente mais tarde.");
    } finally {
      setResendLoading(false);
    }
  }

  if (emailVerificationSent) {
    return (
      <div className="min-h-screen bg-bg">
        <div className="mx-auto max-w-md px-4 py-10">
          <div className="mb-6">
            <div className="text-2xl font-semibold">Conta criada</div>
            <div className="mt-1 text-sm text-muted">
              Verifique seu email para ativar sua conta.
            </div>
          </div>
          <Card>
            <div className="space-y-4">
              <p className="text-text">
                Enviamos um link de verificação para <strong>{email}</strong>. Clique no link para
                confirmar seu email. Se não receber em alguns minutos, verifique a pasta de spam.
              </p>
              {resendError ? <div className="text-sm text-danger">{resendError}</div> : null}
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  disabled={resendLoading}
                  onClick={onResendVerification}
                >
                  {resendLoading ? "Enviando..." : "Reenviar email de verificação"}
                </Button>
                <Button type="button" className="w-full" onClick={() => nav(`/gate${from?.search ?? ""}`, { replace: true })}>
                  Continuar para o app
                </Button>
              </div>
              <div className="text-center text-sm text-muted">
                <Link className="font-medium text-accent-strong hover:underline" to="/login">
                  Ir para o login
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-md px-4 py-10">
        <div className="mb-6">
          <div className="text-2xl font-semibold">Criar conta</div>
          <div className="mt-1 text-sm text-muted">
            Cadastro rápido para entrar no seu condomínio.
          </div>
        </div>

        <Card>
          <form className="space-y-4" onSubmit={onSubmit}>
            <Input
              label="Nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
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
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            <Input
              label="WhatsApp (telefone)"
              inputMode="tel"
              placeholder={WHATSAPP_PLACEHOLDER}
              value={whatsapp}
              onChange={(e) => {
                setWhatsapp(e.target.value);
                if (whatsappError) setWhatsappError(null);
              }}
              required
            />
            {whatsappError ? (
              <div className="-mt-2 text-sm text-danger">{whatsappError}</div>
            ) : null}
            <Input
              label="Endereço (opcional)"
              placeholder="Ex.: Rua, número, bairro, cidade"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-border accent-accent-strong"
              />
              <span className="text-sm text-text">
                Li e aceito os{" "}
                <Link to="/termos-de-uso" className="font-medium text-accent-strong hover:underline">
                  Termos de Uso
                </Link>{" "}
                e a{" "}
                <Link to="/politica-de-privacidade" className="font-medium text-accent-strong hover:underline">
                  Política de Privacidade
                </Link>.
              </span>
            </label>

            {error ? <div className="text-sm text-danger">{error}</div> : null}

            <Button type="submit" className="w-full" disabled={isLoading || !acceptTerms}>
              {isLoading ? "Criando..." : "Criar conta"}
            </Button>

            <div className="text-center text-sm text-muted">
              Já tem conta?{" "}
              <Link className="font-medium text-accent-strong hover:underline" to="/login">
                Entrar
              </Link>
            </div>
          </form>
        </Card>
        <footer className="mt-8 space-y-2 text-center text-sm text-muted">
          <p>
            <Link to="/termos-de-uso" className="hover:underline">Termos de Uso</Link>
            {" · "}
            <Link to="/politica-de-privacidade" className="hover:underline">Política de Privacidade</Link>
          </p>
          <p>
            <a href="mailto:contato@aquiapp.com.br" className="font-medium text-accent-strong hover:underline">
              Fale conosco: contato@aquiapp.com.br
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

