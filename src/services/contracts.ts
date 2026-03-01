/** Resposta de comunidade (lista e detalhe). Detalhe inclui createdByName, memberNames e members. */
export interface CommunityResponse {
  id: number;
  name: string;
  accessCode: string;
  isPrivate?: boolean;
  postalCode?: string;
  createdAt: string;
  createdById: number;
  createdByName?: string;
  memberNames?: string[];
  /** Para o usuário autenticado: é administrador desta comunidade? */
  isAdmin?: boolean;
  /** No detalhe: lista de membros com id (para "Tornar admin"). */
  members?: MemberSummary[];
  /** Ao entrar em comunidade privada: true = solicitação enviada, aguardando aprovação. */
  joinPending?: boolean;
  /** Quando o usuário é admin: ids dos administradores (para não mostrar "Tornar admin" para quem já é). */
  adminIds?: number[];
}

export interface MemberSummary {
  id: number;
  name: string;
}

export interface CreateCommunityRequest {
  name: string;
  isPrivate: boolean;
  postalCode: string;
}

export interface UpdateCommunityRequest {
  name: string;
  isPrivate?: boolean;
  postalCode?: string;
}

export interface JoinCommunityRequest {
  accessCode: string;
}

export interface JoinRequestResponse {
  id: number;
  userId: number;
  userName: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

// Auth
export interface AuthResponse {
  token: string;
  type?: string;
  userId: number;
  email: string;
  name: string;
  emailVerified?: boolean;
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
  acceptTerms: boolean;
  acceptPrivacy: boolean;
}

// Ads
export type AdType = "SALE_TRADE" | "RENT" | "SERVICE" | "DONATION" | "RECOMMENDATION";
export type AdStatus = "ACTIVE" | "PAUSED" | "CLOSED" | "REMOVED";

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
  /** Apenas quando type === RECOMMENDATION */
  recommendedContact?: string;
  serviceType?: string;
  averageRating?: number | null;
  ratingCount?: number;
  currentUserRating?: number | null;
  /** Preenchido quando suspenso automaticamente por denúncias */
  suspendedByReportsAt?: string | null;
}

// Denúncias
export type ReportReason =
  | "INAPPROPRIATE_CONTENT"
  | "SPAM"
  | "FRAUD"
  | "WRONG_CATEGORY"
  | "ALREADY_SOLD"
  | "OTHER";

export interface ReportRequest {
  adId: number;
  reason: ReportReason;
}

export const ReportReasonLabels: Record<ReportReason, string> = {
  INAPPROPRIATE_CONTENT: "Conteúdo inadequado",
  SPAM: "Spam",
  FRAUD: "Fraude",
  WRONG_CATEGORY: "Categoria errada",
  ALREADY_SOLD: "Já vendido/indisponível",
  OTHER: "Outro",
};

export interface CommentResponse {
  id: number;
  adId: number;
  userId: number;
  userName: string;
  text: string;
  createdAt: string;
  likeCount: number;
  currentUserLiked: boolean;
}

export interface CreateCommentRequest {
  text: string;
}

export interface CreateAdRequest {
  title: string;
  description?: string;
  type: AdType;
  price?: number;
  communityId: number;
  recommendedContact?: string;
  serviceType?: string;
}

export interface UpdateAdRequest {
  title: string;
  description?: string;
  type: AdType;
  price?: number;
  recommendedContact?: string;
  serviceType?: string;
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
  DONATION: "Doação",
  RECOMMENDATION: "Indicações",
};

// Users
export interface UserProfileResponse {
  id: number;
  email: string;
  name: string;
  whatsapp?: string;
  address?: string;
  emailVerified?: boolean;
}

export interface UpdateProfileRequest {
  name: string;
  whatsapp: string;
  address?: string;
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
