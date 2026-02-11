import { useEffect } from "react";
import { createPortal } from "react-dom";

type Props = {
  imageUrl: string;
  onClose: () => void;
};

export function ImageLightbox({ imageUrl, onClose }: Props) {
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  if (typeof document === "undefined") return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Imagem ampliada"
      style={{ zIndex: 9999 }}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-[10000] rounded-lg bg-white/10 p-2 text-white hover:bg-white/20 transition"
        aria-label="Fechar"
        style={{ zIndex: 10000 }}
      >
        ✕
      </button>
      <img
        src={imageUrl}
        alt=""
        className="max-h-full max-w-full cursor-pointer object-contain"
        onClick={onClose}
        onError={() => {
          console.error("Erro ao carregar imagem:", imageUrl);
        }}
      />
    </div>
  );

  return createPortal(modalContent, document.body);
}
