import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  NotificationSummary,
  NotificationResponse,
  Page,
} from "../services/contracts";
import * as NotificationService from "../services/notifications.service";
import { useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

type NotificationContextValue = {
  summary: NotificationSummary | null;
  isLoadingSummary: boolean;
  errorSummary: string | null;
  refreshSummary: () => Promise<void>;
  listNotifications: (params?: {
    unreadOnly?: boolean;
    page?: number;
    size?: number;
  }) => Promise<Page<NotificationResponse>>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  markAdsAsViewed: (communityId?: number) => Promise<void>;
};

export const NotificationContext =
  createContext<NotificationContextValue | null>(null);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token } = useAuth();
  const location = useLocation();
  const [summary, setSummary] = useState<NotificationSummary | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [errorSummary, setErrorSummary] = useState<string | null>(null);

  const refreshSummary = useCallback(async () => {
    if (!token) {
      setSummary(null);
      setErrorSummary(null);
      return;
    }
    setIsLoadingSummary(true);
    setErrorSummary(null);
    try {
      const data = await NotificationService.getNotificationSummary();
      setSummary(data);
    } catch (err: any) {
      // Falha na central de notificações não deve derrubar o app
      const message =
        err?.response?.data?.message ??
        err?.message ??
        "Não foi possível carregar notificações.";
      setErrorSummary(message);
    } finally {
      setIsLoadingSummary(false);
    }
  }, [token]);

  useEffect(() => {
    // Atualiza sempre que a rota mudar, se estiver logado
    if (!token) {
      setSummary(null);
      return;
    }
    refreshSummary();
  }, [token, location.pathname, refreshSummary]);

  const listNotifications = useCallback(
    async (params?: {
      unreadOnly?: boolean;
      page?: number;
      size?: number;
    }) => {
      return NotificationService.listNotifications(params);
    },
    [],
  );

  const markAsRead = useCallback(async (id: number) => {
    await NotificationService.markAsRead(id);
    // Atualiza somente o contador/local
    setSummary((current) => {
      if (!current) return current;
      const nextNotifications = current.recentNotifications.map((n) =>
        n.id === id ? { ...n, readAt: new Date().toISOString() } : n,
      );
      const nextUnread = nextNotifications.filter((n) => !n.readAt).length;
      return {
        ...current,
        recentNotifications: nextNotifications,
        totalUnread: nextUnread,
      };
    });
  }, []);

  const markAllAsRead = useCallback(async () => {
    await NotificationService.markAllAsRead();
    setSummary((current) => {
      if (!current) return current;
      const nowIso = new Date().toISOString();
      return {
        ...current,
        totalUnread: 0,
        recentNotifications: current.recentNotifications.map((n) => ({
          ...n,
          readAt: nowIso,
        })),
      };
    });
  }, []);

  const markAdsAsViewed = useCallback(async (communityId?: number) => {
    await NotificationService.markAdsAsViewed(communityId);
    // Depois que o usuário visualiza os anúncios, zera apenas a parte de novos anúncios
    setSummary((current) => {
      if (!current) return current;
      return { ...current, newAdsByCommunity: [] };
    });
  }, []);

  const value = useMemo<NotificationContextValue>(
    () => ({
      summary,
      isLoadingSummary,
      errorSummary,
      refreshSummary,
      listNotifications,
      markAsRead,
      markAllAsRead,
      markAdsAsViewed,
    }),
    [
      summary,
      isLoadingSummary,
      errorSummary,
      refreshSummary,
      listNotifications,
      markAsRead,
      markAllAsRead,
      markAdsAsViewed,
    ],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

