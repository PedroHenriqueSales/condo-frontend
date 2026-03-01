import { useEffect, useState } from "react";
import { Navigate, useLocation, useParams } from "react-router-dom";
import { useCondominium } from "../hooks/useCondominium";
import { AdDetail } from "../pages/AdDetail";
import * as AdsService from "../services/ads.service";

type AdCheckStatus = "pending" | "allowed" | "not_in_community";

/**
 * Wrapper para /ads/:id: exige login (RequireAuth no pai), depois verifica comunidades e acesso ao anúncio.
 * - Sem comunidades → redireciona para /gate com mensagem.
 * - Erro ao carregar anúncio (ex.: usuário não está na comunidade) → redireciona para /gate com mensagem.
 * - Sucesso → define comunidade ativa e exibe AdDetail.
 */
export function AdDetailGate() {
  const location = useLocation();
  const { id } = useParams();
  const { communities, isLoading, refresh, setActiveCommunityId } = useCondominium();
  const [adCheckStatus, setAdCheckStatus] = useState<AdCheckStatus>("pending");
  const [communitiesLoadDone, setCommunitiesLoadDone] = useState(false);

  useEffect(() => {
    refresh().then(() => setCommunitiesLoadDone(true));
  }, [refresh]);

  useEffect(() => {
    if (!communitiesLoadDone || !id || communities.length === 0) return;
    const adId = Number(id);
    if (!adId) {
      setAdCheckStatus("not_in_community");
      return;
    }

    setAdCheckStatus("pending");
    AdsService.getAdById(adId)
      .then((ad) => {
        setActiveCommunityId(ad.communityId);
        setAdCheckStatus("allowed");
      })
      .catch(() => {
        setAdCheckStatus("not_in_community");
      });
  }, [id, communitiesLoadDone, communities.length, setActiveCommunityId]);

  // Só decidir após a primeira carga de comunidades (evita redirecionar com lista ainda vazia).
  if (!communitiesLoadDone || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <span className="text-sm text-muted">Carregando...</span>
      </div>
    );
  }

  if (communities.length === 0) {
    return (
      <Navigate
        to="/gate"
        state={{
          from: { pathname: location.pathname, search: location.search },
          message: "Você precisa entrar em uma comunidade para ver anúncios.",
        }}
        replace
      />
    );
  }

  if (adCheckStatus === "not_in_community") {
    return (
      <Navigate
        to="/gate"
        state={{
          from: { pathname: location.pathname, search: location.search },
          message: "Você não está na comunidade onde este anúncio foi publicado.",
        }}
        replace
      />
    );
  }

  if (adCheckStatus !== "allowed") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <span className="text-sm text-muted">Carregando...</span>
      </div>
    );
  }

  return <AdDetail />;
}
