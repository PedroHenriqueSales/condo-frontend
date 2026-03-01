/**
 * Edge Middleware: para crawlers (WhatsApp, etc.) em /ads/:id retorna HTML com OG da primeira foto do anúncio.
 * Demais requests seguem para o SPA.
 */

const BOT_UA =
  /bot|crawler|spider|crawling|facebookexternalhit|Facebot|WhatsApp|Telegram|Slurp|Twitterbot|LinkedInBot|embedly|quora link preview|mediapartners-google|Pinterest|Googlebot|facebook/i;

function isCrawler(userAgent) {
  return !userAgent || BOT_UA.test(userAgent);
}

export default async function middleware(request) {
  const url = new URL(request.url);
  const match = url.pathname.match(/^\/ads\/(\d+)\/?$/);
  const ua = request.headers.get("user-agent") || "";

  if (match && isCrawler(ua)) {
    const adId = match[1];
    const apiUrl = `${url.origin}/api/og-ad?id=${adId}`;
    try {
      const res = await fetch(apiUrl);
      const html = await res.text();
      return new Response(html, {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    } catch (_) {
      // fallback: deixa seguir para o SPA (index.html com logo)
    }
  }

  // Pass-through: buscar a raiz (index.html do SPA) e devolver; o cliente continua em /ads/:id e o router resolve
  return fetch(new URL("/", request.url), {
    method: "GET",
    headers: request.headers,
  });
}

export const config = {
  matcher: ["/ads/:id*"],
};
