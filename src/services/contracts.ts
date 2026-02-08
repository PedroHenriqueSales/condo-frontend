// Contratos do backend ComuMinha (Spring Boot)
// Observação: os endpoints retornam Page<T> (Spring Data).

export type JwtToken = string;

export type AuthResponse = {
  token: JwtToken;
  type: "Bearer" | string;
  userId: number;
  email: string;
  name: string;
};

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
  whatsapp?: string;
  address?: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type CommunityResponse = {
  id: number;
  name: string;
  accessCode: string;
  createdAt: string; // Instant ISO
  createdById: number;
};

export type CreateCommunityRequest = {
  name: string;
};

export type JoinCommunityRequest = {
  accessCode: string;
};

// Backend enum: SALE_TRADE, RENT, SERVICE
export type AdType = "SALE_TRADE" | "RENT" | "SERVICE";

export type AdStatus = "ACTIVE" | "CLOSED";

export type AdResponse = {
  id: number;
  title: string;
  description: string | null;
  type: AdType;
  price: number | null;
  status: AdStatus;
  userId: number;
  userName: string;
  userWhatsapp: string | null;
  communityId: number;
  createdAt: string; // Instant ISO
};

export type CreateAdRequest = {
  title: string;
  description?: string;
  type: AdType;
  price?: number;
  communityId: number;
};

export type EventType =
  | "LOGIN"
  | "REGISTER"
  | "CREATE_AD"
  | "CONTACT_CLICK"
  | "REPORT_AD";

export type EventLogRequest = {
  eventType: EventType;
  communityId?: number;
};

export type ContactClickRequest = {
  adId: number;
  communityId: number;
};

export type ReportReason =
  | "INAPPROPRIATE_CONTENT"
  | "SPAM"
  | "FRAUD"
  | "WRONG_CATEGORY"
  | "ALREADY_SOLD"
  | "OTHER";

export type ReportRequest = {
  adId: number;
  reason: ReportReason;
};

export type Page<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number; // página atual (0-based)
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
};

export const AdTypeLabels: Record<AdType, string> = {
  SALE_TRADE: "Venda",
  RENT: "Aluguel",
  SERVICE: "Serviços",
};

