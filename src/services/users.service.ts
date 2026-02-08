import { api } from "./api";
import type { UpdateProfileRequest, UserProfileResponse } from "./contracts";

export async function getProfile(): Promise<UserProfileResponse> {
  const { data } = await api.get<UserProfileResponse>("/users/me");
  return data;
}

export async function updateProfile(payload: UpdateProfileRequest): Promise<UserProfileResponse> {
  const { data } = await api.put<UserProfileResponse>("/users/me", payload);
  return data;
}
