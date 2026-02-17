/** Tamanho máximo por arquivo de imagem (25MB), alinhado ao backend. */
export const MAX_IMAGE_SIZE_BYTES = 25 * 1024 * 1024;

export const MAX_IMAGE_SIZE_MB = 25;

export function isImageWithinSizeLimit(file: File): boolean {
  return file.size <= MAX_IMAGE_SIZE_BYTES;
}

export function getOversizedImageMessage(overCount: number): string {
  return overCount === 1
    ? "Uma imagem foi ignorada por ter mais de 25MB. O limite por arquivo é 25MB."
    : `${overCount} imagens foram ignoradas por terem mais de 25MB. O limite por arquivo é 25MB.`;
}
