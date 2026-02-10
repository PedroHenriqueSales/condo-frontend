/** Resposta de comunidade (lista e detalhe). Detalhe inclui createdByName e memberNames. */
export interface CommunityResponse {
  id: number;
  name: string;
  accessCode: string;
  createdAt: string;
  createdById: number;
  createdByName?: string;
  memberNames?: string[];
}

export interface CreateCommunityRequest {
  name: string;
}

export interface JoinCommunityRequest {
  accessCode: string;
}

// Auth
export interface AuthResponse {
  token: string;
  type?: string;
  userId: number;
  email: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  whatsapp?: string;
  address?: string;
}

// Ads
export type AdType = "SALE_TRADE" | "RENT" | "SERVICE";
export type AdStatus = "ACTIVE" | "PAUSED" | "CLOSED";

export interface AdResponse {
  id: number;
  title: string;
  description?: string;
  type: AdType;
  price?: number;
  status: AdStatus;
  userId: number;
  userName?: string;
  userWhatsapp?: string;
  communityId: number;
  createdAt: string;
  imageUrls?: string[];
}

export interface CreateAdRequest {
  title: string;
  description?: string;
  type: AdType;
  price?: number;
  communityId: number;
}

export interface UpdateAdRequest {
  title: string;
  description?: string;
  type: AdType;
  price?: number;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  last?: boolean;
}

export const AdTypeLabels: Record<AdType, string> = {
  SALE_TRADE: "Venda",
  RENT: "Aluguel",
  SERVICE: "Serviços",
};

// Users
export interface UserProfileResponse {
  id: number;
  email: string;
  name: string;
  whatsapp?: string;
}

export interface UpdateProfileRequest {
  name: string;
  whatsapp?: string;
}

// Metrics / events
export interface ContactClickRequest {
  adId: number;
  communityId: number;
}

export type EventType = string;

export interface EventLogRequest {
  eventType: EventType;
  communityId?: number;
}
