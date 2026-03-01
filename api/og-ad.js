/**
 * Serverless function para retornar HTML com Open Graph para compartilhamento de anúncios (WhatsApp, etc.).
 * Chamada quando um crawler acessa /ads/:id (via middleware).
 * Variáveis Vercel: BACKEND_API_URL (ou VITE_API_URL_PRODUCTION), FRONTEND_PUBLIC_ORIGIN (opcional).
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

export default async function handler(req, res) {
  const adId = req.query?.id;
  const backendUrl = process.env.BACKEND_API_URL || process.env.VITE_API_URL_PRODUCTION;
  const frontendOrigin = process.env.FRONTEND_PUBLIC_ORIGIN || "https://www.aquiapp.com.br";

  const fbAppId = process.env.FB_APP_ID || "0";

  if (!adId || !backendUrl) {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(renderOgHtml({
      title: "Aqui",
      description: "Anúncios entre membros da sua comunidade.",
      imageUrl: `${frontendOrigin}/logo-icon.png`,
      canonicalUrl: frontendOrigin + "/",
      fbAppId,
    }));
    return;
  }

  try {
    const apiUrl = `${backendUrl.replace(/\/$/, "")}/api/public/ads/${adId}/og`;
    const response = await fetch(apiUrl);
    if (!response.ok) {
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.status(200).send(renderOgHtml({
        title: "Aqui",
        description: "Anúncios entre membros da sua comunidade.",
        imageUrl: `${frontendOrigin}/logo-icon.png`,
        canonicalUrl: frontendOrigin + "/ads/" + adId,
        fbAppId,
      }));
      return;
    }
    const data = await response.json();
    const title = data?.title ? data.title : "Aqui";
    let imageUrl = `${frontendOrigin}/logo-icon.png`;
    if (data?.imagePath) {
      const path = data.imagePath.startsWith("/") ? data.imagePath : `/${data.imagePath}`;
      imageUrl = `${backendUrl.replace(/\/$/, "")}${path}`;
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
      imageUrl: `${frontendOrigin}/logo-icon.png`,
      canonicalUrl: frontendOrigin + "/ads/" + adId,
      fbAppId,
    }));
  }
}

function renderOgHtml({ title, description, imageUrl, canonicalUrl = "", fbAppId = "0" }) {
  const ogUrlMeta = canonicalUrl ? `  <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />\n  ` : "";
  const fbAppIdMeta = `  <meta property="fb:app_id" content="${escapeHtml(fbAppId)}" />\n  `;
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta property="og:type" content="website" />
  ${ogUrlMeta}${fbAppIdMeta}<meta property="og:site_name" content="Aqui" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:image" content="${escapeHtml(imageUrl)}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
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
