#!/usr/bin/env python
"""
Optimiza imágenes JPEG/PNG del frontend a WebP usando Pillow.

Uso (desde la raíz del repo):
    python scripts/optimize_images.py

Requiere Pillow (ya incluido en backend/requirements.txt).
Activá el venv del backend antes de correrlo o pasale el python adecuado.

Estrategia:
    - Convierte cada archivo .jpg/.jpeg/.png a .webp con calidad 75 manteniendo
      el original como fallback (para navegadores sin WebP, hoy >97% support).
    - Imprime el ahorro de tamaño por archivo.

En el HTML/CSS, usar:
    <picture>
      <source srcset="/img/background/foo.webp" type="image/webp" />
      <img src="/img/background/foo.jpg" alt="..." />
    </picture>
"""
from __future__ import annotations

import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    sys.exit(
        "Pillow no está instalado. Activá el venv del backend o instala con `pip install Pillow`."
    )

ROOT = Path(__file__).resolve().parent.parent
IMG_DIRS = [
    ROOT / "client/public/img/background",
]
QUALITY = 75
VALID_EXT = {".jpg", ".jpeg", ".png"}


def main() -> None:
    total_in = total_out = count = 0
    for d in IMG_DIRS:
        if not d.exists():
            print(f"  [!] {d} no existe, salto")
            continue
        for path in d.iterdir():
            if path.suffix.lower() not in VALID_EXT:
                continue
            out_path = path.with_suffix(".webp")
            try:
                with Image.open(path) as im:
                    # Convertir a RGB si tiene canal alpha PNG sin transparencia visible
                    if im.mode in ("RGBA", "P"):
                        im = im.convert("RGB")
                    im.save(out_path, "WEBP", quality=QUALITY)
                in_size = path.stat().st_size
                out_size = out_path.stat().st_size
                pct = (in_size - out_size) / in_size * 100
                print(
                    f"  {path.name:<40} {in_size // 1024:>5} KB -> {out_size // 1024:>5} KB  (-{pct:.1f}%)"
                )
                total_in += in_size
                total_out += out_size
                count += 1
            except Exception as exc:  # noqa: BLE001
                print(f"  [!] Falló {path.name}: {exc}")

    if count == 0:
        print("  (no se encontraron imágenes para optimizar)")
        return

    saved = (total_in - total_out) / 1024
    pct = (total_in - total_out) / total_in * 100
    print(f"\nResumen: {count} imágenes optimizadas, {saved:.0f} KB ahorrados (-{pct:.1f}%).")


if __name__ == "__main__":
    main()
