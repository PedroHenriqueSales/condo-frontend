import { api, setStoredToken } from "./api";
import type { AuthResponse, LoginRequest, RegisterRequest } from "./contracts";

export async function login(payload: LoginRequest): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/login", payload);
  setStoredToken(data.token);
  return data;
}

export async function register(payload: RegisterRequest): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/register", payload);
  setStoredToken(data.token);
  return data;
}

export async function verifyEmail(token: string): Promise<void> {
  await api.post("/auth/verify-email", { token });
}

export async function resendVerification(): Promise<void> {
  // Timeout maior: o backend agenda o envio e responde rápido; manter 35s como fallback se o servidor ainda estiver sincrono
  await api.post("/auth/resend-verification", {}, { timeout: 35000 });
}

export async function forgotPassword(email: string): Promise<void> {
  await api.post("/auth/forgot-password", { email });
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  await api.post("/auth/reset-password", { token, newPassword });
}

export function logout() {
  setStoredToken(null);
}

