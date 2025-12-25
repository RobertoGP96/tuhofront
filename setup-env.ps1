# Script para crear archivos .env desde los templates
# Ejecutar: .\setup-env.ps1

# Configurar codificación UTF-8 para caracteres especiales
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "🚀 Configurando variables de entorno para TUhoFront..." -ForegroundColor Cyan
Write-Host ""

# Verificar si ya existen archivos .env
if (Test-Path ".env") {
    Write-Host "⚠️  El archivo .env ya existe en la raíz." -ForegroundColor Yellow
    $overwrite = Read-Host "¿Deseas sobrescribirlo? (s/N)"
    if ($overwrite -ne "s" -and $overwrite -ne "S") {
        Write-Host "❌ Operación cancelada." -ForegroundColor Red
        exit
    }
}

if (Test-Path "backend\.env") {
    Write-Host "⚠️  El archivo backend\.env ya existe." -ForegroundColor Yellow
    $overwrite = Read-Host "¿Deseas sobrescribirlo? (s/N)"
    if ($overwrite -ne "s" -and $overwrite -ne "S") {
        Write-Host "❌ Operación cancelada." -ForegroundColor Red
        exit
    }
}

# Crear .env para frontend
Write-Host "📝 Creando .env para frontend..." -ForegroundColor Green
if (Test-Path "env.template") {
    Copy-Item "env.template" ".env" -Force
    Write-Host "✅ Archivo .env creado en la raíz" -ForegroundColor Green
} else {
    Write-Host "❌ No se encontró env.template" -ForegroundColor Red
}

# Crear backend/.env
Write-Host "📝 Creando backend\.env..." -ForegroundColor Green
if (Test-Path "backend\env.template") {
    Copy-Item "backend\env.template" "backend\.env" -Force
    Write-Host "✅ Archivo backend\.env creado" -ForegroundColor Green
} else {
    Write-Host "❌ No se encontró backend\env.template" -ForegroundColor Red
}

# Generar SECRET_KEY
Write-Host ""
Write-Host "🔑 Generando SECRET_KEY para Django..." -ForegroundColor Cyan

# Función para encontrar el comando Python correcto
function Find-PythonCommand {
    $pythonCommands = @("py", "python3", "python")
    foreach ($cmd in $pythonCommands) {
        try {
            $null = Get-Command $cmd -ErrorAction Stop
            $version = & $cmd --version 2>&1
            if ($LASTEXITCODE -eq 0 -or $version) {
                return $cmd
            }
        } catch {
            continue
        }
    }
    return $null
}

# Intentar usar Python del entorno virtual primero
$pythonCmd = $null
$venvPython = "backend\venv\Scripts\python.exe"
if (Test-Path $venvPython) {
    $pythonCmd = $venvPython
    Write-Host "   Usando Python del entorno virtual..." -ForegroundColor Gray
} else {
    $pythonCmd = Find-PythonCommand
    if (-not $pythonCmd) {
        Write-Host "⚠️  No se encontró Python instalado." -ForegroundColor Yellow
        Write-Host "   Instala Python o crea el entorno virtual primero." -ForegroundColor Yellow
    }
}

if ($pythonCmd) {
    try {
        # Cambiar al directorio backend para ejecutar el comando
        Push-Location "backend"
        $secretKey = & $pythonCmd -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())" 2>&1
        
        if ($LASTEXITCODE -eq 0 -and $secretKey -and $secretKey -notmatch "Error|Traceback") {
            $secretKey = $secretKey.Trim()
            
            # Volver al directorio raíz
            Pop-Location
            
            # Actualizar SECRET_KEY en backend/.env
            if (Test-Path "backend\.env") {
                $content = Get-Content "backend\.env" -Raw -Encoding UTF8
                $content = $content -replace "SECRET_KEY=.*", "SECRET_KEY=$secretKey"
                Set-Content "backend\.env" $content -Encoding UTF8 -NoNewline
                Write-Host "✅ SECRET_KEY generada y agregada a backend\.env" -ForegroundColor Green
            }
        } else {
            Pop-Location
            throw "Error al generar SECRET_KEY"
        }
    } catch {
        # Asegurarse de volver al directorio raíz en caso de error
        $currentPath = (Get-Location).Path
        if ($currentPath -like "*\backend" -or $currentPath -like "*\backend\*") {
            Pop-Location -ErrorAction SilentlyContinue
        }
        Write-Host "⚠️  No se pudo generar SECRET_KEY automáticamente." -ForegroundColor Yellow
        Write-Host "   Asegúrate de que Django esté instalado en el entorno virtual." -ForegroundColor Yellow
        Write-Host "   Ejecuta manualmente desde backend: py -c `"from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())`"" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  No se pudo encontrar Python. SECRET_KEY no se generó automáticamente." -ForegroundColor Yellow
    Write-Host "   Edita backend\.env y genera una SECRET_KEY manualmente." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ Configuración completada!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos pasos:" -ForegroundColor Cyan
Write-Host "   1. Edita .env y configura VITE_API_BASE_URL" -ForegroundColor White
Write-Host "   2. Edita backend\.env y configura las variables necesarias" -ForegroundColor White
Write-Host "   3. Ver ENV_SETUP.md para más detalles" -ForegroundColor White
Write-Host ""

