/**
 * Variáveis de ambiente do frontend (build-time).
 * No Vercel use duas variáveis separadas e atribua cada uma a UM ambiente só:
 * - VITE_API_URL_PRODUCTION → apenas Production
 * - VITE_API_URL_PREVIEW → apenas Preview (homolog)
 * Assim cada deploy usa o valor correto.
 */

export type AppEnv = "production" | "homolog";

const raw = import.meta.env.VITE_APP_ENV as string | undefined;
const normalized = raw?.toLowerCase().trim();

/** Perfil atual: production ou homolog (default production). */
export const appEnv: AppEnv =
  normalized === "homolog" ? "homolog" : "production";

/** Se true, o app está em ambiente de homologação. */
export const isHomolog = appEnv === "homolog";

/** URL base da API (sem /api). Em Vercel vem de VITE_API_URL_PRODUCTION ou VITE_API_URL_PREVIEW conforme o ambiente do deploy. */
function getApiBaseUrl(): string {
  const prod = import.meta.env.VITE_API_URL_PRODUCTION as string | undefined;
  const preview = import.meta.env.VITE_API_URL_PREVIEW as string | undefined;
  const url = (prod || preview || "").trim();
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

/** URL base da API (sem /api). Vazia em dev (usa proxy). */
export const apiBaseUrl = getApiBaseUrl();

/** URL completa do prefixo da API (com /api). Em dev é "/api" (proxy). */
export const apiPrefix = apiBaseUrl ? `${apiBaseUrl}/api` : "/api";
