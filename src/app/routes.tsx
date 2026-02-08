import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useCondominium } from "../hooks/useCondominium";
import { Login } from "../pages/Login";
import { Register } from "../pages/Register";
import { CondominiumGate } from "../pages/CondominiumGate";
import { Feed } from "../pages/Feed";
import { AdDetail } from "../pages/AdDetail";
import { CreateAd } from "../pages/CreateAd";
import { MyAds } from "../pages/MyAds";

function RequireAuth() {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function RequireCommunity() {
  const { communities, activeCommunityId, isLoading } = useCondominium();
  if (isLoading) return null;
  if (!communities.length) return <Navigate to="/gate" replace />;
  if (!activeCommunityId) return <Navigate to="/gate" replace />;
  return <Outlet />;
}

function IndexRedirect() {
  const { token } = useAuth();
  const { communities, activeCommunityId, isLoading } = useCondominium();

  if (!token) return <Navigate to="/login" replace />;
  if (isLoading) return null;
  if (!communities.length) return <Navigate to="/gate" replace />;
  if (!activeCommunityId) return <Navigate to="/gate" replace />;
  return <Navigate to="/feed" replace />;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<IndexRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<RequireAuth />}>
        <Route path="/gate" element={<CondominiumGate />} />

        <Route element={<RequireCommunity />}>
          <Route path="/feed" element={<Feed />} />
          <Route path="/ads/new" element={<CreateAd />} />
          <Route path="/ads/:id" element={<AdDetail />} />
          <Route path="/my-ads" element={<MyAds />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

