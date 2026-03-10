import { api } from "./api";

export interface AdminStats {
  usersCount: number;
  communitiesCount: number;
  adsCount: number;
  reportsCount: number;
}

export interface AdminSettings {
  adsEnabled: boolean;
}

export interface AdminCommunityListItem {
  id: number;
  name: string;
  accessCode: string;
  isPrivate: boolean;
  membersCount: number;
  createdAt: string;
  createdById: number;
  createdByName?: string;
}

export interface MemberSummary {
  id: number;
  name: string;
}

export interface AdminUserListItem {
  id: number;
  name: string;
  email: string;
  active: boolean;
  emailVerified: boolean;
  termsAcceptedAt?: string;
}

export interface AdminUserDetailResponse {
  id: number;
  name: string;
  email: string;
  whatsapp?: string;
  active: boolean;
  emailVerified: boolean;
  systemAdmin: boolean;
  termsAcceptedAt?: string;
  communityIds: number[];
}

export interface AdminUserPatchRequest {
  active?: boolean;
  emailVerified?: boolean;
}

export type ReportReason =
  | "INAPPROPRIATE_CONTENT"
  | "SPAM"
  | "FRAUD"
  | "WRONG_CATEGORY"
  | "ALREADY_SOLD"
  | "OTHER";

export interface AdminReportListItem {
  id: number;
  adId: number;
  adTitle: string;
  reason: ReportReason;
  reporterUserId: number;
  reporterUserName: string;
  communityId: number;
  communityName: string;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export async function getAdminStats(): Promise<AdminStats> {
  const { data } = await api.get<AdminStats>("/admin/stats");
  return data;
}

export async function getAdminSettings(): Promise<AdminSettings> {
  const { data } = await api.get<AdminSettings>("/admin/settings");
  return data;
}

export async function patchAdminSettings(patch: Partial<AdminSettings>): Promise<AdminSettings> {
  const { data } = await api.patch<AdminSettings>("/admin/settings", patch);
  return data;
}

export async function getAdminCommunities(page = 0, size = 20): Promise<PageResponse<AdminCommunityListItem>> {
  const { data } = await api.get<PageResponse<AdminCommunityListItem>>("/admin/communities", {
    params: { page, size },
  });
  return data;
}

export async function getAdminCommunity(id: number): Promise<AdminCommunityListItem> {
  const { data } = await api.get<AdminCommunityListItem>(`/admin/communities/${id}`);
  return data;
}

export async function getAdminCommunityMembers(id: number): Promise<MemberSummary[]> {
  const { data } = await api.get<MemberSummary[]>(`/admin/communities/${id}/members`);
  return data;
}

export interface AdminCommunityMapItem {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  membersCount: number;
}

export async function getAdminCommunitiesMap(): Promise<AdminCommunityMapItem[]> {
  const { data } = await api.get<AdminCommunityMapItem[]>("/admin/communities/map");
  return data;
}

export async function deleteAdminCommunity(id: number): Promise<void> {
  await api.delete(`/admin/communities/${id}`);
}

export async function getAdminUsers(page = 0, size = 20): Promise<PageResponse<AdminUserListItem>> {
  const { data } = await api.get<PageResponse<AdminUserListItem>>("/admin/users", {
    params: { page, size },
  });
  return data;
}

export async function getAdminUser(id: number): Promise<AdminUserDetailResponse> {
  const { data } = await api.get<AdminUserDetailResponse>(`/admin/users/${id}`);
  return data;
}

export async function patchAdminUser(id: number, patch: AdminUserPatchRequest): Promise<AdminUserDetailResponse> {
  const { data } = await api.patch<AdminUserDetailResponse>(`/admin/users/${id}`, patch);
  return data;
}

export async function getAdminReports(page = 0, size = 20): Promise<PageResponse<AdminReportListItem>> {
  const { data } = await api.get<PageResponse<AdminReportListItem>>("/admin/reports", {
    params: { page, size },
  });
  return data;
}

export async function getAdminReportsByAd(adId: number): Promise<AdminReportListItem[]> {
  const { data } = await api.get<AdminReportListItem[]>(`/admin/ads/${adId}/reports`);
  return data;
}

export async function forceRemoveAd(adId: number): Promise<void> {
  await api.patch(`/admin/ads/${adId}/remove`);
}

export type AdType = "SALE_TRADE" | "RENT" | "SERVICE" | "DONATION" | "RECOMMENDATION";
export type AdStatus = "ACTIVE" | "PAUSED" | "CLOSED" | "REMOVED";

export interface AdminAdListItem {
  id: number;
  title: string;
  type: AdType;
  status: AdStatus;
  userId: number;
  userName: string;
  communityId: number;
  communityName: string;
  createdAt: string;
}

export async function getAdminAds(page = 0, size = 20): Promise<PageResponse<AdminAdListItem>> {
  const { data } = await api.get<PageResponse<AdminAdListItem>>("/admin/ads", {
    params: { page, size },
  });
  return data;
}

export interface AdminStatusResponse {
  backend: string;
  backendDetails?: string;
  vercel: { status: string; state?: string; message?: string };
  railway: { status: string; message?: string; code?: number };
}

export async function getAdminStatus(): Promise<AdminStatusResponse> {
  const { data } = await api.get<AdminStatusResponse>("/admin/status");
  return data;
}
