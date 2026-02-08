import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AdPlaceholder } from "../components/AdPlaceholder";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Navbar } from "../components/Navbar";
import { useAuth } from "../hooks/useAuth";
import { useCondominium } from "../hooks/useCondominium";
import type { AdResponse } from "../services/contracts";
import { AdTypeLabels } from "../services/contracts";
import { formatPrice, formatPublishedAt } from "../utils/format";
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
                    src={url}
                    alt=""
                    className="max-h-48 flex-shrink-0 rounded-lg object-cover"
                  />
                ))}
              </div>
            ) : (
              <div className="mt-4 flex justify-center">
                <AdPlaceholder />
              </div>
            )}

            <div className="mt-4 whitespace-pre-wrap text-sm text-text">
              {ad.description ?? "Sem descrição."}
            </div>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Button onClick={onContact}>Entrar em contato</Button>
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
    </div>
  );
}

