import { useEffect } from "react";
import { createPortal } from "react-dom";

type Props = {
  imageUrl: string;
  onClose: () => void;
};

export function ImageLightbox({ imageUrl, onClose }: Props) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Imagem ampliada"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 rounded-lg bg-white/10 p-2 text-white hover:bg-white/20"
        aria-label="Fechar"
      >
        ✕
      </button>
      <img
        src={imageUrl}
        alt=""
        className="max-h-full max-w-full object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );

  return createPortal(modalContent, document.body);
}
