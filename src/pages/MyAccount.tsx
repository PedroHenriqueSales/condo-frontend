import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { Navbar } from "../components/Navbar";
import { BottomNav } from "../components/BottomNav";
import { useAuth } from "../hooks/useAuth";
import { useCondominium } from "../hooks/useCondominium";
import { WHATSAPP_PLACEHOLDER } from "../utils/whatsapp";
import * as UsersService from "../services/users.service";

export function MyAccount() {
  const nav = useNavigate();
  const { updateUser, logout } = useAuth();
  const { clear: clearCondominium } = useCondominium();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [address, setAddress] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setError(null);
      setLoading(true);
      try {
        const profile = await UsersService.getProfile();
        setName(profile.name);
        setEmail(profile.email);
        setWhatsapp(profile.whatsapp ?? "");
        setAddress(profile.address ?? "");
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
        whatsapp: whatsapp.trim(),
        address: address.trim() || undefined,
      });
      updateUser({ name: profile.name });
      setAddress(profile.address ?? "");
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

  async function handleConfirmDelete() {
    setDeleteError(null);
    setDeleting(true);
    try {
      await UsersService.deleteAccount();
      clearCondominium();
      logout();
      nav("/login", { replace: true });
    } catch (err: any) {
      setDeleteError(err?.response?.data?.error ?? "Não foi possível excluir a conta. Tente novamente.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg pb-24">
      <Navbar />
      <div className="mx-auto max-w-md px-4 py-6">
        <div className="mb-4 text-2xl font-semibold">Minha conta</div>
        <p className="mb-4 text-sm text-muted">
          Edite seu nome, telefone e endereço. O email não pode ser alterado.
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
                placeholder={WHATSAPP_PLACEHOLDER}
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                error={fieldErrors.whatsapp}
                required
              />
              <Input
                label="Endereço (opcional)"
                placeholder="Ex.: Rua, número, bairro, cidade"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                error={fieldErrors.address}
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

        <div className="mt-8 border-t border-border pt-6">
          <p className="mb-2 text-sm text-muted">
            Você pode excluir sua conta e todos os dados associados a ela, em conformidade com a{" "}
            <Link to="/politica-de-privacidade" className="font-medium text-accent-strong hover:underline">
              Política de Privacidade
            </Link>.
          </p>
          <Button
            type="button"
            variant="ghost"
            className="text-danger hover:bg-danger/10"
            onClick={() => setDeleteModalOpen(true)}
          >
            Excluir minha conta
          </Button>
        </div>

        <footer className="mt-8 text-center text-sm text-muted">
          <Link to="/termos-de-uso" className="hover:underline">Termos de Uso</Link>
          {" · "}
          <Link to="/politica-de-privacidade" className="hover:underline">Política de Privacidade</Link>
        </footer>
      </div>

      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
          <div className="w-full max-w-md rounded-2xl border border-border bg-bg p-6 shadow-lg">
            <h2 id="delete-modal-title" className="text-lg font-semibold text-text">Excluir conta</h2>
            <p className="mt-2 text-sm text-muted">
              Isso removerá seus dados de acordo com a Política de Privacidade. Você não poderá desfazer esta ação. Deseja continuar?
            </p>
            {deleteError ? <p className="mt-2 text-sm text-danger">{deleteError}</p> : null}
            <div className="mt-6 flex gap-3">
              <Button
                type="button"
                variant="ghost"
                className="flex-1"
                disabled={deleting}
                onClick={() => { setDeleteModalOpen(false); setDeleteError(null); }}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="danger"
                className="flex-1"
                disabled={deleting}
                onClick={handleConfirmDelete}
              >
                {deleting ? "Excluindo..." : "Sim, excluir"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
