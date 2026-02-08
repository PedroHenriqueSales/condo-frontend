/**
 * Utilitários para compartilhar comunidade (código de acesso).
 */

export function buildShareUrl(accessCode: string): string {
  const base = typeof window !== "undefined" ? window.location.origin : "";
  return `${base}/gate?code=${encodeURIComponent(accessCode)}`;
}

export function buildShareWhatsAppUrl(accessCode: string, communityName: string): string {
  const url = buildShareUrl(accessCode);
  const message = `Entra na nossa comunidade "${communityName}" no Aquidolado!\n\nUse o código: ${accessCode}\n\nOu acesse: ${url}`;
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
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
