import { api } from "./api";
import type {
  AdResponse,
  AdType,
  CommentResponse,
  CreateAdRequest,
  CreateCommentRequest,
  Page,
  ReactionKind,
  UpdateAdRequest,
} from "./contracts";

export async function getAdsByType(params: {
  communityId: number;
  type?: AdType;
  types?: AdType[];
  search?: string;
  page?: number;
  size?: number;
}): Promise<Page<AdResponse>> {
  const queryParams: Record<string, string | number | string[] | undefined> = {
    communityId: params.communityId,
    search: params.search,
    page: params.page ?? 0,
    size: params.size ?? 20,
    sort: "createdAt,desc",
  };
  if (params.types != null && params.types.length > 0) {
    queryParams.types = params.types;
  } else if (params.type != null) {
    queryParams.type = params.type;
  }
  const { data } = await api.get<Page<AdResponse>>("/ads", {
    params: queryParams,
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

// Indicações: reações e comentários
export async function setReaction(adId: number, kind: ReactionKind): Promise<void> {
  await api.post(`/ads/${adId}/reaction`, { kind });
}

export async function removeReaction(adId: number): Promise<void> {
  await api.delete(`/ads/${adId}/reaction`);
}

export async function getComments(
  adId: number,
  params?: { page?: number; size?: number }
): Promise<Page<CommentResponse>> {
  const { data } = await api.get<Page<CommentResponse>>(`/ads/${adId}/comments`, {
    params: { page: params?.page ?? 0, size: params?.size ?? 50 },
  });
  return data;
}

export async function createComment(adId: number, payload: CreateCommentRequest): Promise<CommentResponse> {
  const { data } = await api.post<CommentResponse>(`/ads/${adId}/comments`, payload);
  return data;
}

export async function toggleCommentLike(adId: number, commentId: number): Promise<void> {
  await api.post(`/ads/${adId}/comments/${commentId}/like`);
}

export async function deleteComment(adId: number, commentId: number): Promise<void> {
  await api.delete(`/ads/${adId}/comments/${commentId}`);
}

