import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdPlaceholder } from "../components/AdPlaceholder";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Navbar } from "../components/Navbar";
import { BottomNav } from "../components/BottomNav";
import { TextWithLinks } from "../components/TextWithLinks";
import { useAuth } from "../hooks/useAuth";
import { useCondominium } from "../hooks/useCondominium";
import type { AdResponse, AdType } from "../services/contracts";
import { AdTypeLabels } from "../services/contracts";
import { formatPriceCompact, formatPublishedAt } from "../utils/format";
import { resolveImageUrl } from "../utils/imageUrl";
import { buildContactUrl, buildRecommendationContactUrl } from "../utils/whatsapp";
import * as AdsService from "../services/ads.service";
import * as MetricsService from "../services/metrics.service";

type UiTab = "TODOS" | "VENDA" | "ALUGUEL" | "SERVICOS" | "DOACAO" | "INDICACOES";

const tabToAdType: Record<Exclude<UiTab, "TODOS">, AdType> = {
  VENDA: "SALE_TRADE",
  ALUGUEL: "RENT",
  SERVICOS: "SERVICE",
  DOACAO: "DONATION",
  INDICACOES: "RECOMMENDATION",
};

const FILTER_LABELS: Record<UiTab, string> = {
  TODOS: "Todos",
  VENDA: "Venda",
  ALUGUEL: "Aluguel",
  SERVICOS: "Serviços",
  DOACAO: "Doação",
  INDICACOES: "Indic.",
};
const TAB_ORDER: UiTab[] = ["TODOS", "VENDA", "ALUGUEL", "SERVICOS", "DOACAO", "INDICACOES"];

