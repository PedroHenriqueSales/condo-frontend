import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as AdminService from "../../services/admin.service";

const TYPE_LABELS: Record<string, string> = {
  SALE_TRADE: "Venda",
  RENT: "Aluguel",
  SERVICE: "Serviço",
  DONATION: "Doação",
  RECOMMENDATION: "Indicação",
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Ativo",
  PAUSED: "Pausado",
  CLOSED: "Encerrado",
  REMOVED: "Removido",
};

export function AdminAds() {
  const [page, setPage] = useState(0);
  const [data, setData] = useState<AdminService.PageResponse<AdminService.AdminAdListItem> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);

  useEffect(() => {
    AdminService.getAdminAds(page, 20)
      .then(setData)
      .catch(() => setError("Falha ao carregar anúncios."));
  }, [page]);

  const handleRemove = (ad: AdminService.AdminAdListItem) => {
    if (ad.status === "REMOVED") return;
    if (!window.confirm(`Remover o anúncio "${ad.title}" (#${ad.id})?`)) return;
    setRemovingId(ad.id);
    AdminService.forceRemoveAd(ad.id)
      .then(() =>
        setData((prev) =>
          prev
            ? {
                ...prev,
                content: prev.content.map((a) =>
                  a.id === ad.id ? { ...a, status: "REMOVED" as AdminService.AdStatus } : a
                ),
              }
            : null
        )
      )
      .catch(() => setError("Falha ao remover."))
      .finally(() => setRemovingId(null));
  };

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200">
        {error}
      </div>
    );
  }
  if (!data) {
    return (
      <div className="flex justify-center py-16">
        <span className="text-muted">Carregando...</span>
      </div>
    );
  }

  const totalPages = data.totalPages || 1;
  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-fg">Anúncios</h1>
        <p className="mt-1 text-sm text-muted">Listagem global — remover anúncios irregular ou inadequados.</p>
      </header>
      <div className="mb-6 flex justify-center">
        <div className="rounded-2xl border border-border bg-surface/50 px-8 py-4 text-center">
          <div className="text-3xl font-bold text-fg">{data.totalElements}</div>
          <div className="text-xs uppercase text-muted">Total no sistema</div>
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-surface/80">
              <tr>
                <th className="px-4 py-3 font-semibold">ID</th>
                <th className="px-4 py-3 font-semibold">Título</th>
                <th className="px-4 py-3 font-semibold">Tipo</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Comunidade</th>
                <th className="px-4 py-3 text-center font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.content.map((a) => (
                <tr key={a.id} className={a.status === "REMOVED" ? "opacity-60" : "hover:bg-surface/30"}>
                  <td className="px-4 py-3 font-mono text-muted">#{a.id}</td>
                  <td className="max-w-[180px] truncate px-4 py-3 font-medium">{a.title}</td>
                  <td className="px-4 py-3 text-muted">{TYPE_LABELS[a.type] ?? a.type}</td>
                  <td className="px-4 py-3 text-xs">{STATUS_LABELS[a.status] ?? a.status}</td>
                  <td className="max-w-[120px] truncate px-4 py-3 text-muted">{a.communityName}</td>
                  <td className="px-4 py-3 text-center">
                    {a.status !== "REMOVED" && (
                      <button
                        type="button"
                        className="mr-2 rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-700 disabled:opacity-50 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300"
                        disabled={removingId === a.id}
                        onClick={() => handleRemove(a)}
                      >
                        {removingId === a.id ? "…" : "Remover"}
                      </button>
                    )}
                    <Link to={`/ads/${a.id}`} className="text-xs text-primary hover:underline">
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            className="rounded-lg border bg-card px-4 py-2 text-sm disabled:opacity-50"
            disabled={page <= 0}
            onClick={() => setPage((p) => p - 1)}
          >
            Anterior
          </button>
          <span className="py-2 text-sm text-muted">
            {page + 1} / {totalPages}
          </span>
          <button
            type="button"
            className="rounded-lg border bg-card px-4 py-2 text-sm disabled:opacity-50"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
}
