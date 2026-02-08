/**
 * Formata preço completo (ex.: R$ 12.500,00)
 */
export function formatPrice(value: number): string {
  return `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const meses = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

/**
 * Formata data de publicação (ISO string) para exibição relativa ou absoluta.
 * Ex.: "há 2 dias", "ontem", "25 jan"
 */
export function formatPublishedAt(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
    if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (60 * 1000));
      return diffMins <= 1 ? "agora" : `há ${diffMins} min`;
    }
    return diffHours === 1 ? "há 1 h" : `há ${diffHours} h`;
  }
  if (diffDays === 1) return "ontem";
  if (diffDays < 7) return `há ${diffDays} dias`;
  return `${d.getDate()} ${meses[d.getMonth()]}`;
}

/**
 * Formata preço compacto para listagens. Valores >= 1000 são abreviados (ex.: R$ 12,5k)
 */
export function formatPriceCompact(value: number): string {
  if (value >= 1_000_000) {
    const n = value / 1_000_000;
    return `R$ ${n % 1 === 0 ? n : n.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}M`;
  }
  if (value >= 1_000) {
    const n = value / 1_000;
    return `R$ ${n % 1 === 0 ? n : n.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}k`;
  }
  return formatPrice(value);
}
