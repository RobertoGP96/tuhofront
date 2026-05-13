/**
 * Dispara la descarga de un Blob como archivo en el navegador.
 */
export function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // liberar URL en el siguiente tick
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

/**
 * Extrae el filename de un header Content-Disposition. Devuelve fallback si no se encuentra.
 */
export function filenameFromContentDisposition(header: string | undefined, fallback: string): string {
  if (!header) return fallback;
  const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(header);
  return match ? decodeURIComponent(match[1]) : fallback;
}
