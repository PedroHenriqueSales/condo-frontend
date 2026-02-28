import { api } from "./api";
import type {
  CommunityResponse,
  CreateCommunityRequest,
  JoinCommunityRequest,
  JoinRequestResponse,
  UpdateCommunityRequest,
} from "./contracts";

export async function listMyCommunities(): Promise<CommunityResponse[]> {
  const { data } = await api.get<CommunityResponse[]>("/communities");
  return data;
}

export async function listAdminCommunities(): Promise<CommunityResponse[]> {
  const { data } = await api.get<CommunityResponse[]>("/communities/admin");
  return data;
}

export async function createCommunity(
  payload: CreateCommunityRequest
): Promise<CommunityResponse> {
  const { data } = await api.post<CommunityResponse>("/communities", payload);
  return data;
}

export async function joinCommunity(
  payload: JoinCommunityRequest
): Promise<CommunityResponse> {
  const { data } = await api.post<CommunityResponse>("/communities/join", payload);
  return data;
}

export async function getCommunityById(id: number): Promise<CommunityResponse> {
  const { data } = await api.get<CommunityResponse>(`/communities/${id}`);
  return data;
}

export async function leaveCommunity(communityId: number): Promise<void> {
  await api.delete(`/communities/${communityId}/leave`);
}

export async function getCommunityJoinRequests(
  communityId: number
): Promise<JoinRequestResponse[]> {
  const { data } = await api.get<JoinRequestResponse[]>(
    `/communities/${communityId}/admin/requests`
  );
  return data;
}

export async function approveJoinRequest(
  communityId: number,
  requestId: number
): Promise<void> {
  await api.post(
    `/communities/${communityId}/admin/requests/${requestId}/approve`
  );
}

export async function rejectJoinRequest(
  communityId: number,
  requestId: number
): Promise<void> {
  await api.post(
    `/communities/${communityId}/admin/requests/${requestId}/reject`
  );
}

export async function addCommunityAdmin(
  communityId: number,
  userId: number
): Promise<void> {
  await api.post(`/communities/${communityId}/admin/admins`, { userId });
}

export async function leaveAdminRole(communityId: number): Promise<void> {
  await api.delete(`/communities/${communityId}/admin/me`);
}

export async function removeMember(
  communityId: number,
  memberId: number
): Promise<void> {
  await api.delete(`/communities/${communityId}/admin/members/${memberId}`);
}

export async function updateCommunityName(
  communityId: number,
  payload: UpdateCommunityRequest
): Promise<CommunityResponse> {
  const { data } = await api.patch<CommunityResponse>(
    `/communities/${communityId}/admin`,
    payload
  );
  return data;
}

export async function regenerateAccessCode(
  communityId: number
): Promise<CommunityResponse> {
  const { data } = await api.post<CommunityResponse>(
    `/communities/${communityId}/admin/regenerate-access-code`
  );
  return data;
}

export async function deleteCommunity(communityId: number): Promise<void> {
  await api.delete(`/communities/${communityId}/admin`);
}

