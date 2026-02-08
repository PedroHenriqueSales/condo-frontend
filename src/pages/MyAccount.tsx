import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { Navbar } from "../components/Navbar";
import { useAuth } from "../hooks/useAuth";
import * as UsersService from "../services/users.service";

export function MyAccount() {
  const { updateUser } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      setError(null);
      setLoading(true);
      try {
        const profile = await UsersService.getProfile();
        setName(profile.name);
        setEmail(profile.email);
        setWhatsapp(profile.whatsapp ?? "");
      } catch (err: any) {
        setError(err?.response?.data?.error ?? "Falha ao carregar perfil.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setSaving(true);
    setSuccess(false);
    try {
      const profile = await UsersService.updateProfile({
        name: name.trim(),
        whatsapp: whatsapp.trim() ? whatsapp.trim() : undefined,
      });
      updateUser({ name: profile.name });
      setSuccess(true);
    } catch (err: any) {
      const data = err?.response?.data;
      if (data?.errors && typeof data.errors === "object") {
        setFieldErrors(data.errors);
        setError(Object.values(data.errors).join(" "));
      } else {
        setError(data?.error ?? "Falha ao salvar perfil.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg pb-20">
      <Navbar />
      <div className="mx-auto max-w-md px-4 py-6">
        <div className="mb-4 text-2xl font-semibold">Minha conta</div>
        <p className="mb-4 text-sm text-muted">
          Edite seu nome e telefone. O email não pode ser alterado.
        </p>

        {loading ? (
          <div className="text-sm text-muted">Carregando...</div>
        ) : (
          <Card>
            <form className="space-y-4" onSubmit={onSubmit}>
              <Input
                label="Nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={fieldErrors.name}
                required
              />
              <Input
                label="Email"
                type="email"
                value={email}
                disabled
                className="cursor-not-allowed opacity-70"
              />
              <Input
                label="WhatsApp (telefone)"
                inputMode="tel"
                placeholder="Ex.: +55 11 99999-9999"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                error={fieldErrors.whatsapp}
              />

              {error ? <div className="text-sm text-danger">{error}</div> : null}
              {success ? (
                <div className="text-sm font-medium text-primary-strong">Perfil salvo com sucesso.</div>
              ) : null}

              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? "Salvando..." : "Salvar alterações"}
              </Button>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
