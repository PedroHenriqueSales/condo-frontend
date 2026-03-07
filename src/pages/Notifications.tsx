import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../hooks/useNotifications";
import type { NotificationResponse, Page } from "../services/contracts";
import { Navbar } from "../components/Navbar";
import { BottomNav } from "../components/BottomNav";

export function NotificationsPage() {
  const nav = useNavigate();
  const { listNotifications, markAsRead, markAllAsRead } = useNotifications();
  const [page, setPage] = useState<Page<NotificationResponse> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    listNotifications({ unreadOnly: showUnreadOnly, page: pageIndex, size: 20 })
      .then((data) => {
        if (!cancelled) {
          setPage(data);
        }
      })
      .catch((err: any) => {
        if (!cancelled) {
          const message =
            err?.response?.data?.message ??
            err?.message ??
            "Não foi possível carregar as notificações.";
          setError(message);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [listNotifications, showUnreadOnly, pageIndex]);

  const handleMarkAsRead = async (n: NotificationResponse) => {
    if (n.readAt) return;
    try {
      await markAsRead(n.id);
      setPage((current) => {
        if (!current) return current;
        const nowIso = new Date().toISOString();
        return {
          ...current,
          content: current.content.map((item) =>
            item.id === n.id ? { ...item, readAt: nowIso } : item,
          ),
        };
      });
    } catch {
      // silencioso
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setPage((current) => {
        if (!current) return current;
        const nowIso = new Date().toISOString();
        return {
          ...current,
          content: current.content.map((item) => ({
            ...item,
            readAt: nowIso,
          })),
        };
      });
    } catch {
      // silencioso
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f1e8] text-[#241b14] dark:bg-[#12100e] dark:text-white">
      <Navbar />

      <main className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-4 pb-20 sm:pb-10">
        <header className="flex items-center justify-between gap-2">
          <div>
            <h1 className="text-lg font-semibold">Notificações</h1>
            <p className="text-xs text-black/60 dark:text-white/60">
              Acompanhe atividades importantes nas suas comunidades.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                showUnreadOnly
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200"
                  : "border-black/10 bg-white/40 text-black/70 dark:border-white/15 dark:bg-white/5 dark:text-white/70"
              }`}
              onClick={() => {
                setShowUnreadOnly((v) => !v);
                setPageIndex(0);
              }}
            >
              Somente não lidas
            </button>
            <button
              type="button"
              className="rounded-full border border-black/10 bg-white/60 px-3 py-1 text-xs font-medium text-black/70 shadow-sm transition hover:bg-white dark:border-white/20 dark:bg-white/5 dark:text-white/80"
              onClick={handleMarkAllAsRead}
            >
              Marcar todas como lidas
            </button>
          </div>
        </header>

        {isLoading && !page ? (
          <div className="rounded-lg border border-black/10 bg-white/70 p-4 text-sm text-black/70 dark:border-white/15 dark:bg-white/5 dark:text-white/70">
            Carregando notificações…
          </div>
        ) : null}

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </div>
        ) : null}

        {page && page.content.length === 0 && !isLoading ? (
          <div className="rounded-lg border border-black/10 bg-white/70 p-4 text-sm text-black/70 dark:border-white/15 dark:bg-white/5 dark:text-white/70">
            Nenhuma notificação encontrada.
          </div>
        ) : null}

        {page && page.content.length > 0 ? (
          <ul className="space-y-2">
            {page.content.map((n) => {
              const isUnread = !n.readAt;
              const goToAd = n.adId != null ? () => nav(`/ads/${n.adId}`) : undefined;
              const goToGateWithCode =
                n.type === "ACCESS_CODE_GRANTED" && n.accessCode
                  ? () => nav(`/gate?code=${encodeURIComponent(n.accessCode!)}`)
                  : undefined;
              const goToCommunityAdmin =
                n.type === "ACCESS_CODE_REQUEST" && n.communityId != null
                  ? () => nav(`/communities/${n.communityId}/admin`)
                  : undefined;
              const goTo = goToAd ?? goToGateWithCode ?? goToCommunityAdmin;
              return (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => {
                      handleMarkAsRead(n);
                      if (goTo) goTo();
                    }}
                    className={`flex w-full items-start gap-3 rounded-xl border px-3 py-2 text-left text-sm transition ${
                      isUnread
                        ? "border-emerald-500/60 bg-emerald-50 dark:border-emerald-500/60 dark:bg-emerald-950/20"
                        : "border-black/10 bg-white/80 hover:bg-white dark:border-white/15 dark:bg-white/5 dark:hover:bg-white/10"
                    }`}
                  >
                    <span
                      className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                        isUnread ? "bg-emerald-500" : "bg-black/30 dark:bg-white/30"
                      }`}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold">{n.title}</span>
                      </div>
                      {n.body ? (
                        <p className="mt-0.5 text-[0.78rem] text-black/75 dark:text-white/80">
                          {n.body}
                        </p>
                      ) : null}
                      {n.communityName ? (
                        <p className="mt-0.5 text-[0.7rem] text-black/60 dark:text-white/60">
                          {n.communityName}
                        </p>
                      ) : null}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}

        {page && page.totalPages > 1 ? (
          <div className="mt-2 flex items-center justify-between gap-2 text-xs text-black/70 dark:text-white/70">
            <button
              type="button"
              className="rounded-full border border-black/15 bg-white/70 px-3 py-1 text-xs font-medium text-black/60 disabled:opacity-40 dark:border-white/20 dark:bg-white/5 dark:text-white/70"
              onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
              disabled={pageIndex === 0}
            >
              Anteriores
            </button>
            <span>
              Página {pageIndex + 1} de {page.totalPages}
            </span>
            <button
              type="button"
              className="rounded-full border border-black/15 bg-white/70 px-3 py-1 text-xs font-medium text-black/60 disabled:opacity-40 dark:border-white/20 dark:bg-white/5 dark:text-white/70"
              onClick={() =>
                setPageIndex((p) =>
                  page ? Math.min(page.totalPages - 1, p + 1) : p,
                )
              }
              disabled={pageIndex >= (page.totalPages ?? 1) - 1}
            >
              Próximas
            </button>
          </div>
        ) : null}
      </main>

      <BottomNav />
    </div>
  );
}

