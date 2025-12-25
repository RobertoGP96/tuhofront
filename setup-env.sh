#!/bin/bash
# Script para crear archivos .env desde los templates
# Ejecutar: ./setup-env.sh

echo "🚀 Configurando variables de entorno para TUhoFront..."
echo ""

# Verificar si ya existen archivos .env
if [ -f ".env" ]; then
    echo "⚠️  El archivo .env ya existe en la raíz."
    read -p "¿Deseas sobrescribirlo? (s/N): " overwrite
    if [ "$overwrite" != "s" ] && [ "$overwrite" != "S" ]; then
        echo "❌ Operación cancelada."
        exit 1
    fi
fi

if [ -f "backend/.env" ]; then
    echo "⚠️  El archivo backend/.env ya existe."
    read -p "¿Deseas sobrescribirlo? (s/N): " overwrite
    if [ "$overwrite" != "s" ] && [ "$overwrite" != "S" ]; then
        echo "❌ Operación cancelada."
        exit 1
    fi
fi

# Crear .env para frontend
echo "📝 Creando .env para frontend..."
if [ -f "env.template" ]; then
    cp env.template .env
    echo "✅ Archivo .env creado en la raíz"
else
    echo "❌ No se encontró env.template"
fi

# Crear backend/.env
echo "📝 Creando backend/.env..."
if [ -f "backend/env.template" ]; then
    cp backend/env.template backend/.env
    echo "✅ Archivo backend/.env creado"
else
    echo "❌ No se encontró backend/env.template"
fi

# Generar SECRET_KEY
echo ""
echo "🔑 Generando SECRET_KEY para Django..."
if command -v python3 &> /dev/null; then
    SECRET_KEY=$(python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())")
    
    # Actualizar SECRET_KEY en backend/.env
    if [ -f "backend/.env" ]; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s/SECRET_KEY=.*/SECRET_KEY=$SECRET_KEY/" backend/.env
        else
            # Linux
            sed -i "s/SECRET_KEY=.*/SECRET_KEY=$SECRET_KEY/" backend/.env
        fi
        echo "✅ SECRET_KEY generada y agregada a backend/.env"
    fi
else
    echo "⚠️  Python3 no encontrado. No se pudo generar SECRET_KEY automáticamente."
    echo "   Ejecuta manualmente: python3 -c \"from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())\""
fi

echo ""
echo "✅ Configuración completada!"
echo ""
echo "📋 Próximos pasos:"
echo "   1. Edita .env y configura VITE_API_BASE_URL"
echo "   2. Edita backend/.env y configura las variables necesarias"
echo "   3. Ver ENV_SETUP.md para más detalles"
echo ""

