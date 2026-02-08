import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import { CondominiumProvider } from "../context/CondominiumContext";
import { AppRoutes } from "./routes";
import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useCondominium } from "../hooks/useCondominium";

function Bootstrap() {
  const { token } = useAuth();
  const { refresh, clear } = useCondominium();

  useEffect(() => {
    if (!token) {
      clear();
      return;
    }
    // Carrega comunidades assim que o usuário autentica
    refresh().catch(() => {
      // Gate lida com os erros; aqui evitamos quebrar o render.
    });
  }, [token, refresh, clear]);

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

