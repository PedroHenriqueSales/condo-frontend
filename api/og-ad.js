/**
 * Serverless function: HTML com Open Graph para /ads/:id (WhatsApp, Facebook, etc.).
 * OBRIGATÓRIO no Vercel: BACKEND_API_URL = URL pública do backend (ex.: https://sua-api.railway.app).
 * Sem BACKEND_API_URL o preview de anúncios usa sempre a logo. FRONTEND_PUBLIC_ORIGIN opcional.
 */

function escapeHtml(s) {
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Garante que a URL do backend tenha esquema (https). */
function normalizeBackendUrl(url) {
  if (!url || typeof url !== "string") return "";
  const u = url.trim().replace(/\/$/, "");
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  return `https://${u}`;
}

export default async function handler(req, res) {
  const adId = req.query?.id;
  const backendUrl = normalizeBackendUrl(process.env.BACKEND_API_URL || process.env.VITE_API_URL_PRODUCTION);
  const frontendOrigin = (process.env.FRONTEND_PUBLIC_ORIGIN || "https://www.aquiapp.com.br").trim().replace(/\/$/, "");

  const fbAppId = process.env.FB_APP_ID || "";

  const logoOg = { imageUrl: `${frontendOrigin}/logo-og.png`, imageWidth: 512, imageHeight: 512 };
  if (!adId || !backendUrl) {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(renderOgHtml({
      title: "Aqui",
      description: "Anúncios entre membros da sua comunidade.",
      canonicalUrl: frontendOrigin + "/",
      fbAppId,
      ...logoOg,
    }));
    return;
  }

  try {
    const apiUrl = `${backendUrl}/api/public/ads/${adId}/og`;
    const response = await fetch(apiUrl);
    if (!response.ok) {
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.status(200).send(renderOgHtml({
        title: "Aqui",
        description: "Anúncios entre membros da sua comunidade.",
        canonicalUrl: frontendOrigin + "/ads/" + adId,
        fbAppId,
        ...logoOg,
      }));
      return;
    }
    const data = await response.json();
    const title = data?.title ? data.title : "Aqui";
    let imageUrl = `${frontendOrigin}/logo-og.png`;
    if (data?.imagePath) {
      let raw = data.imagePath.trim();
      // Backend pode ter devolvido URL absoluta com "/" na frente (ex.: "/https://..."); normaliza.
      if (raw.startsWith("/https://") || raw.startsWith("/http://")) {
        raw = raw.slice(1);
      }
      if (raw.startsWith("http://") || raw.startsWith("https://")) {
        imageUrl = raw;
      } else {
        const path = raw.startsWith("/") ? raw : `/${raw}`;
        imageUrl = `${backendUrl}${path}`;
      }
    }
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(renderOgHtml({
      title: title + " – Aqui",
      description: "Anúncio no Aqui – entre membros da sua comunidade.",
      imageUrl,
      canonicalUrl: frontendOrigin + "/ads/" + adId,
      fbAppId,
    }));
  } catch (e) {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(renderOgHtml({
      title: "Aqui",
      description: "Anúncios entre membros da sua comunidade.",
      canonicalUrl: frontendOrigin + "/ads/" + adId,
      fbAppId,
      ...logoOg,
    }));
  }
}

function renderOgHtml({ title, description, imageUrl, canonicalUrl = "", fbAppId = "", imageWidth = 1200, imageHeight = 630 }) {
  const ogUrlMeta = canonicalUrl ? `  <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />\n  ` : "";
  const fbAppIdMeta = fbAppId ? `  <meta property="fb:app_id" content="${escapeHtml(fbAppId)}" />\n  ` : "";
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta property="og:type" content="website" />
  ${ogUrlMeta}${fbAppIdMeta}<meta property="og:site_name" content="Aqui" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:image" content="${escapeHtml(imageUrl)}" />
  <meta property="og:image:width" content="${imageWidth}" />
  <meta property="og:image:height" content="${imageHeight}" />
  <meta property="og:locale" content="pt_BR" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${escapeHtml(imageUrl)}" />
  <title>${escapeHtml(title)}</title>
</head>
<body><p>${escapeHtml(description)}</p></body>
</html>`;
}
