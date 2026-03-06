import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useCondominium } from "../hooks/useCondominium";
import { useNotifications } from "../hooks/useNotifications";
import logoNameDark from "../assets/logo-name-dark.png";
import { Button } from "./Button";
import * as CondominiumService from "../services/condominium.service";
import type { CommunityResponse } from "../services/contracts";

type NavbarProps = { sticky?: boolean };

export function Navbar({ sticky = true }: NavbarProps) {
  const nav = useNavigate();
  const { user, logout } = useAuth();
  const { communities, activeCommunityId, setActiveCommunityId } = useCondominium();
  const { summary, isLoadingSummary, markAsRead, markAllAsRead, markAdsAsViewed } = useNotifications();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [adminCommunities, setAdminCommunities] = useState<CommunityResponse[] | null>(null);

  const activeCommunity = activeCommunityId
    ? communities.find((c) => c.id === activeCommunityId)
    : null;

  // Carrega comunidades de admin assim que o usuário está disponível, para o menu não “pular” ao abrir
  useEffect(() => {
    if (user) {
      CondominiumService.listAdminCommunities()
        .then(setAdminCommunities)
        .catch(() => setAdminCommunities([]));
    } else {
      setAdminCommunities(null);
    }
  }, [user]);

  return (
    <>
      <div className={`border-b border-white/10 bg-[#382D20] dark:bg-[#1c1612] ${sticky ? "sticky top-0 z-10" : ""}`}>
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Link
              to="/feed"
              className="flex shrink-0 items-center rounded overflow-hidden bg-[#382D20] dark:bg-[#1c1612]"
              aria-label="Aqui - Início"
            >
              <img
                src={logoNameDark}
                alt="Aqui"
                className="h-14 w-auto bg-transparent sm:h-16 mix-blend-lighten"
              />
            </Link>
            {activeCommunity ? (
              <Link
                to="/communities"
                className="hidden min-w-0 sm:flex sm:items-center sm:gap-2 sm:rounded-lg sm:border sm:border-white/15 sm:bg-white/5 sm:px-3 sm:py-2 sm:transition hover:sm:bg-white/10 hover:sm:border-white/25"
                title={`Selecionar comunidade · ${activeCommunity.name}`}
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/10">
                  <svg className="h-3.5 w-3.5 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </span>
                <span className="min-w-0 truncate text-sm font-medium text-white/95">
                  {activeCommunity.name}
                </span>
                <svg className="h-4 w-4 shrink-0 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </svg>
              </Link>
            ) : null}
          </div>

          <div className="flex flex-shrink-0 items-center gap-2 text-white">
            {user ? (
              <span className="hidden text-xs text-white/90 sm:inline">{user.name}</span>
            ) : null}

            {/* Ícone de notificações — z-20 para o dropdown ficar acima da barra de filtros do feed */}
            {user ? (
              <div className="relative z-20">
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white hover:bg-white/10"
                  aria-label="Notificações"
                  onClick={() => setNotificationsOpen((open) => !open)}
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  {summary && (() => {
                    const unreadCount = summary.totalUnread ?? 0;
                    const newAdsCount = (summary.newAdsByCommunity ?? []).reduce((s, i) => s + i.newAdsCount, 0);
                    const totalBadgeCount = unreadCount + newAdsCount;
                    return totalBadgeCount > 0 ? (
                      <span className="absolute -right-1 -top-1 inline-flex min-h-[1.1rem] min-w-[1.1rem] items-center justify-center rounded-full bg-red-500 px-1.5 text-[0.65rem] font-semibold leading-tight text-white shadow-sm">
                        {totalBadgeCount > 99 ? "99+" : totalBadgeCount > 9 ? "9+" : totalBadgeCount}
                      </span>
                    ) : null;
                  })()}
                </button>

                {/* Dropdown de notificações — z-50 para ficar acima da barra de filtros do feed */}
                {notificationsOpen ? (
                  <div
                    className="absolute right-0 z-50 mt-2 w-80 max-w-[85vw] rounded-xl border border-white/15 bg-[#241b14] text-sm shadow-xl"
                    role="dialog"
                    aria-label="Notificações"
                  >
                    <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
                      <span className="text-xs font-semibold uppercase tracking-wide text-white/70">
                        Notificações
                      </span>
                      <div className="flex items-center gap-2">
                        {summary && ((summary.totalUnread ?? 0) > 0 || (summary.newAdsByCommunity?.length ?? 0) > 0) ? (
                          <button
                            type="button"
                            className="rounded-full px-2 py-0.5 text-[0.7rem] font-medium text-white/80 hover:bg-white/10"
                            onClick={() => {
                              if ((summary?.totalUnread ?? 0) > 0) {
                                markAllAsRead().catch(() => {});
                              }
                              if ((summary?.newAdsByCommunity?.length ?? 0) > 0) {
                                markAdsAsViewed().catch(() => {});
                              }
                            }}
                          >
                            Marcar tudo como lido
                          </button>
                        ) : null}
                      </div>
                    </div>

                    <div className="max-h-80 overflow-y-auto px-3 py-2">
                      {isLoadingSummary ? (
                        <div className="py-4 text-xs text-white/60">Carregando notificações…</div>
                      ) : !summary ? (
                        <div className="py-4 text-xs text-white/60">
                          Entre para ver suas notificações.
                        </div>
                      ) : (
                        <>
                          {/* Novos anúncios por comunidade */}
                          {summary.newAdsByCommunity.length > 0 ? (
                            <div className="mb-3 rounded-lg bg-white/5 p-2">
                              <div className="mb-1 text-[0.7rem] font-semibold uppercase tracking-wide text-white/70">
                                Novos anúncios nas suas comunidades
                              </div>
                              <ul className="space-y-1.5">
                                {summary.newAdsByCommunity.map((item) => (
                                  <li key={item.communityId}>
                                    <button
                                      type="button"
                                      className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-xs text-white/90 hover:bg-white/10"
                                      onClick={() => {
                                        // Define a comunidade ativa para o feed mostrar os anúncios certos
                                        if (item.communityId) {
                                          setActiveCommunityId(item.communityId);
                                        }
                                        markAdsAsViewed(item.communityId).catch(() => {});
                                        nav("/feed");
                                        setNotificationsOpen(false);
                                      }}
                                    >
                                      <span className="mr-2 line-clamp-2">
                                        {item.communityName ?? "Comunidade"}
                                      </span>
                                      <span className="ml-auto rounded-full bg-white/15 px-2 py-0.5 text-[0.7rem] font-semibold">
                                        {item.newAdsCount}
                                      </span>
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : null}

                          {/* Lista de notificações recentes */}
                          {summary.recentNotifications.length === 0 ? (
                            <div className="py-4 text-xs text-white/60">
                              Nenhuma notificação por aqui.
                            </div>
                          ) : (
                            <ul className="space-y-1.5">
                              {summary.recentNotifications.map((n) => {
                                const isUnread = !n.readAt;
                                const goToAd = n.adId != null ? () => {
                                  setNotificationsOpen(false);
                                  nav(`/ads/${n.adId}`);
                                } : undefined;
                                const goToGateWithCode =
                                  n.type === "ACCESS_CODE_GRANTED" && n.accessCode
                                    ? () => {
                                        setNotificationsOpen(false);
                                        nav(`/gate?code=${encodeURIComponent(n.accessCode!)}`);
                                      }
                                    : undefined;
                                const goTo = goToAd ?? goToGateWithCode;
                                return (
                                  <li key={n.id}>
                                    <button
                                      type="button"
                                      className={`flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left text-xs hover:bg-white/10 ${
                                        isUnread ? "bg-white/5" : ""
                                      }`}
                                      onClick={() => {
                                        if (isUnread) {
                                          markAsRead(n.id).catch(() => {});
                                        }
                                        if (goTo) goTo();
                                      }}
                                    >
                                      <span
                                        className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                                          isUnread ? "bg-emerald-400" : "bg-white/20"
                                        }`}
                                      />
                                      <span className="flex-1">
                                        <span className="block text-[0.72rem] font-semibold text-white">
                                          {n.title}
                                        </span>
                                        {n.body ? (
                                          <span className="mt-0.5 block text-[0.7rem] text-white/80">
                                            {n.body}
                                          </span>
                                        ) : null}
                                        {n.communityName ? (
                                          <span className="mt-0.5 block text-[0.68rem] text-white/60">
                                            {n.communityName}
                                          </span>
                                        ) : null}
                                      </span>
                                    </button>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => { logout(); nav("/", { replace: true }); }}
              className="hidden sm:inline-flex !text-white hover:!bg-white/10 !border-white/30"
            >
              Sair
            </Button>

            <button
              type="button"
              aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={menuOpen}
              className="flex h-10 w-10 flex-shrink-0 flex-col items-center justify-center gap-1.5 rounded-xl hover:bg-white/10 sm:hidden"
              onClick={() => setMenuOpen((o) => !o)}
            >
              <span
                className={`h-0.5 w-5 rounded-full bg-white transition ${menuOpen ? "translate-y-2 rotate-45" : ""}`}
              />
              <span className={`h-0.5 w-5 rounded-full bg-white transition ${menuOpen ? "opacity-0" : ""}`} />
              <span
                className={`h-0.5 w-5 rounded-full bg-white transition ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`}
              />
            </button>
          </div>
        </div>
        {activeCommunity ? (
          <div className="border-t border-white/10 bg-white/5 sm:hidden">
            <div className="mx-auto flex max-w-5xl items-center px-4 py-2">
              <Link
                to="/communities"
                className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 transition active:bg-white/10"
                onClick={() => setMenuOpen(false)}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <svg className="h-4 w-4 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-white">
                  {activeCommunity.name}
                </span>
                <svg className="h-4 w-4 shrink-0 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        ) : null}
      </div>

      {menuOpen ? (
        <div
          className="fixed inset-0 z-50 sm:hidden"
          aria-hidden="false"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          {/* Fundo transparente – clique fecha o menu */}
          <button
            type="button"
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            aria-label="Fechar menu"
            onClick={() => setMenuOpen(false)}
          />
          {/* Menu compacto alinhado ao canto superior direito */}
          <div
            className="absolute right-3 top-14 min-w-[10rem] rounded-xl border border-border bg-bg shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="flex flex-col gap-0.5 p-2">
              {activeCommunity ? (
                <Link
                  to={`/communities/${activeCommunity.id}`}
                  className="flex items-center gap-2 rounded-xl border border-border/60 bg-surface/50 px-3 py-2.5 shadow-sm hover:bg-surface/70"
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/15">
                    <svg className="h-3 w-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </span>
                  <span className="min-w-0 truncate text-sm font-medium text-text">{activeCommunity.name}</span>
                </Link>
              ) : null}
              {user ? (
                <div className="rounded-lg px-3 py-2 text-sm font-medium text-text">
                  {user.name}
                </div>
              ) : null}
              <Link
                to="/my-account"
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-surface/60"
                onClick={() => setMenuOpen(false)}
              >
                Minha conta
              </Link>
              {adminCommunities === null ? (
                <div className="rounded-lg px-3 py-2 text-xs text-muted">Carregando…</div>
              ) : adminCommunities.length > 0 ? (
                adminCommunities.length === 1 ? (
                  <Link
                    to={`/communities/${adminCommunities[0].id}/admin`}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-surface/60"
                    onClick={() => setMenuOpen(false)}
                  >
                    Administrar comunidade
                  </Link>
                ) : (
                  <>
                    <div className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted">
                      Administrar comunidade
                    </div>
                    {adminCommunities.map((c) => (
                      <Link
                        key={c.id}
                        to={`/communities/${c.id}/admin`}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 pl-5 text-sm font-medium text-muted hover:bg-surface/60"
                        onClick={() => setMenuOpen(false)}
                      >
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-muted" aria-hidden />
                        <span className="min-w-0 truncate">{c.name}</span>
                      </Link>
                    ))}
                  </>
                )
              ) : null}
              <button
                type="button"
                className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-muted hover:bg-surface/60"
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                  nav("/", { replace: true });
                }}
              >
                Sair
              </button>
            </nav>
          </div>
        </div>
      ) : null}
    </>
  );
}
