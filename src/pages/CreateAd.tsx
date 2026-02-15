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

type UiType = "VENDA" | "ALUGUEL" | "SERVICOS" | "DOACAO" | "INDICACOES";

const uiToAdType: Record<UiType, AdType> = {
  VENDA: "SALE_TRADE",
  ALUGUEL: "RENT",
  SERVICOS: "SERVICE",
  DOACAO: "DONATION",
  INDICACOES: "RECOMMENDATION",
};

export function CreateAd() {
  const nav = useNavigate();
  const { activeCommunityId } = useCondominium();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uiType, setUiType] = useState<UiType>("VENDA");
  const [price, setPrice] = useState("");
  const [recommendedContact, setRecommendedContact] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [images, setImages] = useState<File[]>([]);

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
      const p = (adType === "DONATION" || adType === "RECOMMENDATION")
        ? undefined
        : (price.trim() ? Number(price.replace(",", ".")) : undefined);
      await AdsService.createAd(
        {
          title: title.trim(),
          description: description.trim() || undefined,
          type: adType,
          price: Number.isFinite(p as any) ? p : undefined,
          communityId: activeCommunityId,
          recommendedContact: adType === "RECOMMENDATION" ? recommendedContact.trim() || undefined : undefined,
          serviceType: adType === "RECOMMENDATION" ? serviceType.trim() || undefined : undefined,
        },
        adType === "RECOMMENDATION" ? undefined : (images.length ? images.slice(0, 5) : undefined)
      );
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
                maxLength={60}
                placeholder="Até 60 caracteres"
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
                <option value="DOACAO">Doação</option>
                <option value="INDICACOES">Indicações</option>
              </select>
              {fieldErrors.type ? (
                <div className="mt-1 text-sm text-danger">{fieldErrors.type}</div>
              ) : null}
            </label>

            {uiType === "INDICACOES" ? (
              <>
                <div>
                  <Input
                    label="WhatsApp do indicado"
                    placeholder="Ex.: (11) 99999-9999"
                    value={recommendedContact}
                    onChange={(e) => setRecommendedContact(e.target.value)}
                    required
                  />
                  {fieldErrors.recommendedContact ? (
                    <div className="mt-1 text-sm text-danger">{fieldErrors.recommendedContact}</div>
                  ) : null}
                </div>
                <div>
                  <Input
                    label="Tipo de serviço"
                    placeholder="Ex.: Encanador, Eletricista"
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    required
                  />
                  {fieldErrors.serviceType ? (
                    <div className="mt-1 text-sm text-danger">{fieldErrors.serviceType}</div>
                  ) : null}
                </div>
              </>
            ) : uiType !== "DOACAO" ? (
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
            ) : null}

            {uiType !== "INDICACOES" ? (
            <label className="block">
              <div className="mb-1 text-sm font-medium text-text">Fotos (até 5, opcional)</div>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                id="ad-images"
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? []).slice(0, 5);
                  setImages(files);
                }}
              />
              <label
                htmlFor="ad-images"
                className="flex min-h-24 cursor-pointer flex-wrap gap-2 rounded-xl border border-dashed border-border bg-surface/60 p-3 transition hover:border-primary/50"
              >
                {images.length === 0 ? (
                  <span className="flex items-center text-sm text-muted">
                    Clique para selecionar imagens (JPEG, PNG ou WebP, máx. 5MB cada)
                  </span>
                ) : (
                  images.map((f, i) => (
                    <div key={i} className="relative h-20 w-20 overflow-hidden rounded-lg bg-surface">
                      <img
                        src={URL.createObjectURL(f)}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={(ev) => {
                          ev.preventDefault();
                          setImages((prev) => prev.filter((_, j) => j !== i));
                        }}
                        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-xs text-white"
                      >
                        ×
                      </button>
                    </div>
                  ))
                )}
              </label>
            </label>
            ) : null}

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

