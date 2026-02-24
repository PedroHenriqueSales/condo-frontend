import logoIcon from "../assets/logo-icon.png";

/**
 * Placeholder exibido quando um anúncio não possui imagens.
 * Exibe apenas o ícone da logo (casas + coração), sem o texto.
 */
interface AdPlaceholderProps {
  className?: string;
  /** Tamanho compacto para cards em lista (Feed, MyAds) */
  compact?: boolean;
}

export function AdPlaceholder({ className = "", compact = false }: AdPlaceholderProps) {
  const size = className ? "" : compact ? "h-16 w-16" : "h-40 w-40";

  return (
    <div
      className={`flex flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface ${size} ${className}`.trim()}
    >
      <img
        src={logoIcon}
        alt=""
        className="h-full w-full object-contain bg-transparent p-2"
        aria-hidden
      />
    </div>
  );
}
