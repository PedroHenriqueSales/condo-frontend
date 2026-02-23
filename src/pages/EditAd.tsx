import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { Navbar } from "../components/Navbar";
import { BottomNav } from "../components/BottomNav";
import { useAuth } from "../hooks/useAuth";
import { INDICATION_SERVICE_TYPE_SUGGESTIONS } from "../constants/indicationServiceTypes";
import {
  getOversizedImageMessage,
  isImageWithinSizeLimit,
  MAX_IMAGE_SIZE_MB,
} from "../constants/upload";
import type { AdType } from "../services/contracts";
import * as AdsService from "../services/ads.service";
import { resolveImageUrl } from "../utils/imageUrl";

type UiType = "VENDA" | "ALUGUEL" | "SERVICOS" | "DOACAO" | "INDICACOES";

const uiToAdType: Record<UiType, AdType> = {
  VENDA: "SALE_TRADE",
  ALUGUEL: "RENT",
  SERVICOS: "SERVICE",
  DOACAO: "DONATION",
  INDICACOES: "RECOMMENDATION",
};

const adTypeToUi: Record<AdType, UiType> = {
  SALE_TRADE: "VENDA",
  RENT: "ALUGUEL",
  SERVICE: "SERVICOS",
  DONATION: "DOACAO",
  RECOMMENDATION: "INDICACOES",
};

