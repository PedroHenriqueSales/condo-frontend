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

const apiBaseUrl = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, "")}/api`
  : "/api";

export const api = axios.create({
  baseURL: apiBaseUrl,
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

const AUTH_STATE_KEY = "aquidolado.authState";

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    if (status === 401 || status === 403) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(AUTH_STATE_KEY);
      const path = window.location.pathname;
      if (path !== "/login" && path !== "/register") {
        window.location.replace("/login");
      }
    }
    return Promise.reject(err);
  }
);
