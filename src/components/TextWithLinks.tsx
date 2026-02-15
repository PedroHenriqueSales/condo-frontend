import React from "react";

/**
 * Regex para detectar URLs http e https no texto.
 * Captura o protocolo e o restante da URL até espaço ou fim.
 */
const URL_REGEX = /(https?:\/\/[^\s]+)/g;

/**
 * Remove pontuação final comum que não faz parte da URL (para o href).
 */
function trimTrailingPunctuation(url: string): string {
  return url.replace(/[.,;:!?)]+$/, "");
}

/** Número máximo de caracteres exibidos para uma URL; o restante é substituído por "…". */
const MAX_URL_DISPLAY_LENGTH = 40;

function abbreviateUrl(url: string, maxLen: number = MAX_URL_DISPLAY_LENGTH): string {
  const trimmed = trimTrailingPunctuation(url);
  if (trimmed.length <= maxLen) return url;
  return trimmed.slice(0, maxLen) + "…";
}

type Props = {
  /** Texto que pode conter URLs (http/https). */
  text: string;
  /** Classe CSS aplicada ao container. */
  className?: string;
  /** Se true, cliques em links não propagam (útil dentro de botões/cards clicáveis). */
  stopPropagation?: boolean;
};

/**
 * Renderiza texto convertendo URLs (http/https) em links clicáveis.
 * Mantém quebras de linha quando o container usa whitespace-pre-wrap.
 */
export function TextWithLinks({ text, className = "", stopPropagation }: Props) {
  if (!text.trim()) return null;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  const re = new RegExp(URL_REGEX.source, "g");
  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const rawUrl = match[1];
    const href = trimTrailingPunctuation(rawUrl);
    const displayText = abbreviateUrl(rawUrl);
    parts.push(
      <a
        key={match.index}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary-strong underline hover:opacity-80 break-all"
        onClick={stopPropagation ? (e) => e.stopPropagation() : undefined}
        title={href}
      >
        {displayText}
      </a>
    );
    lastIndex = re.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <span className={className}>{parts}</span>;
}
