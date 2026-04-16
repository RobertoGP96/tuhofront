#!/usr/bin/env bash
# Script de backup para TUho (DB + media + env seguro).
# Uso: bash scripts/backup.sh
# Configura DBBACKUP_LOCATION en .env para cambiar destino.

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_DIR="${DBBACKUP_LOCATION:-$PROJECT_DIR/backups}"
mkdir -p "$BACKUP_DIR"

echo "[backup] iniciando en $BACKUP_DIR..."

# Backup de DB
python manage.py dbbackup --clean --compress

# Backup de media
python manage.py mediabackup --clean --compress

echo "[backup] completado: $TIMESTAMP"
