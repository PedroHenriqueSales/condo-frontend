import { useEffect, useState } from "react";
import * as AdminService from "../../services/admin.service";

export function AdminCommunities() {
  const [page, setPage] = useState(0);
  const [data, setData] = useState<AdminService.PageResponse<AdminService.AdminCommunityListItem> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    AdminService.getAdminCommunities(page, 20)
      .then(setData)
      .catch(() => setError("Falha ao carregar comunidades."));
  }, [page]);

  const handleDelete = (id: number, name: string) => {
    if (!window.confirm(`Excluir a comunidade "${name}"? Esta ação não pode ser desfeita.`)) return;
    setDeletingId(id);
    AdminService.deleteAdminCommunity(id)
      .then(() =>
        setData((prev) =>
          prev
            ? {
                ...prev,
                content: prev.content.filter((c) => c.id !== id),
                totalElements: prev.totalElements - 1,
              }
            : null
        )
      )
      .catch(() => setError("Falha ao excluir."))
      .finally(() => setDeletingId(null));
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
  const privateCount = data.content.filter((c) => c.isPrivate).length;

  return (
    <div className="mx-auto max-w-5xl">
      {/* Cabeçalho centralizado do painel */}
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">Comunidades</h1>
        <p className="mt-1 text-sm text-muted">
          Visualização centralizada de todas as comunidades do sistema. Exclua apenas quando necessário.
        </p>
      </header>

      {/* Resumo em cards */}
      <div className="mb-8 flex flex-wrap justify-center gap-4">
        <div className="min-w-[140px] flex-1 rounded-2xl border border-border bg-surface/50 px-6 py-4 text-center shadow-sm">
          <div className="text-3xl font-bold tabular-nums text-fg">{data.totalElements}</div>
          <div className="mt-1 text-xs font-medium uppercase tracking-wider text-muted">
            Total de comunidades
          </div>
        </div>
        <div className="min-w-[140px] flex-1 rounded-2xl border border-border bg-surface/50 px-6 py-4 text-center shadow-sm">
          <div className="text-3xl font-bold tabular-nums text-fg">
            {data.content.reduce((acc, c) => acc + c.membersCount, 0)}
          </div>
          <div className="mt-1 text-xs font-medium uppercase tracking-wider text-muted">
            Membros (nesta página)
          </div>
        </div>
        <div className="min-w-[140px] flex-1 rounded-2xl border border-border bg-surface/50 px-6 py-4 text-center shadow-sm">
          <div className="text-3xl font-bold tabular-nums text-fg">{privateCount}</div>
          <div className="mt-1 text-xs font-medium uppercase tracking-wider text-muted">
            Privadas (nesta página)
          </div>
        </div>
      </div>

      {/* Tabela em painel */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border bg-surface/60 px-4 py-3 text-center">
          <span className="text-sm font-medium text-fg">Listagem de comunidades</span>
          <span className="ml-2 text-xs text-muted">
            Página {page + 1} de {totalPages}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-surface/40">
                <th className="px-4 py-3 font-semibold text-fg">Nome</th>
                <th className="px-4 py-3 font-semibold text-fg">Código de acesso</th>
                <th className="px-4 py-3 text-center font-semibold text-fg">Privada</th>
                <th className="px-4 py-3 text-center font-semibold text-fg">Membros</th>
                <th className="px-4 py-3 font-semibold text-fg">Criador</th>
                <th className="px-4 py-3 text-center font-semibold text-fg">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.content.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted">
                    Nenhuma comunidade nesta página.
                  </td>
                </tr>
              ) : (
                data.content.map((c, idx) => (
                  <tr
                    key={c.id}
                    className={idx % 2 === 0 ? "bg-card" : "bg-surface/20 transition-colors hover:bg-surface/40"}
                  >
                    <td className="px-4 py-3 font-medium text-fg">{c.name}</td>
                    <td className="px-4 py-3">
                      <code className="rounded bg-surface px-2 py-0.5 text-xs text-fg">{c.accessCode}</code>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          c.isPrivate
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
                            : "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200"
                        }`}
                      >
                        {c.isPrivate ? "Sim" : "Não"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center tabular-nums text-fg">{c.membersCount}</td>
                    <td className="max-w-[160px] truncate px-4 py-3 text-muted" title={c.createdByName ?? ""}>
                      {c.createdByName ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950/60"
                        disabled={deletingId === c.id}
                        onClick={() => handleDelete(c.id, c.name)}
                      >
                        {deletingId === c.id ? "Excluindo…" : "Excluir comunidade"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-surface disabled:opacity-50"
            disabled={page <= 0}
            onClick={() => setPage((p) => p - 1)}
          >
            ← Anterior
          </button>
          <span className="rounded-lg border border-border bg-surface/50 px-4 py-2 text-sm text-muted">
            {page + 1} / {totalPages}
          </span>
          <button
            type="button"
            className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-surface disabled:opacity-50"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            Próxima →
          </button>
        </div>
      )}
    </div>
  );
}
