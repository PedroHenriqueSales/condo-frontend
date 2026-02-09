/**
 * Resolve URL de imagem do backend.
 * Em homologação/produção (VITE_API_URL definida), paths relativos como
 * /uploads/ads/xxx.jpg precisam ser resolvidos para o domínio do backend.
 */
export function resolveImageUrl(url: string): string {
  if (!url || typeof url !== "string") return url;
  const base = import.meta.env.VITE_API_URL;
  if (base && url.startsWith("/")) {
    return `${base.replace(/\/$/, "")}${url}`;
  }
  return url;
}
