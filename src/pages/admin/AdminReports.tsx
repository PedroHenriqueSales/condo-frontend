import { useEffect, useState } from "react";
import * as AdminService from "../../services/admin.service";

const REASON_LABELS: Record<AdminService.ReportReason, string> = {
  INAPPROPRIATE_CONTENT: "Conteúdo inapropriado",
  SPAM: "Spam",
  FRAUD: "Fraude",
  WRONG_CATEGORY: "Categoria errada",
  ALREADY_SOLD: "Já vendido",
  OTHER: "Outro",
};

export function AdminReports() {
  const [page, setPage] = useState(0);
  const [data, setData] = useState<AdminService.PageResponse<AdminService.AdminReportListItem> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [removingAdId, setRemovingAdId] = useState<number | null>(null);

  useEffect(() => {
    AdminService.getAdminReports(page, 20)
      .then(setData)
      .catch(() => setError("Falha ao carregar denúncias."));
  }, [page]);

  const handleRemoveAd = (adId: number) => {
    if (!window.confirm("Remover este anúncio (status REMOVED)? O anúncio deixará de ser exibido.")) return;
    setRemovingAdId(adId);
    AdminService.forceRemoveAd(adId)
      .then(() =>
        setData((prev) =>
          prev
            ? {
                ...prev,
                content: prev.content.filter((r) => r.adId !== adId),
                totalElements: Math.max(0, prev.totalElements - 1),
              }
            : null
        )
      )
      .catch(() => {})
      .finally(() => setRemovingAdId(null));
  };

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200">
        {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-12">
        <span className="text-muted">Carregando...</span>
      </div>
    );
  }

  const totalPages = data.totalPages || 1;

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-fg">Denúncias</h1>
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-surface/50">
            <tr>
              <th className="p-3 font-medium text-fg">Anúncio</th>
              <th className="p-3 font-medium text-fg">Motivo</th>
              <th className="p-3 font-medium text-fg">Denunciante</th>
              <th className="p-3 font-medium text-fg">Comunidade</th>
              <th className="p-3 font-medium text-fg">Data</th>
              <th className="p-3 font-medium text-fg">Ações</th>
            </tr>
          </thead>
          <tbody>
            {data.content.map((r) => (
              <tr key={r.id} className="border-b border-border last:border-0">
                <td className="p-3 text-fg">
                  <span className="font-medium">#{r.adId}</span> {r.adTitle}
                </td>
                <td className="p-3 text-muted">{REASON_LABELS[r.reason] ?? r.reason}</td>
                <td className="p-3 text-muted">{r.reporterUserName}</td>
                <td className="p-3 text-muted">{r.communityName}</td>
                <td className="p-3 text-muted">{new Date(r.createdAt).toLocaleString("pt-BR")}</td>
                <td className="p-3">
                  <button
                    type="button"
                    className="text-red-600 hover:underline disabled:opacity-50 dark:text-red-400"
                    disabled={removingAdId === r.adId}
                    onClick={() => handleRemoveAd(r.adId)}
                  >
                    {removingAdId === r.adId ? "Removendo..." : "Remover anúncio"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            className="rounded-lg border border-border bg-card px-3 py-1 text-sm disabled:opacity-50"
            disabled={page <= 0}
            onClick={() => setPage((p) => p - 1)}
          >
            Anterior
          </button>
          <span className="text-sm text-muted">
            Página {page + 1} de {totalPages} ({data.totalElements} total)
          </span>
          <button
            type="button"
            className="rounded-lg border border-border bg-card px-3 py-1 text-sm disabled:opacity-50"
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
