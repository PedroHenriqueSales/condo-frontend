import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AdPlaceholder } from "../components/AdPlaceholder";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Navbar } from "../components/Navbar";
import { Tabs } from "../components/Tabs";
import { TextWithLinks } from "../components/TextWithLinks";
import { useAuth } from "../hooks/useAuth";
import { useCondominium } from "../hooks/useCondominium";
import type { AdResponse, AdType } from "../services/contracts";
import { AdTypeLabels } from "../services/contracts";
import { formatPriceCompact, formatPublishedAt } from "../utils/format";
import { resolveImageUrl } from "../utils/imageUrl";
import { buildContactUrl } from "../utils/whatsapp";
import * as AdsService from "../services/ads.service";
import * as MetricsService from "../services/metrics.service";

type UiTab = "VENDA" | "ALUGUEL" | "SERVICOS" | "DOACAO";

const tabToAdType: Record<UiTab, AdType> = {
  VENDA: "SALE_TRADE",
  ALUGUEL: "RENT",
  SERVICOS: "SERVICE",
  DOACAO: "DONATION",
};

const TAB_ORDER: UiTab[] = ["VENDA", "ALUGUEL", "SERVICOS", "DOACAO"];

export function Feed() {
  const nav = useNavigate();
  const { user } = useAuth();
  const { activeCommunityId } = useCondominium();
  const [tab, setTab] = useState<UiTab>("VENDA");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<AdResponse[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const adType = useMemo(() => tabToAdType[tab], [tab]);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const goToTab = useCallback((direction: "prev" | "next") => {
    setTab((current) => {
      const idx = TAB_ORDER.indexOf(current);
      if (direction === "next" && idx < TAB_ORDER.length - 1) return TAB_ORDER[idx + 1];
      if (direction === "prev" && idx > 0) return TAB_ORDER[idx - 1];
      return current;
    });
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStart.current) return;
      const end = e.changedTouches[0];
      const deltaX = end.clientX - touchStart.current.x;
      const deltaY = end.clientY - touchStart.current.y;
      touchStart.current = null;
      const minSwipe = 50;
      if (Math.abs(deltaX) > minSwipe && Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX < 0) goToTab("next");
        else goToTab("prev");
      }
    },
    [goToTab]
  );

  async function load(reset: boolean) {
    if (!activeCommunityId) return;
    setError(null);
    setLoading(true);
    try {
      const nextPage = reset ? 0 : page;
      const res = await AdsService.getAdsByType({
        communityId: activeCommunityId,
        type: adType,
        search: search.trim() ? search.trim() : undefined,
        page: nextPage,
        size: 20,
      });

      setItems((prev) => (reset ? res.content : [...prev, ...res.content]));
      setHasMore(!res.last);
      setPage(res.number + 1);
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Falha ao carregar anúncios.");
    } finally {
      setLoading(false);
    }
  }

  // Recarrega ao trocar aba ou busca
  useEffect(() => {
    setItems([]);
    setPage(0);
    setHasMore(true);
    const t = setTimeout(() => {
      load(true);
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adType, activeCommunityId, search]);

  async function onContactClick(ad: AdResponse) {
    if (!activeCommunityId) return;

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
      await MetricsService.registerContactClick({
        adId: ad.id,
        communityId: activeCommunityId,
      });
    } catch {
      // MVP: não bloqueia contato se a métrica falhar
    }
  }

  return (
    <div className="min-h-screen bg-bg pb-20">
      <Navbar />
      <div
        className="mx-auto max-w-5xl px-4 py-6"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex flex-col gap-3">
          <div className="flex w-full justify-center">
            <div className="w-full max-w-sm">
              <Tabs<UiTab>
                value={tab}
                onChange={setTab}
                options={[
                  { value: "VENDA", label: "Venda" },
                  { value: "ALUGUEL", label: "Aluguel" },
                  { value: "SERVICOS", label: "Serviços" },
                  { value: "DOACAO", label: "Doação" },
                ]}
              />
            </div>
          </div>

          <input
            className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm shadow-soft placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 sm:w-72"
            placeholder="Buscar anúncios..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {error ? <div className="mt-4 text-sm text-danger">{error}</div> : null}

        <div className="mt-4 grid gap-3">
          {items.map((ad) => (
            <Card key={ad.id} className="p-0">
              <button
                type="button"
                className="w-full rounded-2xl p-4 text-left hover:bg-surface/60"
                onClick={() => nav(`/ads/${ad.id}`)}
              >
                <div className="flex items-start gap-3">
                  {ad.imageUrls?.length ? (
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-surface">
                      <img
                        src={resolveImageUrl(ad.imageUrls[0])}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <AdPlaceholder compact className="h-20 w-20" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold">{ad.title}</div>
                    <div className="mt-1 max-h-10 overflow-hidden text-sm text-muted">
                      <TextWithLinks
                        text={ad.description ?? "Sem descrição"}
                        stopPropagation
                      />
                    </div>
                  </div>
                  <div className="flex flex-shrink-0 flex-col items-end gap-1">
                    <Badge tone="primary">{AdTypeLabels[ad.type]}</Badge>
                    {ad.type === "DONATION" ? (
                      <span className="whitespace-nowrap text-xs text-muted">Doação</span>
                    ) : ad.price != null ? (
                      <span className="whitespace-nowrap text-sm font-semibold text-primary-strong">
                        {formatPriceCompact(Number(ad.price))}
                      </span>
                    ) : (
                      <span className="whitespace-nowrap text-xs text-muted">A consultar</span>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <div className="min-w-0 shrink text-xs text-muted">
                    por <span className="font-medium text-text">{ad.userName}</span>
                    {ad.createdAt ? (
                      <span className="ml-2">• {formatPublishedAt(ad.createdAt)}</span>
                    ) : null}
                  </div>
                  {user && ad.userId !== user.id ? (
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      className="shrink-0 whitespace-nowrap"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onContactClick(ad);
                      }}
                    >
                      Entrar em contato
                    </Button>
                  ) : null}
                </div>
              </button>
            </Card>
          ))}

          {!loading && items.length === 0 ? (
            <div className="rounded-2xl border border-border bg-surface p-6 text-center text-sm text-muted shadow-soft">
              Nenhum anúncio encontrado.
            </div>
          ) : null}
        </div>

        <div className="mt-4 flex justify-center">
          {hasMore ? (
            <Button variant="ghost" disabled={loading} onClick={() => load(false)}>
              {loading ? "Carregando..." : "Carregar mais"}
            </Button>
          ) : items.length ? (
            <div className="text-xs text-muted">Fim da lista</div>
          ) : null}
        </div>
      </div>

      <Link
        to="/ads/new"
        aria-label="Criar anúncio"
        className="fixed bottom-6 right-6 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg transition hover:bg-primary-strong active:scale-95 sm:bottom-8 sm:right-8 sm:h-16 sm:w-16"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0)" }}
      >
        <span className="text-2xl font-light leading-none sm:text-3xl">+</span>
      </Link>
    </div>
  );
}

