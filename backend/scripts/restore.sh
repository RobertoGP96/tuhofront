#!/usr/bin/env bash
# Script de restauración para TUho.
# Uso: bash scripts/restore.sh <backup-file>

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

if [ -z "${1:-}" ]; then
  echo "Uso: $0 <backup-file>"
  echo "Listando backups disponibles..."
  python manage.py listbackups
  exit 1
fi

echo "[restore] restaurando $1..."
python manage.py dbrestore --input-filename="$1"
echo "[restore] restauración de DB completada."
echo "[restore] Si el backup contiene media, corre: python manage.py mediarestore"
