import { apiBaseUrl } from "../config/env";

/**
 * Resolve URL de imagem para exibição. Em dev usa o proxy; em homolog/prod prefixa com a URL da API.
 */
export function resolveImageUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (!apiBaseUrl) return url;
  return `${apiBaseUrl}${url.startsWith("/") ? url : `/${url}`}`;
}
