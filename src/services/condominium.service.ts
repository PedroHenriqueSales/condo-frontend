import { api } from "./api";
import type {
  CommunityResponse,
  CreateCommunityRequest,
  JoinCommunityRequest,
} from "./contracts";

export async function listMyCommunities(): Promise<CommunityResponse[]> {
  const { data } = await api.get<CommunityResponse[]>("/communities");
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

