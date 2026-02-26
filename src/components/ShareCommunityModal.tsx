import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { QRCodeSVG } from "qrcode.react";
import type { CommunityResponse } from "../services/contracts";
import { Button } from "./Button";
import { buildShareUrl, buildShareWhatsAppUrl, copyToClipboard } from "../utils/share";

type Props = {
  community: CommunityResponse;
  onClose: () => void;
};

export function ShareCommunityModal({ community, onClose }: Props) {
  const [copied, setCopied] = useState(false);

  const shareUrl = buildShareUrl(community.accessCode);
  const whatsappUrl = buildShareWhatsAppUrl(community.accessCode, community.name);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  async function handleCopy() {
    const ok = await copyToClipboard(
      `Entra na comunidade "${community.name}" no Aqui! Use o código: ${community.accessCode}\n\nOu acesse: ${shareUrl}`
    );
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleWhatsApp() {
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  }

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] overflow-y-auto overscroll-contain bg-black/50"
      style={{ WebkitOverflowScrolling: "touch" }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
    >
      <div className="flex min-h-[100dvh] items-start justify-center p-4 pb-[max(2rem,env(safe-area-inset-bottom))] sm:min-h-0 sm:items-center sm:py-8">
        <div
          className="w-full max-w-sm shrink-0 rounded-2xl border border-border bg-bg p-4 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
        <div className="mb-4 flex items-center justify-between">
          <h2 id="share-modal-title" className="text-lg font-semibold">
            Compartilhar comunidade
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted hover:bg-surface/60"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        <div className="mb-4 text-sm font-medium text-text">{community.name}</div>

        <div className="mb-4 flex flex-col items-center gap-3">
          <div className="rounded-xl border border-border bg-white p-2 sm:p-3">
            <QRCodeSVG
              value={shareUrl}
              size={140}
              level="M"
              includeMargin={false}
            />
          </div>
          <p className="text-center text-xs text-muted">
            Escaneie para entrar na comunidade
          </p>
        </div>

        <div className="mb-4 rounded-xl border border-border bg-surface/50 px-3 py-2">
          <div className="text-xs text-muted">Código de acesso</div>
          <div className="font-mono text-lg font-semibold tracking-wider">
            {community.accessCode}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button onClick={handleCopy} variant="ghost" className="w-full">
            {copied ? "Copiado!" : "Copiar código e link"}
          </Button>
          <Button onClick={handleWhatsApp} variant="accent" className="w-full">
            Enviar por WhatsApp
          </Button>
        </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
