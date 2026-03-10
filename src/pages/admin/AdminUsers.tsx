import { useEffect, useState } from "react";
import * as AdminService from "../../services/admin.service";

export function AdminUsers() {
  const [page, setPage] = useState(0);
  const [data, setData] = useState<AdminService.PageResponse<AdminService.AdminUserListItem> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [detail, setDetail] = useState<AdminService.AdminUserDetailResponse | null>(null);

  useEffect(() => {
    AdminService.getAdminUsers(page, 20)
      .then(setData)
      .catch(() => setError("Falha ao carregar usuários."));
  }, [page]);

  useEffect(() => {
    if (detailId == null) {
      setDetail(null);
      return;
    }
    AdminService.getAdminUser(detailId)
      .then(setDetail)
      .catch(() => setDetail(null));
  }, [detailId]);

  const handlePatch = (id: number, patch: AdminService.AdminUserPatchRequest) => {
    AdminService.patchAdminUser(id, patch)
      .then((updated) => {
        setDetail(updated);
        setData((prev) =>
          prev
            ? {
                ...prev,
                content: prev.content.map((u) =>
                  u.id === id
                    ? {
                        ...u,
                        active: updated.active,
                        emailVerified: updated.emailVerified,
                      }
                    : u
                ),
              }
            : null
        );
      })
      .catch(() => {});
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
      <h1 className="mb-6 text-xl font-semibold text-fg">Usuários</h1>
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-surface/50">
            <tr>
              <th className="p-3 font-medium text-fg">Nome</th>
              <th className="p-3 font-medium text-fg">Email</th>
              <th className="p-3 font-medium text-fg">Ativo</th>
              <th className="p-3 font-medium text-fg">Email verificado</th>
              <th className="p-3 font-medium text-fg">Ações</th>
            </tr>
          </thead>
          <tbody>
            {data.content.map((u) => (
              <tr key={u.id} className="border-b border-border last:border-0">
                <td className="p-3 text-fg">{u.name}</td>
                <td className="p-3 text-muted">{u.email}</td>
                <td className="p-3">{u.active ? "Sim" : "Não"}</td>
                <td className="p-3">{u.emailVerified ? "Sim" : "Não"}</td>
                <td className="p-3">
                  <button
                    type="button"
                    className="text-primary hover:underline"
                    onClick={() => setDetailId(detailId === u.id ? null : u.id)}
                  >
                    {detailId === u.id ? "Ocultar" : "Detalhe"}
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
      {detail && (
        <div className="mt-6 rounded-xl border border-border bg-card p-4">
          <h2 className="mb-3 font-medium text-fg">Detalhe: {detail.name}</h2>
          <p className="text-sm text-muted">{detail.email}</p>
          <p className="text-sm text-muted">Comunidades: {detail.communityIds?.length ?? 0}</p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              className="rounded-lg border border-border bg-surface px-3 py-1 text-sm"
              onClick={() => handlePatch(detail.id, { active: !detail.active })}
            >
              {detail.active ? "Desativar" : "Ativar"}
            </button>
            <button
              type="button"
              className="rounded-lg border border-border bg-surface px-3 py-1 text-sm"
              onClick={() => handlePatch(detail.id, { emailVerified: !detail.emailVerified })}
            >
              {detail.emailVerified ? "Marcar email não verificado" : "Marcar email verificado"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
