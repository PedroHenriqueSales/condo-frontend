import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Navbar } from "../components/Navbar";
import { useCondominium } from "../hooks/useCondominium";
import type { AdResponse } from "../services/contracts";
import { AdTypeLabels } from "../services/contracts";
import * as AdsService from "../services/ads.service";
import * as MetricsService from "../services/metrics.service";

export function AdDetail() {
  const nav = useNavigate();
  const { id } = useParams();
  const { activeCommunityId } = useCondominium();

  const [ad, setAd] = useState<AdResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const adId = Number(id);
    if (!adId) {
      setError("Anúncio inválido.");
      setLoading(false);
      return;
    }
    setLoading(true);
    AdsService.getAdById(adId)
      .then(setAd)
      .catch((err: any) => setError(err?.response?.data?.error ?? "Falha ao carregar anúncio."))
      .finally(() => setLoading(false));
  }, [id]);

  async function onContact() {
    if (!ad || !activeCommunityId) return;

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
    window.open(`https://wa.me/${digits}`, "_blank", "noopener,noreferrer");

    try {
      await MetricsService.registerContactClick({ adId: ad.id, communityId: activeCommunityId });
    } catch {
      // ignore
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <Link className="text-sm font-medium text-primary-strong hover:underline" to="/feed">
            ← Voltar
          </Link>
        </div>

        {loading ? <div className="text-sm text-muted">Carregando...</div> : null}
        {error ? <div className="text-sm text-danger">{error}</div> : null}

        {ad ? (
          <Card>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xl font-semibold">{ad.title}</div>
                <div className="mt-1 text-sm text-muted">
                  por <span className="font-medium text-text">{ad.userName}</span>
                </div>
              </div>
              <Badge tone="primary">{AdTypeLabels[ad.type]}</Badge>
            </div>

            <div className="mt-4 whitespace-pre-wrap text-sm text-text">
              {ad.description ?? "Sem descrição."}
            </div>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <Button onClick={onContact}>Entrar em contato</Button>
              <Button variant="ghost" onClick={() => nav("/feed")}>
                Ver mais anúncios
              </Button>
            </div>
          </Card>
        ) : null}
      </div>
    </div>
  );
}

