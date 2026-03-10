import { useEffect, useState } from "react";
import * as AdminService from "../../services/admin.service";

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminService.AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    AdminService.getAdminStats()
      .then(setStats)
      .catch(() => setError("Falha ao carregar estatísticas."));
  }, []);

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200">
        {error}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center py-12">
        <span className="text-muted">Carregando...</span>
      </div>
    );
  }

  const cards = [
    { label: "Usuários", value: stats.usersCount },
    { label: "Comunidades", value: stats.communitiesCount },
    { label: "Anúncios", value: stats.adsCount },
    { label: "Denúncias", value: stats.reportsCount },
  ];

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-fg">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ label, value }) => (
          <div
            key={label}
            className="rounded-xl border border-border bg-card p-4 shadow-sm"
          >
            <p className="text-sm text-muted">{label}</p>
            <p className="mt-1 text-2xl font-semibold text-fg">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
