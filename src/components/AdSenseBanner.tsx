import { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

const AD_CLIENT = "ca-pub-1692856671662561";
const AD_SLOT = "8148821121";
const AD_LAYOUT_KEY = "-6t+ed+2i-1n-4w";

export function AdSenseBanner() {
  const adRef = useRef<HTMLModElement | null>(null);
  const pushed = useRef(false);

  const isProd = import.meta.env.PROD;

  useEffect(() => {
    if (!isProd) return;
    if (!adRef.current || pushed.current) return;
    try {
      if (typeof window === "undefined" || !window.adsbygoogle) {
        window.adsbygoogle = [];
      }
      (window.adsbygoogle as unknown[]).push({});
      pushed.current = true;
    } catch {
      // silencioso
    }
  }, [isProd]);

  if (!isProd) {
    return (
      <div
        className="flex min-h-[100px] items-center justify-center rounded-xl border border-dashed border-border bg-surface/30 text-xs text-muted"
        aria-hidden
      >
        [Anúncio — exibido em produção]
      </div>
    );
  }

  return (
    <div className="min-w-0 overflow-hidden rounded-xl border border-border bg-card/50 py-2">
      <ins
        ref={adRef as React.RefObject<HTMLModElement>}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-format="fluid"
        data-ad-layout-key={AD_LAYOUT_KEY}
        data-ad-client={AD_CLIENT}
        data-ad-slot={AD_SLOT}
      />
    </div>
  );
}
