import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useCondominium } from "../hooks/useCondominium";
import { AdDetail } from "../pages/AdDetail";
import { CommunityDetail } from "../pages/CommunityDetail";
import { CondominiumGate } from "../pages/CondominiumGate";
import { CreateAd } from "../pages/CreateAd";
import { EditAd } from "../pages/EditAd";
import { Feed } from "../pages/Feed";
import { Login } from "../pages/Login";
import { MyAccount } from "../pages/MyAccount";
import { MyAds } from "../pages/MyAds";
import { MyCommunities } from "../pages/MyCommunities";
import { Register } from "../pages/Register";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RequireCommunity({ children }: { children: React.ReactNode }) {
  const { communities, activeCommunityId } = useCondominium();
  if (!communities.length || !activeCommunityId) return <Navigate to="/gate" replace />;
  return <>{children}</>;
}

function IndexRedirect() {
  const { token } = useAuth();
  const { communities, activeCommunityId } = useCondominium();
  if (!token) return <Navigate to="/login" replace />;
  if (!communities.length || !activeCommunityId) return <Navigate to="/gate" replace />;
  return <Navigate to="/feed" replace />;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<IndexRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/gate" element={<RequireAuth><CondominiumGate /></RequireAuth>} />
      <Route path="/feed" element={<RequireAuth><RequireCommunity><Feed /></RequireCommunity></RequireAuth>} />
      <Route path="/ads/new" element={<RequireAuth><RequireCommunity><CreateAd /></RequireCommunity></RequireAuth>} />
      <Route path="/ads/:id" element={<RequireAuth><RequireCommunity><AdDetail /></RequireCommunity></RequireAuth>} />
      <Route path="/ads/:id/edit" element={<RequireAuth><RequireCommunity><EditAd /></RequireCommunity></RequireAuth>} />
      <Route path="/my-ads" element={<RequireAuth><RequireCommunity><MyAds /></RequireCommunity></RequireAuth>} />
      <Route path="/communities" element={<RequireAuth><RequireCommunity><MyCommunities /></RequireCommunity></RequireAuth>} />
      <Route path="/communities/:id" element={<RequireAuth><RequireCommunity><CommunityDetail /></RequireCommunity></RequireAuth>} />
      <Route path="/my-account" element={<RequireAuth><RequireCommunity><MyAccount /></RequireCommunity></RequireAuth>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
