#!/usr/bin/env node
/**
 * Optimiza imágenes JPEG/PNG del `public/img/` a WebP.
 *
 * Uso (desde la raíz de `client/`):
 *     node scripts/optimize-images.mjs
 *
 * Requiere `sharp` (instalar con `pnpm add -D sharp` o `npm i -D sharp`).
 * Si no está disponible, imprime instrucciones y termina sin fallar el build.
 *
 * Estrategia:
 *   - Recorre `public/img/background/` y crea variantes `.webp` (calidad 75)
 *     manteniendo originales como fallback.
 *   - Imprime el ahorro de tamaño por archivo.
 *
 * En el HTML/CSS, usar:
 *   <picture>
 *     <source srcset="/img/background/foo.webp" type="image/webp" />
 *     <img src="/img/background/foo.jpg" alt="..." />
 *   </picture>
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const IMG_DIRS = [path.join(ROOT, 'public/img/background')];
const QUALITY = 75;
const VALID_EXT = new Set(['.jpg', '.jpeg', '.png']);

async function main() {
  let sharp;
  try {
    ({ default: sharp } = await import('sharp'));
  } catch {
    console.error(
      '\n[optimize-images] El paquete "sharp" no está instalado.\n' +
      'Para optimizar las imágenes a WebP ejecutá:\n\n' +
      '    pnpm add -D sharp\n' +
      '    node scripts/optimize-images.mjs\n\n' +
      'Alternativamente, podés convertir manualmente usando cwebp:\n' +
      '    cwebp -q 75 entrada.jpg -o salida.webp\n'
    );
    process.exit(0);
  }

  let total = { input: 0, output: 0, count: 0 };

  for (const dir of IMG_DIRS) {
    try {
      const files = await fs.readdir(dir);
      for (const file of files) {
        const ext = path.extname(file).toLowerCase();
        if (!VALID_EXT.has(ext)) continue;

        const inputPath = path.join(dir, file);
        const outputPath = path.join(dir, file.replace(ext, '.webp'));

        const inputSize = (await fs.stat(inputPath)).size;

        await sharp(inputPath)
          .webp({ quality: QUALITY })
          .toFile(outputPath);

        const outputSize = (await fs.stat(outputPath)).size;
        const saved = inputSize - outputSize;
        const pct = ((saved / inputSize) * 100).toFixed(1);
        console.log(
          `  ${file.padEnd(40)} ${(inputSize / 1024).toFixed(0).padStart(5)} KB → ${(outputSize / 1024).toFixed(0).padStart(5)} KB  (-${pct}%)`,
        );
        total.input += inputSize;
        total.output += outputSize;
        total.count += 1;
      }
    } catch (err) {
      console.warn(`  ⚠ No se pudo leer ${dir}: ${err.message}`);
    }
  }

  if (total.count === 0) {
    console.log('  (no se encontraron imágenes para optimizar)');
    return;
  }

  const savedKB = ((total.input - total.output) / 1024).toFixed(0);
  const pct = (((total.input - total.output) / total.input) * 100).toFixed(1);
  console.log(
    `\nResumen: ${total.count} imágenes optimizadas, ${savedKB} KB ahorrados (-${pct}%).`,
  );
}

main().catch((err) => {
  console.error('Error optimizando imágenes:', err);
  process.exit(1);
});
