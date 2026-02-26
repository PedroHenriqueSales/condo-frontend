/**
 * Utilitários para compartilhar comunidade (código de acesso) e anúncios.
 */
import type { AdType } from "../services/contracts";
import { AdTypeLabels } from "../services/contracts";

export function buildShareUrl(accessCode: string): string {
  const base = typeof window !== "undefined" ? window.location.origin : "";
  return `${base}/gate?code=${encodeURIComponent(accessCode)}`;
}

export function buildShareWhatsAppUrl(accessCode: string, communityName: string): string {
  const url = buildShareUrl(accessCode);
  const message = `Entra na nossa comunidade "${communityName}" no Aqui!\n\nUse o código: ${accessCode}\n\nOu acesse: ${url}`;
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

export function buildAdShareUrl(adId: number): string {
  const base = typeof window !== "undefined" ? window.location.origin : "";
  return `${base}/ads/${adId}`;
}

export function buildAdShareWhatsAppUrl(ad: {
  id: number;
  title: string;
  type: AdType;
  price?: number;
  serviceType?: string;
}): string {
  const url = buildAdShareUrl(ad.id);
  const typeLabel = AdTypeLabels[ad.type];
  const priceText =
    ad.type === "RECOMMENDATION"
      ? `Indicação${ad.serviceType ? ` • ${ad.serviceType}` : ""}`
      : ad.type === "DONATION"
        ? "Doação"
        : ad.price != null
          ? `Preço: R$ ${ad.price.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          : "Valor a consultar";

  const message = `Olha esse anúncio no Aqui!\n\n${ad.title}\nTipo: ${typeLabel}\n${priceText}\n\n${url}`;
  const encodedMessage = encodeURIComponent(message);
  return `https://api.whatsapp.com/send?text=${encodedMessage}`;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}
