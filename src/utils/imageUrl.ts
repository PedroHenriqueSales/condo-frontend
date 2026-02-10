/**
 * Resolve URL de imagem para exibição. Em dev usa o proxy; em homolog/prod pode prefixar com a URL da API.
 */
export function resolveImageUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const base = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL.replace(/\/$/, "")}`
    : "";
  return base ? `${base}${url.startsWith("/") ? url : `/${url}`}` : url;
}
