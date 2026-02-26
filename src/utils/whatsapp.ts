/** Placeholder e exemplo aceitos em campos de WhatsApp (10 ou 11 dígitos). */
export const WHATSAPP_PLACEHOLDER = "Ex.: (11) 99999-9999";

/** Mensagem de erro quando o número é inválido (use junto com o placeholder). */
export const WHATSAPP_VALIDATION_ERROR =
  "Use 10 ou 11 dígitos. Ex.: (11) 99999-9999";

/**
 * Valida número de telefone/WhatsApp (apenas dígitos, 10 ou 11 caracteres — DDD + número).
 * Aceita qualquer formatação; retorna true se, ao extrair só os dígitos, houver 10 ou 11.
 */
export function isValidBrazilianPhone(value: string): boolean {
  const digits = value.replace(/[^\d]/g, "");
  return digits.length >= 10 && digits.length <= 11 && /^\d+$/.test(digits);
}

/**
 * Gera URL do WhatsApp com mensagem pré-preenchida sobre o anúncio.
 * Se price for informado, inclui o valor na mensagem.
 */
export function buildContactUrl(
  whatsapp: string,
  adTitle: string,
  price?: number | null
): string {
  const digits = whatsapp.replace(/[^\d]/g, "");
  const valorTexto =
    price != null && Number.isFinite(Number(price))
      ? ` (${formatPrice(Number(price))})`
      : "";
  const message = `Olá! Vi seu anúncio "${adTitle}"${valorTexto} no Aqui e tenho interesse.`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

function formatPrice(value: number): string {
  return `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Gera URL do WhatsApp para contato de uma indicação (recomendação).
 */
export function buildRecommendationContactUrl(
  whatsapp: string,
  serviceType: string,
  _title?: string
): string {
  const digits = whatsapp.replace(/[^\d]/g, "");
  const message = `Olá! Achei seu número em uma recomendação no app Aqui para ${serviceType} e gostaria de entrar em contato.`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
