/**
 * Edge Middleware: para crawlers (WhatsApp, etc.) em /ads/:id ou /ads/:id/og retorna HTML com OG.
 * /ads/:id/og em browser normal → redireciona para /ads/:id.
 * Demais requests seguem para o SPA.
 */

const BOT_UA =
  /bot|crawler|spider|crawling|facebookexternalhit|Facebot|WhatsApp|Telegram|Slurp|Twitterbot|LinkedInBot|embedly|quora link preview|mediapartners-google|Pinterest|Googlebot|facebook/i;

function isCrawler(userAgent) {
  return !userAgent || BOT_UA.test(userAgent);
}

/** Extrai o id do anúncio de /ads/38 ou /ads/38/ ou /ads/38/og */
function getAdIdFromPath(pathname) {
  const m = pathname.match(/^\/ads\/(\d+)(?:\/og)?\/?$/);
  return m ? m[1] : null;
}

export default async function middleware(request) {
  const url = new URL(request.url);
  const adId = getAdIdFromPath(url.pathname);
  const ua = request.headers.get("user-agent") || "";
  const isOgPath = url.pathname.includes("/og");

  if (adId && isCrawler(ua)) {
    const apiUrl = `${url.origin}/api/og-ad?id=${adId}`;
    try {
      const res = await fetch(apiUrl);
      const html = await res.text();
      return new Response(html, {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    } catch (_) {
      // fallback: segue para SPA
    }
  }

  // Acesso a /ads/38/og por usuário normal → redireciona para a página do anúncio
  if (adId && isOgPath) {
    return Response.redirect(new URL(`/ads/${adId}`, request.url), 302);
  }

  return fetch(new URL("/", request.url), {
    method: "GET",
    headers: request.headers,
  });
}

export const config = {
  matcher: ["/ads/:path*"],
};
