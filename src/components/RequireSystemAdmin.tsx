import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import * as UsersService from "../services/users.service";

declare global {
  interface Window {
    Capacitor?: unknown;
  }
}

/**
 * Guard para rotas do painel admin. Exige usuário autenticado e systemAdmin.
 * Em build com VITE_ENABLE_ADMIN_PANEL=false ou em app nativo (Capacitor), redireciona.
 */
export function RequireSystemAdmin({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const location = useLocation();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    if (!token) {
      setAllowed(false);
      return;
    }
    if (import.meta.env.VITE_ENABLE_ADMIN_PANEL === "false") {
      setAllowed(false);
      return;
    }
    if (typeof window !== "undefined" && window.Capacitor) {
      setAllowed(false);
      return;
    }
    UsersService.getProfile()
      .then((profile) => setAllowed(profile.systemAdmin === true))
      .catch(() => setAllowed(false));
  }, [token]);

  if (!token) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  if (allowed === false) {
    return <Navigate to="/" replace />;
  }
  if (allowed === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <span className="text-sm text-muted">Verificando acesso...</span>
      </div>
    );
  }
  return <>{children}</>;
}
