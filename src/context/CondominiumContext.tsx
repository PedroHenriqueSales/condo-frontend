import React, { createContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CommunityResponse } from "../services/contracts";
import * as CondominiumService from "../services/condominium.service";

type CondominiumContextValue = {
  communities: CommunityResponse[];
  activeCommunityId: number | null;
  isLoading: boolean;
  refresh: () => Promise<CommunityResponse[]>;
  setActiveCommunityId: (id: number) => void;
  clear: () => void;
};

const ACTIVE_COMMUNITY_KEY = "aquidolado.activeCommunityId";

export const CondominiumContext = createContext<CondominiumContextValue | null>(null);

export function CondominiumProvider({ children }: { children: React.ReactNode }) {
  const [communities, setCommunities] = useState<CommunityResponse[]>([]);
  const [activeCommunityId, setActiveCommunityIdState] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const activeCommunityIdRef = useRef<number | null>(null);
  activeCommunityIdRef.current = activeCommunityId;

  useEffect(() => {
    const raw = localStorage.getItem(ACTIVE_COMMUNITY_KEY);
    if (raw) {
      const parsed = Number(raw);
      if (!Number.isNaN(parsed)) {
        setActiveCommunityIdState(parsed);
        activeCommunityIdRef.current = parsed;
      }
    }
  }, []);

  const setActiveCommunityId = useCallback((id: number) => {
    setActiveCommunityIdState(id);
    activeCommunityIdRef.current = id;
    localStorage.setItem(ACTIVE_COMMUNITY_KEY, String(id));
  }, []);

  const refresh = useCallback(async (): Promise<CommunityResponse[]> => {
    setIsLoading(true);
    try {
      const list = await CondominiumService.listMyCommunities();
      setCommunities(list);

      if (list.length === 0) {
        setActiveCommunityIdState(null);
        activeCommunityIdRef.current = null;
        localStorage.removeItem(ACTIVE_COMMUNITY_KEY);
        return list;
      }

      // Se a comunidade ativa não existir mais, seleciona a primeira.
      const current = activeCommunityIdRef.current;
      const stillValid = current && list.some((c) => c.id === current);
      if (!stillValid) {
        const firstId = list[0].id;
        setActiveCommunityIdState(firstId);
        activeCommunityIdRef.current = firstId;
        localStorage.setItem(ACTIVE_COMMUNITY_KEY, String(firstId));
      }
      return list;
    } finally {
      setIsLoading(false);
    }
  }, []); // Sem dependências - usa ref para activeCommunityId

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

