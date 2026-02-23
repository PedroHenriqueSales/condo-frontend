import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdPlaceholder } from "../components/AdPlaceholder";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Navbar } from "../components/Navbar";
import { BottomNav } from "../components/BottomNav";
import type { AdResponse } from "../services/contracts";
import { AdTypeLabels } from "../services/contracts";
import { formatPriceCompact, formatPublishedAt } from "../utils/format";
import { resolveImageUrl } from "../utils/imageUrl";
import * as AdsService from "../services/ads.service";

export function MyAds() {
  const nav = useNavigate();
  const [items, setItems] = useState<AdResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    setLoading(true);
    try {
      const res = await AdsService.listMyAds({ page: 0, size: 50 });
      setItems(res.content);
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Falha ao carregar seus anúncios.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onPause(adId: number) {
    try {
      await AdsService.pauseAd(adId);
      await load();
    } catch (err: any) {
      alert(err?.response?.data?.error ?? "Falha ao pausar anúncio.");
    }
  }

  async function onUnpause(adId: number) {
    try {
      await AdsService.unpauseAd(adId);
      await load();
    } catch (err: any) {
      alert(err?.response?.data?.error ?? "Falha ao reativar anúncio.");
    }
  }

  async function onClose(adId: number) {
    try {
      await AdsService.closeAd(adId);
      await load();
    } catch (err: any) {
      alert(err?.response?.data?.error ?? "Falha ao encerrar anúncio.");
    }
  }

  async function onDelete(adId: number) {
    if (!confirm("Tem certeza que deseja remover este anúncio? Esta ação não pode ser desfeita.")) return;
    try {
      await AdsService.deleteAd(adId);
      await load();
    } catch (err: any) {
      alert(err?.response?.data?.error ?? "Falha ao remover anúncio.");
    }
  }

  const statusLabel = (s: AdResponse["status"]) =>
    s === "ACTIVE" ? "Ativo" : s === "PAUSED" ? "Pausado" : "Encerrado";

  return (
    <div className="min-h-screen bg-bg pb-24">
      <Navbar />
      <div className="mx-auto max-w-5xl px-4 py-6">
        <div className="mb-4 text-2xl font-semibold">Meus anúncios</div>

        {loading ? <div className="text-sm text-muted">Carregando...</div> : null}
        {error ? <div className="text-sm text-danger">{error}</div> : null}

        <div className="mt-4 grid gap-3">
          {items.map((ad) => (
            <Card
              key={ad.id}
              className="cursor-pointer transition hover:bg-surface/60"
              onClick={() => nav(`/ads/${ad.id}`)}
            >
              <div className="flex items-start gap-3">
                {ad.type !== "RECOMMENDATION" &&
                  (ad.imageUrls?.length ? (
                    <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-surface">
                      <img
                        src={resolveImageUrl(ad.imageUrls[0])}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <AdPlaceholder compact className="h-16 w-16" />
                  ))}
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold">{ad.title}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-1 text-xs text-muted">
                    <span>{AdTypeLabels[ad.type]} • {statusLabel(ad.status)}</span>
                    {ad.createdAt ? (
                      <span>• {formatPublishedAt(ad.createdAt)}</span>
                    ) : null}
                    {ad.type === "RECOMMENDATION" && ad.serviceType ? (
                      <span className="text-info">• {ad.serviceType}</span>
                    ) : null}
                    {ad.type !== "RECOMMENDATION" && ad.price != null ? (
                      <span className="whitespace-nowrap font-medium text-info">
                        • {formatPriceCompact(Number(ad.price))}
                      </span>
                    ) : null}
                  </div>
                </div>
                <span className="flex-shrink-0">
                  <Badge
                    tone={ad.status === "ACTIVE" ? "primary" : "neutral"}
                  >
                    {statusLabel(ad.status)}
                  </Badge>
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
                {(ad.status === "ACTIVE" || ad.status === "PAUSED") ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={() => nav(`/ads/${ad.id}/edit`)}
                  >
                    Editar
                  </Button>
                ) : null}
                {ad.status === "ACTIVE" ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={() => onPause(ad.id)}
                  >
                    Pausar
                  </Button>
                ) : null}
                {ad.status === "PAUSED" ? (
                  <Button
                    variant="primary"
                    size="sm"
                    type="button"
                    onClick={() => onUnpause(ad.id)}
                  >
                    Reativar
                  </Button>
                ) : null}
                {(ad.status === "ACTIVE" || ad.status === "PAUSED") ? (
                  <Button
                    variant="danger"
                    size="sm"
                    type="button"
                    onClick={() => onClose(ad.id)}
                  >
                    Encerrar
                  </Button>
                ) : null}
                {ad.status === "CLOSED" ? (
                  <Button
                    variant="danger"
                    size="sm"
                    type="button"
                    onClick={() => onDelete(ad.id)}
                  >
                    Remover
                  </Button>
                ) : null}
              </div>
            </Card>
          ))}

          {!loading && items.length === 0 ? (
            <div className="rounded-2xl border border-border bg-surface p-6 text-center text-sm text-muted shadow-soft">
              Você ainda não criou anúncios.
            </div>
          ) : null}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

