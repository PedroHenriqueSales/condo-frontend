import axios from "axios";

const TOKEN_KEY = "aquidolado.token";

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null) {
  if (!token) {
    localStorage.removeItem(TOKEN_KEY);
    return;
  }
  localStorage.setItem(TOKEN_KEY, token);
}

export const api = axios.create({
  baseURL: "/api",
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    const value = token.toLowerCase().startsWith("bearer ") ? token : `Bearer ${token}`;

    // Axios v1 pode usar AxiosHeaders (com .set). Garantimos compatibilidade.
    const headers: any = config.headers ?? {};
    if (typeof headers.set === "function") {
      headers.set("Authorization", value);
      config.headers = headers;
    } else {
      config.headers = { ...headers, Authorization: value };
    }
  }
  return config;
});

