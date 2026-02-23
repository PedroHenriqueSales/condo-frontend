import { useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useCondominium } from "../hooks/useCondominium";
import type { CommunityResponse } from "../services/contracts";
import { AdDetail } from "../pages/AdDetail";
import { CommunityDetail } from "../pages/CommunityDetail";
import { CommunityAdmin } from "../pages/CommunityAdmin";
import { CondominiumGate } from "../pages/CondominiumGate";
import { CreateAd } from "../pages/CreateAd";
import { CreateCommunity } from "../pages/CreateCommunity";
import { EditAd } from "../pages/EditAd";
import { Feed } from "../pages/Feed";
import { ForgotPassword } from "../pages/ForgotPassword";
import { Login } from "../pages/Login";
import { MyAccount } from "../pages/MyAccount";
import { MyAds } from "../pages/MyAds";
import { MyCommunities } from "../pages/MyCommunities";
import { Register } from "../pages/Register";
import { ResetPassword } from "../pages/ResetPassword";
import { VerifyEmail } from "../pages/VerifyEmail";
import * as AuthService from "../services/auth.service";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { token, emailVerified } = useAuth();
  const location = useLocation();
  const [resendLoading, setResendLoading] = useState(false);
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  const showUnverifiedBanner = emailVerified === false;
  return (
    <>
      {showUnverifiedBanner && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2 text-sm text-amber-800 dark:text-amber-200 flex flex-wrap items-center justify-center gap-2">
          <span>Confirme seu email para ativar sua conta.</span>
          <button
            type="button"
            className="font-medium underline hover:no-underline disabled:opacity-60"
            disabled={resendLoading}
            onClick={() => {
              setResendLoading(true);
              AuthService.resendVerification()
                .then(() => {})
                .catch(() => {})
                .finally(() => setResendLoading(false));
            }}
          >
            {resendLoading ? "Enviando..." : "Reenviar verificação"}
          </button>
        </div>
      )}
      {children}
    </>
  );
}

function RequireCommunity({ children }: { children: React.ReactNode }) {
  const { communities, activeCommunityId } = useCondominium();
  const location = useLocation();
  if (!communities.length || !activeCommunityId) {
    return <Navigate to="/gate" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}

function IndexRedirect() {
  const nav = useNavigate();
  const { token } = useAuth();
  const { refresh, setActiveCommunityId } = useCondominium();
  const [list, setList] = useState<CommunityResponse[] | null>(null);

  useEffect(() => {
    if (!token) return;
    refresh().then(setList);
  }, [token, refresh]);

  useEffect(() => {
    if (list === null) return;
    if (list.length === 0) {
      nav("/gate", { replace: true });
    } else if (list.length === 1) {
      setActiveCommunityId(list[0].id);
      nav("/feed", { replace: true });
    } else {
      nav("/communities", { replace: true });
    }
  }, [list, nav, setActiveCommunityId]);

  if (!token) return <Navigate to="/login" replace />;
  if (list === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <span className="text-sm text-muted">Carregando...</span>
      </div>
    );
  }
  return null;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<IndexRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/gate" element={<RequireAuth><CondominiumGate /></RequireAuth>} />
      <Route path="/communities/new" element={<RequireAuth><CreateCommunity /></RequireAuth>} />
      <Route path="/feed" element={<RequireAuth><RequireCommunity><Feed /></RequireCommunity></RequireAuth>} />
      <Route path="/ads/new" element={<RequireAuth><RequireCommunity><CreateAd /></RequireCommunity></RequireAuth>} />
      <Route path="/ads/:id" element={<RequireAuth><RequireCommunity><AdDetail /></RequireCommunity></RequireAuth>} />
      <Route path="/ads/:id/edit" element={<RequireAuth><RequireCommunity><EditAd /></RequireCommunity></RequireAuth>} />
      <Route path="/my-ads" element={<RequireAuth><RequireCommunity><MyAds /></RequireCommunity></RequireAuth>} />
      <Route path="/communities" element={<RequireAuth><RequireCommunity><MyCommunities /></RequireCommunity></RequireAuth>} />
      <Route path="/communities/:id" element={<RequireAuth><RequireCommunity><CommunityDetail /></RequireCommunity></RequireAuth>} />
      <Route path="/communities/:id/admin" element={<RequireAuth><RequireCommunity><CommunityAdmin /></RequireCommunity></RequireAuth>} />
      <Route path="/my-account" element={<RequireAuth><RequireCommunity><MyAccount /></RequireCommunity></RequireAuth>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
