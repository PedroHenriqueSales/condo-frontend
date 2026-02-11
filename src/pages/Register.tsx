import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { useAuth } from "../hooks/useAuth";

export function Register() {
  const nav = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [address, setAddress] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        whatsapp: whatsapp.trim(),
        address: address.trim() ? address.trim() : undefined,
      });
      nav("/gate", { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Falha no cadastro.");
    } finally {
      setIsLoading(false);
    }
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
              placeholder="Ex.: 11 99999-9999 ou +55 11 99999-9999"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              required
            />
            <Input
              label="Endereço (opcional)"
              placeholder="Ex.: Rua, número, bairro, cidade"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />

            {error ? <div className="text-sm text-danger">{error}</div> : null}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Criando..." : "Criar conta"}
            </Button>

            <div className="text-center text-sm text-muted">
              Já tem conta?{" "}
              <Link className="font-medium text-primary-strong hover:underline" to="/login">
                Entrar
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