export function EditAd() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uiType, setUiType] = useState<UiType>("VENDA");
  const [price, setPrice] = useState("");
  const [recommendedContact, setRecommendedContact] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [currentImageUrls, setCurrentImageUrls] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [forbidden, setForbidden] = useState(false);

  const adType = useMemo(() => uiToAdType[uiType], [uiType]);

  useEffect(() => {
    if (!id) return;
    const adId = Number(id);
    if (Number.isNaN(adId)) {
      setLoading(false);
      setForbidden(true);
      return;
    }
    AdsService.getAdById(adId)
      .then((ad) => {
        if (ad.userId !== user?.id) {
          setForbidden(true);
          return;
        }
        if (ad.status === "CLOSED") {
          setError("Não é possível editar anúncios encerrados.");
          setForbidden(true);
          return;
        }
        setTitle(ad.title);
        setDescription(ad.description ?? "");
        setUiType(adTypeToUi[ad.type]);
        setPrice(ad.price != null ? String(ad.price) : "");
        setRecommendedContact(ad.recommendedContact ?? "");
        setServiceType(ad.serviceType ?? "");
        setCurrentImageUrls(ad.imageUrls ?? []);
      })
      .catch((err: any) => {
        setError(err?.response?.data?.error ?? "Anúncio não encontrado.");
        setForbidden(true);
      })
      .finally(() => setLoading(false));
  }, [id, user?.id]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!id) return;
    const adId = Number(id);
    if (Number.isNaN(adId)) return;

    setError(null);
    setFieldErrors({});
    setBusy(true);
    try {
      const p = (adType === "DONATION" || adType === "RECOMMENDATION")
        ? undefined
        : (price.trim() ? Number(price.replace(",", ".")) : undefined);
      await AdsService.updateAd(
        adId,
        {
          title: title.trim(),
          description: description.trim() || undefined,
          type: adType,
          price: Number.isFinite(p as any) ? p : undefined,
          recommendedContact: adType === "RECOMMENDATION" ? recommendedContact.trim() || undefined : undefined,
          serviceType: adType === "RECOMMENDATION" ? serviceType.trim() || undefined : undefined,
        },
        adType === "RECOMMENDATION" ? undefined : (newImages.length ? newImages.slice(0, 5) : undefined)
      );
      setSuccess(true);
      setTimeout(() => nav("/my-ads", { replace: true }), 1500);
    } catch (err: any) {
      const data = err?.response?.data;
      if (data?.errors && typeof data.errors === "object") {
        setFieldErrors(data.errors);
        setError(Object.values(data.errors).join(" "));
      } else {
        setError(data?.error ?? "Falha ao salvar alterações.");
      }
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg pb-24">
        <Navbar />
        <div className="mx-auto max-w-3xl px-4 py-6">
          <div className="text-sm text-muted">Carregando...</div>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (forbidden) {
    return (
      <div className="min-h-screen bg-bg pb-24">
        <Navbar />
        <div className="mx-auto max-w-3xl px-4 py-6">
          <Card>
            {error ? <div className="text-sm text-danger">{error}</div> : null}
            <Link to="/my-ads">
              <Button variant="ghost" className="mt-4">
                Voltar para Meus anúncios
              </Button>
            </Link>
          </Card>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg pb-24">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 py-6">
        <div className="mb-4 flex items-center gap-3">
          <Link className="text-sm font-medium text-primary-strong hover:underline" to="/my-ads">
            ← Voltar
          </Link>
          <div className="text-2xl font-semibold">Editar anúncio</div>
        </div>

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
                  <label className="mb-1 block text-sm font-medium text-text">Tipo de serviço</label>
                  <select
                    value={serviceType === "" ? "" : (INDICATION_SERVICE_TYPE_SUGGESTIONS.includes(serviceType as any) ? serviceType : "Outro")}
                    onChange={(e) => {
                      const v = e.target.value;
                      setServiceType(v === "Outro" ? "" : v);
                    }}
                    className="h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm shadow-soft focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
                  >
                    <option value="">Selecione...</option>
                    {INDICATION_SERVICE_TYPE_SUGGESTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  {(!serviceType || !INDICATION_SERVICE_TYPE_SUGGESTIONS.includes(serviceType as any)) && (
                    <input
                      type="text"
                      placeholder="Digite o tipo de serviço (ex.: Encanador)"
                      value={serviceType}
                      onChange={(e) => setServiceType(e.target.value)}
                      required
                      className="mt-2 h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm shadow-soft placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
                    />
                  )}
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
              <div className="mb-1 text-sm font-medium text-text">Fotos (até 5, máx. {MAX_IMAGE_SIZE_MB}MB cada)</div>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                id="edit-ad-images"
                onChange={(e) => {
                  const raw = Array.from(e.target.files ?? []).slice(0, 5);
                  const valid = raw.filter(isImageWithinSizeLimit);
                  const oversized = raw.length - valid.length;
                  if (oversized > 0) {
                    setFieldErrors((prev) => ({ ...prev, images: getOversizedImageMessage(oversized) }));
                  } else {
                    setFieldErrors((prev) => {
                      const next = { ...prev };
                      delete next.images;
                      return next;
                    });
                  }
                  setNewImages(valid);
                  e.target.value = "";
                }}
              />
              <div className="flex min-h-24 flex-wrap gap-2 rounded-xl border border-border bg-surface/60 p-3">
                {newImages.length > 0 ? (
                  newImages.map((f, i) => (
                    <div key={`new-${i}`} className="relative h-20 w-20 overflow-hidden rounded-lg bg-surface">
                      <img
                        src={URL.createObjectURL(f)}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setNewImages((prev) => prev.filter((_, j) => j !== i))}
                        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-xs text-white"
                      >
                        ×
                      </button>
                    </div>
                  ))
                ) : (
                  <>
                    {currentImageUrls.map((url, i) => (
                      <div key={i} className="h-20 w-20 overflow-hidden rounded-lg bg-surface">
                        <img src={resolveImageUrl(url)} alt="" className="h-full w-full object-cover" />
                      </div>
                    ))}
                    <label
                      htmlFor="edit-ad-images"
                      className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-lg border border-dashed border-border text-xs text-muted transition hover:border-primary/50"
                    >
                      Trocar fotos
                    </label>
                  </>
                )}
              </div>
              {fieldErrors.images ? (
                <div className="mt-1 text-sm text-danger">{fieldErrors.images}</div>
              ) : null}
            </label>
            ) : null}

            {success ? (
              <div className="text-sm font-medium text-primary-strong">Alterações salvas! Redirecionando...</div>
            ) : null}
            {error ? <div className="text-sm text-danger">{error}</div> : null}

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="submit" disabled={busy || success}>
                {busy ? "Salvando..." : success ? "Salvo" : "Salvar alterações"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => nav("/my-ads")}>
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      </div>
      <BottomNav />
    </div>
  );
}
