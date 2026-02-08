import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";
import type { CommunityResponse } from "../services/contracts";
import * as CondominiumService from "../services/condominium.service";

type CondominiumContextValue = {
  communities: CommunityResponse[];
  activeCommunityId: number | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
  setActiveCommunityId: (id: number) => void;
  clear: () => void;
};

const ACTIVE_COMMUNITY_KEY = "comuminha.activeCommunityId";

export const CondominiumContext = createContext<CondominiumContextValue | null>(null);

export function CondominiumProvider({ children }: { children: React.ReactNode }) {
  const [communities, setCommunities] = useState<CommunityResponse[]>([]);
  const [activeCommunityId, setActiveCommunityIdState] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(ACTIVE_COMMUNITY_KEY);
    if (raw) {
      const parsed = Number(raw);
      if (!Number.isNaN(parsed)) setActiveCommunityIdState(parsed);
    }
  }, []);

  const setActiveCommunityId = useCallback((id: number) => {
    setActiveCommunityIdState(id);
    localStorage.setItem(ACTIVE_COMMUNITY_KEY, String(id));
  }, []);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await CondominiumService.listMyCommunities();
      setCommunities(list);

      if (list.length === 0) {
        setActiveCommunityIdState(null);
        localStorage.removeItem(ACTIVE_COMMUNITY_KEY);
        return;
      }

      // Se a comunidade ativa não existir mais, seleciona a primeira.
      const stillValid = activeCommunityId && list.some((c) => c.id === activeCommunityId);
      if (!stillValid) {
        setActiveCommunityId(list[0].id);
      }
    } finally {
      setIsLoading(false);
    }
  }, [activeCommunityId, setActiveCommunityId]);

  const clear = useCallback(() => {
    setCommunities([]);
    setActiveCommunityIdState(null);
    localStorage.removeItem(ACTIVE_COMMUNITY_KEY);
  }, []);

  const value = useMemo<CondominiumContextValue>(
    () => ({
      communities,
      activeCommunityId,
      isLoading,
      refresh,
      setActiveCommunityId,
      clear,
    }),
    [communities, activeCommunityId, isLoading, refresh, setActiveCommunityId, clear]
  );

  return <CondominiumContext.Provider value={value}>{children}</CondominiumContext.Provider>;
}

