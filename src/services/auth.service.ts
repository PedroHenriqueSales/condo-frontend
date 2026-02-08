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

export function logout() {
  setStoredToken(null);
}

