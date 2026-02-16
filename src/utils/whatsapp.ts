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
  const message = `Olá! Vi seu anúncio "${adTitle}"${valorTexto} no Aquidolado e tenho interesse.`;
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
  const message = `Olá! Achei seu número em uma recomendação no app Aquidolado para ${serviceType} e gostaria de entrar em contato.`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
