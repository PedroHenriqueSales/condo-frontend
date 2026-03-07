import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { LocationMapPicker } from "../components/LocationMapPicker";
import { Navbar } from "../components/Navbar";
import { useCondominium } from "../hooks/useCondominium";
import * as CondominiumService from "../services/condominium.service";

export function CreateCommunity() {
  const nav = useNavigate();
  const { refresh, setActiveCommunityId } = useCondominium();
  const [name, setName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onUseLocation() {
    if (!navigator.geolocation) {
      setError("Seu navegador não suporta geolocalização. Defina a localização no mapa.");
      setLocationDenied(true);
      return;
    }
    setError(null);
    setLocationLoading(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000,
        });
      });
      setLatitude(position.coords.latitude);
      setLongitude(position.coords.longitude);
      setLocationDenied(false);
    } catch {
      setError("Não foi possível usar sua localização. Defina no mapa abaixo.");
      setLocationDenied(true);
    } finally {
      setLocationLoading(false);
    }
  }

  function onMapPositionChange(lat: number, lng: number) {
    setLatitude(lat);
    setLongitude(lng);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (latitude == null || longitude == null) {
      setError("Defina a localização da comunidade (use sua localização ou o mapa).");
      return;
    }
    setBusy(true);
    try {
      const c = await CondominiumService.createCommunity({
        name: name.trim(),
        isPrivate,
        latitude,
        longitude,
      });
      await refresh();
      setActiveCommunityId(c.id);
      nav("/communities", { replace: true });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg ?? "Falha ao criar comunidade.");
    } finally {
      setBusy(false);
    }
  }

  const canSubmit = name.trim() && latitude != null && longitude != null;

  return (
    <div className="min-h-screen bg-bg pb-24">
      <Navbar />
      <div className="mx-auto max-w-2xl px-4 py-6">
        <div className="mb-2 flex items-center gap-2 text-sm text-muted">
          <Link to="/gate" className="hover:text-accent-strong">
            Entrar na comunidade
          </Link>
          <span aria-hidden>/</span>
          <span className="text-text">Criar comunidade</span>
        </div>
        <h1 className="mb-6 text-2xl font-semibold">Criar comunidade</h1>

        <Card>
          <form className="space-y-4" onSubmit={onSubmit}>
            <Input
              label="Nome da comunidade"
              placeholder="Ex.: Condomínio Solar"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <div>
              <div className="mb-1 text-sm font-medium text-text">Tipo</div>
              <div className="flex gap-4">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="type"
                    checked={!isPrivate}
                    onChange={() => setIsPrivate(false)}
                    className="text-primary"
                  />
                  <span className="text-sm">Aberta</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="type"
                    checked={isPrivate}
                    onChange={() => setIsPrivate(true)}
                    className="text-primary"
                  />
                  <span className="text-sm">Privada</span>
                </label>
              </div>
              <p className="mt-1 text-xs text-muted">
                {isPrivate
                  ? "Na comunidade privada, o administrador precisa aprovar quem entra."
                  : "Na comunidade aberta, quem tem o código pode entrar diretamente."}
              </p>
            </div>

            <div>
              <div className="mb-2 text-sm font-medium text-text">Localização da comunidade</div>
              <p className="mb-2 text-xs text-muted">
                Use sua localização ou arraste o pin no mapa para definir.
              </p>
              <Button
                type="button"
                variant="ghost"
                className="mb-3 w-full"
                disabled={locationLoading}
                onClick={onUseLocation}
              >
                {locationLoading ? "Obtendo localização..." : "Usar minha localização"}
              </Button>
              {locationDenied && (
                <LocationMapPicker
                  initialPosition={
                    latitude != null && longitude != null ? [latitude, longitude] : null
                  }
                  onPositionChange={onMapPositionChange}
                  height={280}
                />
              )}
            </div>

            {error ? (
              <p className="text-sm text-danger">{error}</p>
            ) : null}

            <div className="flex gap-3">
              <Button type="submit" disabled={busy || !canSubmit} className="flex-1">
                {busy ? "Criando..." : "Criar comunidade"}
              </Button>
              <Link to="/gate">
                <Button type="button" variant="ghost">
                  Cancelar
                </Button>
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
