/**
 * Gera URL do WhatsApp com mensagem pré-preenchida sobre o anúncio.
 */
export function buildContactUrl(whatsapp: string, adTitle: string): string {
  const digits = whatsapp.replace(/[^\d]/g, "");
  const message = `Olá! Vi seu anúncio "${adTitle}" no Aquidolado e tenho interesse.`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
