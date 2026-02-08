import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { Navbar } from "../components/Navbar";
import { useCondominium } from "../hooks/useCondominium";
import type { AdType } from "../services/contracts";
import * as AdsService from "../services/ads.service";

type UiType = "VENDA" | "ALUGUEL" | "SERVICOS";

const uiToAdType: Record<UiType, AdType> = {
  VENDA: "SALE_TRADE",
  ALUGUEL: "RENT",
  SERVICOS: "SERVICE",
};

export function CreateAd() {
  const nav = useNavigate();
  const { activeCommunityId } = useCondominium();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uiType, setUiType] = useState<UiType>("VENDA");
  const [price, setPrice] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const adType = useMemo(() => uiToAdType[uiType], [uiType]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!activeCommunityId) return;
    setError(null);
    setFieldErrors({});
    setBusy(true);
    try {
      const p = price.trim() ? Number(price.replace(",", ".")) : undefined;
      await AdsService.createAd({
        title: title.trim(),
        description: description.trim() || undefined,
        type: adType,
        price: Number.isFinite(p as any) ? p : undefined,
        communityId: activeCommunityId,
      });
      setSuccess(true);
      setTimeout(() => nav("/feed", { replace: true }), 1500);
    } catch (err: any) {
      const data = err?.response?.data;
      if (data?.errors && typeof data.errors === "object") {
        setFieldErrors(data.errors);
        setError(Object.values(data.errors).join(" "));
      } else {
        setError(data?.error ?? "Falha ao criar anúncio.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 py-6">
        <div className="mb-4 text-2xl font-semibold">Criar anúncio</div>

        <Card>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div>
              <Input
                label="Título"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              {fieldErrors.title ? (
                <div className="mt-1 text-sm text-danger">{fieldErrors.title}</div>
              ) : null}
            </div>

            <label className="block">
              <div className="mb-1 text-sm font-medium text-text">Descrição</div>
              <textarea
                className="min-h-28 w-full resize-y rounded-xl border border-border bg-surface px-3 py-2 text-sm shadow-soft placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva o item/serviço..."
              />
              {fieldErrors.description ? (
                <div className="mt-1 text-sm text-danger">{fieldErrors.description}</div>
              ) : null}
            </label>

            <label className="block">
              <div className="mb-1 text-sm font-medium text-text">Tipo</div>
              <select
                className="h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm shadow-soft focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
                value={uiType}
                onChange={(e) => setUiType(e.target.value as UiType)}
              >
                <option value="VENDA">Venda</option>
                <option value="ALUGUEL">Aluguel</option>
                <option value="SERVICOS">Serviços</option>
              </select>
              {fieldErrors.type ? (
                <div className="mt-1 text-sm text-danger">{fieldErrors.type}</div>
              ) : null}
            </label>

            <div>
              <Input
                label="Preço (opcional)"
                inputMode="decimal"
                placeholder="Ex.: 50.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
              {fieldErrors.price ? (
                <div className="mt-1 text-sm text-danger">{fieldErrors.price}</div>
              ) : null}
            </div>

            <div className="rounded-xl border border-border bg-surface/60 p-3 text-xs text-muted">
              Fotos: podem ser adicionadas depois (mock no MVP).
            </div>

            {success ? (
              <div className="text-sm font-medium text-primary-strong">Anúncio publicado! Redirecionando...</div>
            ) : null}
            {error ? <div className="text-sm text-danger">{error}</div> : null}

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="submit" disabled={busy || success}>
                {busy ? "Publicando..." : success ? "Publicado" : "Publicar"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => nav("/feed")}>
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

