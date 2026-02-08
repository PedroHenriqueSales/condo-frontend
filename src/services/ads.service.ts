import { api } from "./api";
import type { AdResponse, AdType, CreateAdRequest, Page } from "./contracts";

export async function getAdsByType(params: {
  communityId: number;
  type: AdType;
  search?: string;
  page?: number;
  size?: number;
}): Promise<Page<AdResponse>> {
  const { data } = await api.get<Page<AdResponse>>("/ads", {
    params: {
      communityId: params.communityId,
      type: params.type,
      search: params.search,
      page: params.page ?? 0,
      size: params.size ?? 20,
    },
  });
  return data;
}

export async function getAdById(adId: number): Promise<AdResponse> {
  const { data } = await api.get<AdResponse>(`/ads/${adId}`);
  return data;
}

export async function createAd(payload: CreateAdRequest): Promise<AdResponse> {
  const { data } = await api.post<AdResponse>("/ads", payload);
  return data;
}

export async function closeAd(adId: number): Promise<AdResponse> {
  const { data } = await api.patch<AdResponse>(`/ads/${adId}/close`);
  return data;
}

export async function listMyAds(params?: {
  page?: number;
  size?: number;
}): Promise<Page<AdResponse>> {
  const { data } = await api.get<Page<AdResponse>>("/ads/me", {
    params: {
      page: params?.page ?? 0,
      size: params?.size ?? 20,
    },
  });
  return data;
}

