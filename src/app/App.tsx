import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import { CondominiumProvider } from "../context/CondominiumContext";
import { AppRoutes } from "./routes";
import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useCondominium } from "../hooks/useCondominium";

function Bootstrap() {
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
      }
    });
  }, [token, logout, refresh, clear]);

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

