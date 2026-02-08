import { api } from "./api";
import type { AdResponse, AdType, CreateAdRequest, Page, UpdateAdRequest } from "./contracts";

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

export async function createAd(
  payload: CreateAdRequest,
  images?: File[]
): Promise<AdResponse> {
  const form = new FormData();
  form.append("ad", new Blob([JSON.stringify(payload)], { type: "application/json" }));
  if (images?.length) {
    for (const f of images) {
      form.append("images", f);
    }
  }
  const { data } = await api.post<AdResponse>("/ads", form);
  return data;
}

export async function updateAd(
  adId: number,
  payload: UpdateAdRequest,
  images?: File[]
): Promise<AdResponse> {
  const form = new FormData();
  form.append("ad", new Blob([JSON.stringify(payload)], { type: "application/json" }));
  if (images?.length) {
    for (const f of images) {
      form.append("images", f);
    }
  }
  const { data } = await api.put<AdResponse>(`/ads/${adId}`, form);
  return data;
}

export async function pauseAd(adId: number): Promise<AdResponse> {
  const { data } = await api.patch<AdResponse>(`/ads/${adId}/pause`);
  return data;
}

export async function unpauseAd(adId: number): Promise<AdResponse> {
  const { data } = await api.patch<AdResponse>(`/ads/${adId}/unpause`);
  return data;
}

export async function closeAd(adId: number): Promise<AdResponse> {
  const { data } = await api.patch<AdResponse>(`/ads/${adId}/close`);
  return data;
}

export async function deleteAd(adId: number): Promise<void> {
  await api.delete(`/ads/${adId}`);
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