const FilterIcon = ({ tab, className = "h-7 w-7 shrink-0 sm:h-8 sm:w-8" }: { tab: UiTab; className?: string }) => {
  const c = className;
  switch (tab) {
    case "TODOS":
      return (
        <svg className={c} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      );
    case "VENDA":
      return (
        <svg className={c} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      );
    case "ALUGUEL":
      return (
        <svg className={c} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        </svg>
      );
    case "SERVICOS":
      return (
        <svg className={c} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    case "DOACAO":
      return (
        <svg className={c} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      );
    case "INDICACOES":
      return (
        <svg className={c} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      );
    default:
      return null;
  }
};

export function Feed() {
  const nav = useNavigate();
  const { user } = useAuth();
  const { activeCommunityId } = useCondominium();
  const [tab, setTab] = useState<UiTab>("TODOS");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<AdResponse[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDefaultSort = useCallback((currentTab: UiTab): string => {
    return currentTab === "INDICACOES" ? "title,asc" : "createdAt,desc";
  }, []);

  const [sortOrder, setSortOrder] = useState<string>("createdAt,desc");
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const sortMenuRef = useRef<HTMLDivElement>(null);

  const adType = useMemo<AdType | undefined>(
    () => (tab === "TODOS" ? undefined : tabToAdType[tab]),
    [tab]
  );

  const adTypes = useMemo<AdType[] | undefined>(
    () => (tab === "TODOS" ? ["SALE_TRADE", "RENT", "DONATION"] : undefined),
    [tab]
  );
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  type SortOption = {
    value: string;
    label: string;
  };

  const getSortOptions = useCallback((currentTab: UiTab): SortOption[] => {
    const base: SortOption[] = [
      { value: "title,asc", label: "Alfabética (A-Z)" },
      { value: "title,desc", label: "Alfabética (Z-A)" },
      { value: "createdAt,desc", label: "Data (mais recente)" },
      { value: "createdAt,asc", label: "Data (mais antiga)" },
      { value: "user.name,asc", label: "Usuário (A-Z)" },
      { value: "user.name,desc", label: "Usuário (Z-A)" },
    ];
    if (currentTab === "TODOS") {
      return [
        ...base,
        { value: "type,asc", label: "Tipo (A-Z)" },
        { value: "type,desc", label: "Tipo (Z-A)" },
      ];
    }
    if (currentTab === "INDICACOES") {
      return [
        ...base,
        { value: "serviceType,asc", label: "Tipo de serviço (A-Z)" },
        { value: "serviceType,desc", label: "Tipo de serviço (Z-A)" },
      ];
    }
    return base;
  }, []);

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
        ...(adTypes != null && { types: adTypes }),
        ...(adType != null && { type: adType }),
        search: search.trim() ? search.trim() : undefined,
        page: nextPage,
        size: 20,
        sort: sortOrder,
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

  // Reset ordenação ao trocar aba
  useEffect(() => {
    const defaultSort = getDefaultSort(tab);
    setSortOrder(defaultSort);
  }, [tab, getDefaultSort]);

  // Recarrega ao trocar aba, busca ou ordenação
  useEffect(() => {
    setItems([]);
    setPage(0);
    setHasMore(true);
    const t = setTimeout(() => {
      load(true);
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adType, adTypes, activeCommunityId, search, sortOrder]);

  // Fechar menu de ordenação ao clicar fora
  useEffect(() => {
    if (!sortMenuOpen) return;
    function handleClick(e: MouseEvent) {
      if (sortMenuRef.current && !sortMenuRef.current.contains(e.target as Node)) {
        setSortMenuOpen(false);
      }
    }
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [sortMenuOpen]);

  async function onContactClick(ad: AdResponse) {
    if (!activeCommunityId) return;

    // Verifica se é o criador do anúncio
    if (user && ad.userId === user.id) {
      alert("Esse anúncio é seu! 😊");
      return;
    }

    if (ad.type === "RECOMMENDATION") {
      if (!ad.recommendedContact?.trim()) {
        alert("Esta indicação não possui WhatsApp cadastrado.");
        return;
      }
      const digits = ad.recommendedContact.replace(/[^\d]/g, "");
      if (!digits) {
        alert("WhatsApp inválido.");
        return;
      }
      const url = buildRecommendationContactUrl(
        ad.recommendedContact,
        ad.serviceType ?? "serviço",
        ad.title
      );
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      if (!ad.userWhatsapp) {
        alert("Este anúncio não possui WhatsApp cadastrado.");
        return;
      }
      const digits = ad.userWhatsapp.replace(/[^\d]/g, "");
      if (!digits) {
        alert("WhatsApp inválido.");
        return;
      }
      window.open(buildContactUrl(ad.userWhatsapp, ad.title, ad.price), "_blank", "noopener,noreferrer");
    }

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
    <div className="min-h-screen bg-bg pb-24">
      <div className="sticky top-0 z-10">
        <Navbar sticky={false} />
        {/* Barra de filtros logo abaixo da Navbar — grudam juntas ao rolar */}
        <div className="border-b border-border bg-bg/95 shadow-[0_2px_8px_rgba(0,0,0,0.04)] backdrop-blur supports-[backdrop-filter]:bg-bg/90">
        <div className="mx-auto flex max-w-5xl items-stretch gap-1 px-2 py-2 sm:gap-2 sm:px-3">
          {TAB_ORDER.map((t) => {
            const active = tab === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                title={t === "INDICACOES" ? "Indicações" : undefined}
                className={
                  "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg border-2 px-1 py-1.5 text-[9px] font-semibold transition sm:gap-1 sm:py-2 sm:text-[10px] dark:[&_svg]:stroke-white dark:[&_span]:text-white " +
                  (active
                    ? "border-accent bg-accent/15 text-accent-strong dark:bg-card dark:border-white/40"
                    : "border-border bg-surface text-muted hover:border-accent/50 hover:text-text dark:bg-card dark:border-white/25")
                }
              >
                <FilterIcon tab={t} />
                <span className="w-full text-center">{FILTER_LABELS[t]}</span>
              </button>
            );
          })}
        </div>
        </div>
      </div>

      <div
        className="mx-auto max-w-5xl px-4 py-6"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex items-center gap-2">
          <div className="min-h-[2.5rem] min-w-0 flex-1">
            <input
              className="h-full min-h-[2.5rem] w-full rounded-xl border border-border bg-card px-4 text-base placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
              placeholder="Buscar anúncios..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="relative shrink-0" ref={sortMenuRef}>
            <button
              type="button"
              onClick={() => setSortMenuOpen((o) => !o)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-text transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary/25 dark:text-white sm:h-12 sm:w-12"
              aria-label="Ordenar anúncios"
              aria-expanded={sortMenuOpen}
              aria-haspopup="listbox"
            >
              <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
              </svg>
            </button>
            {sortMenuOpen ? (
              <div
                className="absolute right-0 top-full z-20 mt-1 min-w-[12rem] rounded-xl border border-border bg-bg py-1 shadow-xl"
                role="listbox"
              >
                {getSortOptions(tab).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    aria-selected={sortOrder === opt.value}
                    onClick={() => {
                      setSortOrder(opt.value);
                      setSortMenuOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-sm transition hover:bg-surface/80 ${
                      sortOrder === opt.value ? "bg-primary/10 font-medium text-primary-strong" : "text-text"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {error ? <div className="mt-4 text-sm text-danger">{error}</div> : null}

        <div className="mt-4 grid gap-3">
          {items.map((ad) => (
            <Card key={ad.id} className="p-0">
              <button
                type="button"
                className="w-full rounded-2xl text-left hover:bg-surface/60"
                onClick={() => nav(`/ads/${ad.id}`)}
              >
                {ad.type !== "RECOMMENDATION" ? (
                  <div className="flex flex-col sm:flex-row sm:items-stretch">
                    <div className="aspect-[4/3] w-full flex-shrink-0 overflow-hidden rounded-t-2xl rounded-b-xl bg-surface sm:w-40 sm:rounded-b-none sm:rounded-l-2xl sm:rounded-tr-none">
                      {ad.imageUrls?.length ? (
                        <img
                          src={resolveImageUrl(ad.imageUrls[0])}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <AdPlaceholder compact className="h-full w-full min-h-0" />
                      )}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col p-4 sm:flex-row sm:items-start sm:gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold">{ad.title}</div>
                        <div className="mt-1 line-clamp-2 text-sm text-muted">
                          <TextWithLinks
                            text={ad.description ?? "Sem descrição"}
                            stopPropagation
                          />
                        </div>
                        {ad.type === "DONATION" ? (
                          <span className="mt-1 inline-block text-xs text-muted">Doação</span>
                        ) : ad.price != null ? (
                          <span className="mt-1 inline-block text-sm font-semibold text-price">
                            {formatPriceCompact(Number(ad.price))}
                          </span>
                        ) : (
                          <span className="mt-1 inline-block text-xs text-muted">A consultar</span>
                        )}
                      </div>
                      <div className="mt-2 flex flex-shrink-0 items-center justify-between gap-2 sm:mt-0 sm:flex-col sm:items-end sm:justify-start">
                        <Badge tone="primary">{AdTypeLabels[ad.type]}</Badge>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 px-4 pt-4">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold">{ad.title}</div>
                      <div className="mt-1 max-h-10 overflow-hidden text-sm text-muted">
                        <TextWithLinks
                          text={ad.description ?? "Sem descrição"}
                          stopPropagation
                        />
                      </div>
                      {ad.serviceType ? (
                        <div className="mt-0.5 text-xs text-info">{ad.serviceType}</div>
                      ) : null}
                    </div>
                    <div className="flex flex-shrink-0 flex-col items-end gap-1">
                      <Badge tone="accent">{AdTypeLabels[ad.type]}</Badge>
                      <div className="flex flex-col items-end text-xs text-muted">
                        {(ad.ratingCount ?? 0) > 0 ? (
                          <>
                            <span>{Number(ad.averageRating).toFixed(1)} de 5 ★</span>
                            <span>{ad.ratingCount} {ad.ratingCount === 1 ? "avaliação" : "avaliações"}</span>
                          </>
                        ) : (
                          <span>Sem avaliações</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between gap-3 border-t border-border/50 px-4 py-3">
                  <div className="min-w-0 shrink text-xs text-muted">
                    <div className="truncate">por <span className="font-medium text-text">{ad.userName}</span></div>
                    {ad.createdAt ? (
                      <div>{formatPublishedAt(ad.createdAt)}</div>
                    ) : null}
                  </div>
                  {user && (ad.type !== "RECOMMENDATION" || !!ad.recommendedContact?.trim()) ? (
                    <Button
                      type="button"
                      variant="accent"
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
            <div className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted dark:shadow-none">
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

      <BottomNav />
    </div>
  );
}

