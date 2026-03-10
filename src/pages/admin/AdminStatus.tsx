import { useEffect, useState } from "react";
import * as AdminService from "../../services/admin.service";

function StatusCard({
  title,
  status,
  details,
}: {
  title: string;
  status: string;
  details?: React.ReactNode;
}) {
  const statusColor =
    status === "ok"
      ? "border-green-500/50 bg-green-50 dark:bg-green-950/20 dark:border-green-500/30"
      : status === "building"
        ? "border-amber-500/50 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-500/30"
        : status === "n/a" || status === "unknown"
          ? "border-border bg-surface/50"
          : "border-red-500/50 bg-red-50 dark:bg-red-950/20 dark:border-red-500/30";

  return (
    <div className={`rounded-xl border p-4 ${statusColor}`}>
      <h3 className="font-medium text-fg">{title}</h3>
      <p className="mt-1 text-sm capitalize text-fg">{status}</p>
      {details && <div className="mt-2 text-sm text-muted">{details}</div>}
    </div>
  );
}

export function AdminStatus() {
  const [status, setStatus] = useState<AdminStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    AdminService.getAdminStatus()
      .then(setStatus)
      .catch(() => setError("Falha ao carregar status."));
  }, []);

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200">
        {error}
      </div>
    );
  }

  if (!status) {
    return (
      <div className="flex items-center justify-center py-12">
        <span className="text-muted">Carregando...</span>
      </div>
    );
  }

  const vercel = status.vercel as { status: string; state?: string; message?: string };
  const railway = status.railway as { status: string; message?: string; code?: number };

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-fg">Status dos serviços</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatusCard
          title="Backend"
          status={status.backend}
          details={status.backendDetails && <span>Detalhe: {status.backendDetails}</span>}
        />
        <StatusCard
          title="Frontend (Vercel)"
          status={vercel.status}
          details={vercel.state ? <>Estado: {vercel.state}</> : vercel.message}
        />
        <StatusCard
          title="Railway"
          status={railway.status}
          details={railway.message}
        />
      </div>
      <p className="mt-4 text-sm text-muted">
        Configure VERCEL_TOKEN, VERCEL_PROJECT_ID e RAILWAY_STATUS_URL no backend para verificar Vercel e Railway.
      </p>
    </div>
  );
}

type AdminStatusResponse = AdminService.AdminStatusResponse;
