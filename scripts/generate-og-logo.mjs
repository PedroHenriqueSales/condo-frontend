/**
 * Gera logo-og.png a partir de public/logo-icon.png:
 * - Redimensiona para 512x512 (recomendado para preview no WhatsApp/Facebook).
 * - Comprime PNG para ficar abaixo de ~300 KB (WhatsApp recomenda < 300 KB).
 * Uso: node scripts/generate-og-logo.mjs
 * Requer: npm install --save-dev sharp
 */

import sharp from "sharp";
import { existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const inputPath = join(root, "public", "logo-icon.png");
const outputPath = join(root, "public", "logo-og.png");

if (!existsSync(inputPath)) {
  console.error("Arquivo não encontrado:", inputPath);
  process.exit(1);
}

const SIZE = 512;
const MAX_BYTES = 280 * 1024; // ~280 KB para margem

async function main() {
  const opts = { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } };
  let buffer = await sharp(inputPath)
    .resize(SIZE, SIZE, opts)
    .png({ compressionLevel: 9 })
    .toBuffer();

  // Se ainda estiver grande, reduz para 400x400
  if (buffer.length > MAX_BYTES) {
    buffer = await sharp(inputPath)
      .resize(400, 400, opts)
      .png({ compressionLevel: 9 })
      .toBuffer();
  }

  await sharp(buffer).toFile(outputPath);
  const stats = await import("fs").then((fs) => fs.promises.stat(outputPath));
  console.log("Gerado:", outputPath, "–", (stats.size / 1024).toFixed(1), "KB");
  if (stats.size > 300 * 1024) {
    console.warn("Aviso: imagem acima de 300 KB; preview no WhatsApp pode falhar.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
