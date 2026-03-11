import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdPlaceholder } from "../components/AdPlaceholder";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Navbar } from "../components/Navbar";
import { BottomNav } from "../components/BottomNav";
import { useCondominium } from "../hooks/useCondominium";
import type { AdResponse } from "../services/contracts";
import { AdTypeLabels } from "../services/contracts";
import { formatPriceCompact, formatPublishedAt } from "../utils/format";
import { resolveImageUrl } from "../utils/imageUrl";
import * as AdsService from "../services/ads.service";

export function MyAds() {
  const nav = useNavigate();
  const { activeCommunityId } = useCondominium();
  const [items, setItems] = useState<AdResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [menuOpensUp, setMenuOpensUp] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    }
    if (openMenuId != null) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [openMenuId]);

  useEffect(() => {
    if (openMenuId == null || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    setMenuOpensUp(spaceBelow < 260);
  }, [openMenuId]);

  const load = useCallback(async () => {
    if (activeCommunityId == null) {
      setItems([]);
      setLoading(false);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await AdsService.listMyAds({
        communityId: activeCommunityId,
        page: 0,
        size: 50,
      });
      setItems(res.content);
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Falha ao carregar seus anúncios.");
    } finally {
      setLoading(false);
    }
  }, [activeCommunityId]);

  useEffect(() => {
    load();
  }, [load]);

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

  const statusLabel = (ad: AdResponse) => {
    if (ad.status === "REMOVED") return "Removido por denúncias";
    if (ad.status === "PAUSED" && ad.suspendedByReportsAt) return "Suspenso por denúncias";
    if (ad.status === "RESERVED") return "Reservado";
    if (ad.status === "SOLD") return "Vendido";
    if (ad.status === "ACTIVE") return "Ativo";
    if (ad.status === "PAUSED") return "Pausado";
    if (ad.status === "CLOSED") return "Encerrado";
    return ad.status;
  };

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
                    <span>{AdTypeLabels[ad.type]} • {statusLabel(ad)}</span>
                    {ad.createdAt ? (
                      <span>• {formatPublishedAt(ad.createdAt)}</span>
                    ) : null}
                    {ad.type === "RECOMMENDATION" && ad.serviceType ? (
                      <span className="text-info">• {ad.serviceType}</span>
                    ) : null}
                    {ad.type !== "RECOMMENDATION" && ad.price != null ? (
                      <span className="inline-flex items-baseline gap-1 whitespace-nowrap font-medium text-price">
                        •{" "}
                        {ad.previousPrice != null && ad.previousPrice > ad.price ? (
                          <>
                            <span className="text-xs text-muted line-through">
                              {formatPriceCompact(Number(ad.previousPrice))}
                            </span>
                            <span>{formatPriceCompact(Number(ad.price))}</span>
                          </>
                        ) : (
                          <span>{formatPriceCompact(Number(ad.price))}</span>
                        )}
                      </span>
                    ) : null}
                  </div>
                </div>
                <span className="flex-shrink-0">
                  <Badge
                    tone={
                      ad.status === "REMOVED" || (ad.status === "PAUSED" && ad.suspendedByReportsAt)
                        ? "danger"
                        : ad.status === "ACTIVE"
                          ? "primary"
                          : ad.status === "RESERVED" || ad.status === "SOLD"
                            ? "accent"
                            : "neutral"
                    }
                  >
                    {statusLabel(ad)}
                  </Badge>
                </span>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2" onClick={(e) => e.stopPropagation()}>
                {ad.status !== "REMOVED" && (ad.status === "ACTIVE" || (ad.status === "PAUSED" && !ad.suspendedByReportsAt) || ad.status === "RESERVED") ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={() => nav(`/ads/${ad.id}/edit`)}
                  >
                    Editar
                  </Button>
                ) : null}
                {(ad.status === "ACTIVE" || ad.status === "PAUSED" && !ad.suspendedByReportsAt || ad.status === "RESERVED" || ad.status === "CLOSED") ? (
                  <div className="relative" ref={openMenuId === ad.id ? menuRef : undefined}>
                    <div ref={openMenuId === ad.id ? triggerRef : undefined} className="inline-block">
                      <Button
                        variant="ghost"
                        size="sm"
                        type="button"
                        aria-label="Abrir menu de ações"
                        aria-expanded={openMenuId === ad.id}
                        onClick={() => setOpenMenuId((id) => (id === ad.id ? null : ad.id))}
                        className="!px-2 !py-1.5 text-muted hover:!bg-surface hover:!text-text"
                      >
                        <span className="text-lg leading-none">⋯</span>
                      </Button>
                    </div>
                    {openMenuId === ad.id ? (
                      <div
                        className={`absolute left-0 z-10 min-w-[12rem] max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-card py-1 text-text shadow-card ${
                          menuOpensUp ? "bottom-full mb-1" : "top-full mt-1"
                        }`}
                      >
                        {ad.status === "ACTIVE" ? (
                          <>
                            <button
                              type="button"
                              className="w-full px-3 py-2 text-left text-sm text-text hover:bg-surface"
                              onClick={() => { setOpenMenuId(null); onPause(ad.id); }}
                            >
                              Pausar
                            </button>
                            {ad.type === "SALE_TRADE" ? (
                              <>
                                <button
                                  type="button"
                                  className="w-full px-3 py-2 text-left text-sm text-text hover:bg-surface"
                                  onClick={async () => {
                                    setOpenMenuId(null);
                                    try {
                                      await AdsService.reserveAd(ad.id);
                                      await load();
                                    } catch (err: any) {
                                      alert(err?.response?.data?.error ?? "Falha ao reservar anúncio.");
                                    }
                                  }}
                                >
                                  Reservar
                                </button>
                                <button
                                  type="button"
                                  className="w-full px-3 py-2 text-left text-sm text-text hover:bg-surface"
                                  onClick={async () => {
                                    setOpenMenuId(null);
                                    try {
                                      await AdsService.markAsSold(ad.id);
                                      await load();
                                    } catch (err: any) {
                                      alert(err?.response?.data?.error ?? "Falha ao marcar como vendido.");
                                    }
                                  }}
                                >
                                  Marcar como vendido
                                </button>
                              </>
                            ) : null}
                            <button
                              type="button"
                              className="w-full px-3 py-2 text-left text-sm text-danger hover:bg-surface"
                              onClick={() => { setOpenMenuId(null); onClose(ad.id); }}
                            >
                              Encerrar
                            </button>
                          </>
                        ) : null}
                        {ad.status === "PAUSED" && !ad.suspendedByReportsAt ? (
                          <>
                            <button
                              type="button"
                              className="w-full px-3 py-2 text-left text-sm text-text hover:bg-surface"
                              onClick={() => { setOpenMenuId(null); onUnpause(ad.id); }}
                            >
                              Reativar
                            </button>
                            <button
                              type="button"
                              className="w-full px-3 py-2 text-left text-sm text-danger hover:bg-surface"
                              onClick={() => { setOpenMenuId(null); onClose(ad.id); }}
                            >
                              Encerrar
                            </button>
                          </>
                        ) : null}
                        {ad.status === "RESERVED" ? (
                          <>
                            <button
                              type="button"
                              className="w-full px-3 py-2 text-left text-sm text-text hover:bg-surface"
                              onClick={async () => {
                                setOpenMenuId(null);
                                try {
                                  await AdsService.unreserveAd(ad.id);
                                  await load();
                                } catch (err: any) {
                                  alert(err?.response?.data?.error ?? "Falha ao remover reserva.");
                                }
                              }}
                            >
                              Remover reserva
                            </button>
                            <button
                              type="button"
                              className="w-full px-3 py-2 text-left text-sm text-text hover:bg-surface"
                              onClick={async () => {
                                setOpenMenuId(null);
                                try {
                                  await AdsService.markAsSold(ad.id);
                                  await load();
                                } catch (err: any) {
                                  alert(err?.response?.data?.error ?? "Falha ao marcar como vendido.");
                                }
                              }}
                            >
                              Marcar como vendido
                            </button>
                            <button
                              type="button"
                              className="w-full px-3 py-2 text-left text-sm text-danger hover:bg-surface"
                              onClick={() => { setOpenMenuId(null); onClose(ad.id); }}
                            >
                              Encerrar
                            </button>
                          </>
                        ) : null}
                        {ad.status === "CLOSED" ? (
                          <button
                            type="button"
                            className="w-full px-3 py-2 text-left text-sm text-danger hover:bg-surface"
                            onClick={() => { setOpenMenuId(null); onDelete(ad.id); }}
                          >
                            Remover
                          </button>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
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

