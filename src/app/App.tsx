import { BrowserRouter, useNavigate } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import { CondominiumProvider } from "../context/CondominiumContext";
import { AppRoutes } from "./routes";
import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useCondominium } from "../hooks/useCondominium";

function Bootstrap() {
  const nav = useNavigate();
  const { token, logout } = useAuth();
  const { refresh, clear } = useCondominium();

  useEffect(() => {
    if (!token) {
      clear();
      return;
    }
    // Carrega comunidades assim que o usuário autentica
    refresh().catch((err: any) => {
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        logout();
        nav("/", { replace: true });
      }
    });
  }, [token, logout, refresh, clear, nav]);

  return <AppRoutes />;
}

export function App() {
  return (
    <AuthProvider>
      <CondominiumProvider>
        <BrowserRouter>
          <Bootstrap />
        </BrowserRouter>
      </CondominiumProvider>
    </AuthProvider>
  );
}

