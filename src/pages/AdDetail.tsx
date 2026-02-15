import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AdPlaceholder } from "../components/AdPlaceholder";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { ImageLightbox } from "../components/ImageLightbox";
import { Navbar } from "../components/Navbar";
import { TextWithLinks } from "../components/TextWithLinks";
import { useAuth } from "../hooks/useAuth";
import { useCondominium } from "../hooks/useCondominium";
import type { AdResponse } from "../services/contracts";
import { AdTypeLabels } from "../services/contracts";
import { formatPrice, formatPublishedAt } from "../utils/format";
import { resolveImageUrl } from "../utils/imageUrl";
import { buildAdShareWhatsAppUrl } from "../utils/share";
import { buildContactUrl } from "../utils/whatsapp";
import * as AdsService from "../services/ads.service";
import * as MetricsService from "../services/metrics.service";

export function AdDetail() {
  const nav = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const { activeCommunityId } = useCondominium();

  const [ad, setAd] = useState<AdResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  useEffect(() => {
    const adId = Number(id);
    if (!adId) {
      setError("Anúncio inválido.");
      setLoading(false);
      return;
    }
    setLoading(true);
    AdsService.getAdById(adId)
      .then(setAd)
      .catch((err: any) => setError(err?.response?.data?.error ?? "Falha ao carregar anúncio."))
      .finally(() => setLoading(false));
  }, [id]);

  async function onContact() {
    if (!ad || !activeCommunityId) return;

    if (!ad.userWhatsapp) {
      alert("Este anúncio não possui WhatsApp cadastrado.");
      return;
    }
    const digits = ad.userWhatsapp.replace(/[^\d]/g, "");
    if (!digits) {
      alert("WhatsApp inválido.");
      return;
    }

    // Abre imediatamente (evita bloqueio de popup no Safari iOS)
    window.open(buildContactUrl(ad.userWhatsapp, ad.title), "_blank", "noopener,noreferrer");

    try {
      await MetricsService.registerContactClick({ adId: ad.id, communityId: activeCommunityId });
    } catch {
      // ignore
    }
  }

  function onShare() {
    if (!ad) return;
    const whatsappUrl = buildAdShareWhatsAppUrl(ad);
    // Abre imediatamente (evita bloqueio de popup no Safari iOS)
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  }

  const WhatsAppIcon = () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <Link className="text-sm font-medium text-primary-strong hover:underline" to="/feed">
            ← Voltar
          </Link>
        </div>

        {loading ? <div className="text-sm text-muted">Carregando...</div> : null}
        {error ? <div className="text-sm text-danger">{error}</div> : null}

        {ad ? (
          <Card>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xl font-semibold">{ad.title}</div>
                <div className="mt-1 text-sm text-muted">
                  por <span className="font-medium text-text">{ad.userName}</span>
                  {ad.createdAt ? (
                    <span className="ml-2">• {formatPublishedAt(ad.createdAt)}</span>
                  ) : null}
                </div>
              </div>
              <div className="flex flex-shrink-0 flex-col items-end gap-1">
                <Badge tone="primary">{AdTypeLabels[ad.type]}</Badge>
                {ad.price != null ? (
                  <span className="whitespace-nowrap text-lg font-semibold text-primary-strong">
                    {formatPrice(Number(ad.price))}
                  </span>
                ) : (
                  <span className="text-sm text-muted">Valor a consultar</span>
                )}
              </div>
            </div>

            {ad.imageUrls?.length ? (
              <div className="mt-4 flex gap-2 overflow-x-auto rounded-xl">
                {ad.imageUrls.map((url, i) => (
                  <img
                    key={i}
                    src={resolveImageUrl(url)}
                    alt=""
                    className="max-h-48 cursor-pointer flex-shrink-0 rounded-lg object-cover transition hover:opacity-90"
                    onClick={() => setLightboxImage(resolveImageUrl(url))}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-4 flex justify-center">
                <AdPlaceholder />
              </div>
            )}

            <div className="mt-4 whitespace-pre-wrap text-sm text-text">
              <TextWithLinks text={ad.description ?? "Sem descrição."} />
            </div>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              {ad.userId !== user?.id ? (
                <Button onClick={onContact}>Entrar em contato</Button>
              ) : null}
              <Button
                onClick={onShare}
                className="bg-[#25D366] text-white hover:bg-[#20BA5A] active:bg-[#20BA5A] border-0 shadow-soft"
              >
                <WhatsAppIcon />
                Compartilhar no WhatsApp
              </Button>
              {ad.userId === user?.id && (ad.status === "ACTIVE" || ad.status === "PAUSED") ? (
                <Button variant="ghost" onClick={() => nav(`/ads/${ad.id}/edit`)}>
                  Editar
                </Button>
              ) : null}
              <Button variant="ghost" onClick={() => nav("/feed")}>
                Ver mais anúncios
              </Button>
            </div>
          </Card>
        ) : null}
      </div>

      {lightboxImage && (
        <ImageLightbox imageUrl={lightboxImage} onClose={() => setLightboxImage(null)} />
      )}
    </div>
  );
}

