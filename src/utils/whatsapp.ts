/**
 * Gera URL do WhatsApp com mensagem pré-preenchida sobre o anúncio.
 */
export function buildContactUrl(whatsapp: string, adTitle: string): string {
  const digits = whatsapp.replace(/[^\d]/g, "");
  const message = `Olá! Vi seu anúncio "${adTitle}" no Aquidolado e tenho interesse.`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
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
