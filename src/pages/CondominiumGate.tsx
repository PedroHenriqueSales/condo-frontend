import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useSearchParams, useLocation, Link } from "react-router-dom";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { LocationMapPicker } from "../components/LocationMapPicker";
import { Navbar } from "../components/Navbar";
import { BottomNav } from "../components/BottomNav";
import { useAuth } from "../hooks/useAuth";
import { useCondominium } from "../hooks/useCondominium";
import * as CondominiumService from "../services/condominium.service";
import type { NearbyCommunityResponse } from "../services/contracts";

const RADIUS_OPTIONS_KM = [1, 2, 5, 10, 15] as const;

export function CondominiumGate() {
  const nav = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { logout } = useAuth();
  const state = location.state as { from?: { pathname: string; search: string }; message?: string } | null;
  const from = state?.from;
  const gateMessage = state?.message ?? null;
  const codeFromUrl = searchParams.get("code") ?? "";
  /** Link de convite: code na query string (usa location.search para evitar race na navegação) */
  const isInviteLink = location.search.includes("code=");
  const {
    communities,
    activeCommunityId,
    isLoading,
    refresh,
    setActiveCommunityId,
  } = useCondominium();

  const [accessCode, setAccessCode] = useState(() => codeFromUrl || "");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState<"join" | null>(null);

  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);
  const [radiusKm, setRadiusKm] = useState<number>(5);
  const [nearbyList, setNearbyList] = useState<NearbyCommunityResponse[]>([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [nearbyLocationLoading, setNearbyLocationLoading] = useState(false);
  const [nearbyError, setNearbyError] = useState<string | null>(null);
  const [requestedCommunityIds, setRequestedCommunityIds] = useState<Set<number>>(new Set());
  const [requestBusy, setRequestBusy] = useState<number | null>(null);
  const [hasSearchedNearby, setHasSearchedNearby] = useState(false);
  const [locationObtainedFromBrowser, setLocationObtainedFromBrowser] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);

  useEffect(() => {
    if (codeFromUrl) setAccessCode(codeFromUrl);
  }, [codeFromUrl]);

  useEffect(() => {
    refresh().catch((err) => {
      setError(err?.response?.data?.error ?? "Falha ao carregar comunidades.");
    });
  }, [refresh]);

  // Link de convite (?code=...): nunca redirecionar — sempre mostrar a gate com o código.
  // Usa isInviteLink (location.search) para não depender de searchParams no primeiro render.
  useEffect(() => {
    if (isInviteLink) return;
    if (!from && communities.length > 0 && activeCommunityId) {
      nav("/communities", { replace: true });
    }
  }, [from, communities.length, activeCommunityId, isInviteLink, nav]);

  async function onJoin(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setBusy("join");
    try {
      const c = await CondominiumService.joinCommunity({ accessCode: accessCode.trim() });
      if (c.joinPending) {
        setSuccessMessage("Solicitação enviada. Aguarde a aprovação do administrador da comunidade.");
        setAccessCode("");
        return;
      }
      setActiveCommunityId(c.id);
      await refresh();
      // Link de convite: sempre ir para a lista; navegação no próximo tick para não ser sobrescrita por outro redirect.
      const target = isInviteLink ? "/communities" : (from ? `${from.pathname}${from.search ?? ""}` : "/communities");
      const state = isInviteLink ? { fromGateInvite: true } : undefined;
      queueMicrotask(() => nav(target, { replace: true, state }));
    } catch (err: any) {
      const msg = err?.response?.data?.error;
      if (msg) {
        setError(msg);
      } else {
        setError("Não foi possível entrar. Verifique o código e tente novamente.");
      }
    } finally {
      setBusy(null);
    }
  }

  const hasCommunities = communities.length > 0;
  const hasUserPosition = userLat != null && userLng != null;

  async function onUseLocation() {
    if (!navigator.geolocation) {
      setNearbyError("Seu navegador não suporta geolocalização. Defina sua localização no mapa.");
      setLocationDenied(true);
      return;
    }
    setNearbyError(null);
    setNearbyLocationLoading(true);
    setLocationDenied(false);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 300000,
        });
      });
      setUserLat(position.coords.latitude);
      setUserLng(position.coords.longitude);
      setLocationObtainedFromBrowser(true);
      setShowMapPicker(true);
    } catch (err: unknown) {
      const code = err && typeof err === "object" && "code" in err ? (err as { code: number }).code : null;
      if (code === 1) {
        setNearbyError("Localização não autorizada. Defina sua localização no mapa abaixo.");
      } else {
        setNearbyError("Não foi possível usar sua localização. Defina no mapa abaixo.");
      }
      setLocationDenied(true);
      setShowMapPicker(true);
    } finally {
      setNearbyLocationLoading(false);
    }
  }

  function onMapPositionChange(lat: number, lng: number) {
    setUserLat(lat);
    setUserLng(lng);
    setLocationObtainedFromBrowser(false);
  }

  async function onSearchNearby(e: FormEvent) {
    e.preventDefault();
    if (userLat == null || userLng == null) return;
    setNearbyError(null);
    setNearbyLoading(true);
    setHasSearchedNearby(true);
    try {
      const list = await CondominiumService.getNearbyCommunities(userLat, userLng, radiusKm);
      setNearbyList(list);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setNearbyError(msg ?? "Não foi possível buscar comunidades próximas.");
      setNearbyList([]);
    } finally {
      setNearbyLoading(false);
    }
  }

  async function onRequestAccessCode(communityId: number) {
    setError(null);
    setRequestBusy(communityId);
    try {
      await CondominiumService.requestAccessCode(communityId);
      setSuccessMessage("Solicitação enviada. O administrador da comunidade pode liberar o código.");
      setRequestedCommunityIds((prev) => new Set(prev).add(communityId));
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      if (msg) setError(msg);
      else setError("Não foi possível enviar a solicitação.");
    } finally {
      setRequestBusy(null);
    }
  }

  return (
    <div className="min-h-screen bg-bg pb-24">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <div className="text-2xl font-semibold">Entrar na comunidade</div>
            <div className="mt-1 text-sm text-muted">
              Para manter a confiança e exclusividade, você entra por convite (código de acesso).
            </div>
          </div>
          {!hasCommunities ? (
            <Button
              variant="ghost"
              size="md"
              onClick={() => { logout(); nav("/", { replace: true }); }}
              className="flex-shrink-0 whitespace-nowrap"
            >
              Sair da conta
            </Button>
          ) : null}
        </div>

        {isLoading ? (
          <div className="text-sm text-muted">Carregando...</div>
        ) : null}

        {gateMessage ? (
          <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
            {gateMessage}
          </div>
        ) : null}

        {error ? (
          <div className="mb-4 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
            {error}
          </div>
        ) : null}
        {successMessage ? (
          <div className="mb-4 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary-strong">
            {successMessage}
          </div>
        ) : null}

        <div className="flex max-w-sm flex-col gap-4">
          <Card>
            <div className="mb-3 text-sm font-semibold">Tenho um código</div>
            <form className="space-y-3" onSubmit={onJoin}>
              <Input
                label="Código de acesso"
                placeholder="Ex.: A1B2C3D4"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                required
              />
              <Button className="w-full" disabled={busy !== null}>
                {busy === "join" ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          </Card>

          <Card>
            <div className="mb-3 text-sm font-semibold">Comunidades próximas a você</div>
            <p className="mb-3 text-xs text-muted">
              Use sua localização atual ou marque no mapa; depois escolha o raio e busque.
            </p>
            <Button
              type="button"
              variant="primary"
              className="mb-2 w-full"
              disabled={nearbyLoading || nearbyLocationLoading}
              onClick={onUseLocation}
            >
              {nearbyLocationLoading ? "Obtendo localização..." : "Usar minha localização"}
            </Button>
            <div className="mb-3 flex items-center gap-2">
              <span className="text-xs text-muted">ou</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-text"
                onClick={() => setShowMapPicker(true)}
              >
                Marcar no mapa
              </Button>
            </div>
            {locationObtainedFromBrowser && userLat != null && userLng != null && (
              <p className="mb-2 text-sm font-medium text-emerald-600 dark:text-emerald-400" role="status">
                Localização obtida com sucesso. Confira no mapa abaixo.
              </p>
            )}
            {showMapPicker && (
              <>
                {locationDenied && (
                  <p className="mb-2 text-xs text-muted">
                    Defina sua localização no mapa (arraste o pin ou clique).
                  </p>
                )}
                <LocationMapPicker
                  initialPosition={
                    userLat != null && userLng != null ? [userLat, userLng] : null
                  }
                  onPositionChange={onMapPositionChange}
                  height={220}
                />
              </>
            )}
            {hasUserPosition && (
              <form className="mt-3 space-y-3" onSubmit={onSearchNearby}>
                <div>
                  <label className="mb-1 block text-sm font-medium text-text">Raio de busca</label>
                  <div className="flex flex-wrap gap-2">
                    {RADIUS_OPTIONS_KM.map((km) => (
                      <button
                        key={km}
                        type="button"
                        onClick={() => setRadiusKm(km)}
                        className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                          radiusKm === km
                            ? "border-primary bg-primary/15 text-primary-strong"
                            : "border-border bg-surface/50 text-text hover:bg-surface"
                        }`}
                      >
                        {km} km
                      </button>
                    ))}
                  </div>
                </div>
                <Button
                  type="submit"
                  variant="ghost"
                  className="w-full"
                  disabled={nearbyLoading || nearbyLocationLoading}
                >
                  {nearbyLoading ? "Buscando..." : "Buscar comunidades"}
                </Button>
              </form>
            )}
            {nearbyError ? (
              <p className="mt-2 text-xs text-danger">{nearbyError}</p>
            ) : null}
            {nearbyList.length > 0 ? (
              <ul className="mt-4 space-y-2">
                {nearbyList.map((c) => {
                  const requested = requestedCommunityIds.has(c.id);
                  const isBusy = requestBusy === c.id;
                  return (
                    <li
                      key={c.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-black/10 bg-black/5 px-3 py-2 dark:border-white/10 dark:bg-white/5"
                    >
                      <div>
                        <span className="text-sm font-medium">{c.name}</span>
                        {c.distanceKm != null && (
                          <span className="ml-2 text-xs text-muted">
                            {c.distanceKm < 1
                              ? `${Math.round(c.distanceKm * 1000)} m`
                              : `${c.distanceKm.toFixed(1).replace(".", ",")} km`}
                          </span>
                        )}
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        disabled={requested || isBusy}
                        onClick={() => onRequestAccessCode(c.id)}
                      >
                        {requested ? "Solicitação enviada" : isBusy ? "Enviando..." : "Solicitar código"}
                      </Button>
                    </li>
                  );
                })}
              </ul>
            ) : hasSearchedNearby && !nearbyLoading && nearbyList.length === 0 && !nearbyError ? (
              <p className="mt-2 text-xs text-muted">Nenhuma comunidade pública neste raio.</p>
            ) : null}
          </Card>

          <Card>
            <p className="mb-3 text-sm text-muted">
              Quer criar uma nova comunidade? Você será o administrador inicial.
            </p>
            <Link to="/communities/new">
              <Button type="button" variant="ghost" className="w-full">
                Criar comunidade
              </Button>
            </Link>
          </Card>
          {communities.length > 0 ? (
            <p className="text-center text-sm text-muted">
              <Link to="/communities" className="font-medium text-accent-strong hover:underline">
                Voltar para Minhas comunidades
              </Link>
            </p>
          ) : null}
        </div>
      </div>
      {hasCommunities ? <BottomNav /> : null}
    </div>
  );
}

