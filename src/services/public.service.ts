import { api } from "./api";
import type { PublicFeaturesResponse } from "./contracts";

export async function getPublicFeatures(): Promise<PublicFeaturesResponse> {
  const { data } = await api.get<PublicFeaturesResponse>("/public/features");
  return data;
}
