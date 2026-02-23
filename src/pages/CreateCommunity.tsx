import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { Navbar } from "../components/Navbar";
import { useCondominium } from "../hooks/useCondominium";
import * as CondominiumService from "../services/condominium.service";

function formatPostalCode(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export function CreateCommunity() {
  const nav = useNavigate();
  const { refresh, setActiveCommunityId } = useCondominium();
  const [name, setName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [postalCode, setPostalCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function handlePostalCodeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setPostalCode(formatPostalCode(v));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const normalizedCep = postalCode.replace(/\D/g, "");
    if (normalizedCep.length !== 8) {
      setError("CEP deve ter 8 dígitos.");
      return;
    }
    setBusy(true);
    try {
      const c = await CondominiumService.createCommunity({
        name: name.trim(),
        isPrivate,
        postalCode: normalizedCep,
      });
      await refresh();
      setActiveCommunityId(c.id);
      nav("/communities", { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Falha ao criar comunidade.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg pb-24">
      <Navbar />
      <div className="mx-auto max-w-2xl px-4 py-6">
        <div className="mb-2 flex items-center gap-2 text-sm text-muted">
          <Link to="/gate" className="hover:text-accent-strong">
            Entrar na comunidade
          </Link>
          <span aria-hidden>/</span>
          <span className="text-text">Criar comunidade</span>
        </div>
        <h1 className="mb-6 text-2xl font-semibold">Criar comunidade</h1>

        <Card>
          <form className="space-y-4" onSubmit={onSubmit}>
            <Input
              label="Nome da comunidade"
              placeholder="Ex.: Condomínio Solar"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <div>
              <div className="mb-1 text-sm font-medium text-text">Tipo</div>
              <div className="flex gap-4">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="type"
                    checked={!isPrivate}
                    onChange={() => setIsPrivate(false)}
                    className="text-primary"
                  />
                  <span className="text-sm">Aberta</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="type"
                    checked={isPrivate}
                    onChange={() => setIsPrivate(true)}
                    className="text-primary"
                  />
                  <span className="text-sm">Privada</span>
                </label>
              </div>
              <p className="mt-1 text-xs text-muted">
                {isPrivate
                  ? "Na comunidade privada, o administrador precisa aprovar quem entra."
                  : "Na comunidade aberta, quem tem o código pode entrar diretamente."}
              </p>
            </div>

            <Input
              label="CEP (localização)"
              placeholder="00000-000"
              value={postalCode}
              onChange={handlePostalCodeChange}
              maxLength={9}
              required
            />

            {error ? (
              <p className="text-sm text-danger">{error}</p>
            ) : null}

            <div className="flex gap-3">
              <Button type="submit" disabled={busy} className="flex-1">
                {busy ? "Criando..." : "Criar comunidade"}
              </Button>
              <Link to="/gate">
                <Button type="button" variant="ghost">
                  Cancelar
                </Button>
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
