import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Navbar } from "../components/Navbar";
import type { AdResponse } from "../services/contracts";
import { AdTypeLabels } from "../services/contracts";
import * as AdsService from "../services/ads.service";

export function MyAds() {
  const [items, setItems] = useState<AdResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    setLoading(true);
    try {
      const res = await AdsService.listMyAds({ page: 0, size: 50 });
      setItems(res.content);
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Falha ao carregar seus anúncios.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onClose(adId: number) {
    try {
      await AdsService.closeAd(adId);
      await load();
    } catch (err: any) {
      alert(err?.response?.data?.error ?? "Falha ao encerrar anúncio.");
    }
  }

  return (
    <div className="min-h-screen bg-bg pb-20">
      <Navbar />
      <div className="mx-auto max-w-5xl px-4 py-6">
        <div className="mb-4 text-2xl font-semibold">Meus anúncios</div>

        {loading ? <div className="text-sm text-muted">Carregando...</div> : null}
        {error ? <div className="text-sm text-danger">{error}</div> : null}

        <div className="mt-4 grid gap-3">
          {items.map((ad) => (
            <Card key={ad.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">{ad.title}</div>
                  <div className="mt-1 text-xs text-muted">
                    {AdTypeLabels[ad.type]} • {ad.status === "ACTIVE" ? "Ativo" : "Encerrado"}
                  </div>
                </div>
                <Badge tone={ad.status === "ACTIVE" ? "primary" : "neutral"}>
                  {ad.status}
                </Badge>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => alert("Editar: em breve")}
                >
                  Editar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => alert("Pausar: em breve")}
                >
                  Pausar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => alert("Remover: em breve")}
                >
                  Remover
                </Button>
                {ad.status === "ACTIVE" ? (
                  <Button
                    variant="danger"
                    size="sm"
                    type="button"
                    onClick={() => onClose(ad.id)}
                  >
                    Encerrar
                  </Button>
                ) : null}
              </div>
            </Card>
          ))}

          {!loading && items.length === 0 ? (
            <div className="rounded-2xl border border-border bg-surface p-6 text-center text-sm text-muted shadow-soft">
              Você ainda não criou anúncios.
            </div>
          ) : null}
        </div>
      </div>

      <Link
        to="/ads/new"
        aria-label="Criar anúncio"
        className="fixed bottom-6 right-6 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg transition hover:bg-primary-strong active:scale-95 sm:bottom-8 sm:right-8 sm:h-16 sm:w-16"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0)" }}
      >
        <span className="text-2xl font-light leading-none sm:text-3xl">+</span>
      </Link>
    </div>
  );
}

