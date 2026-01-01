"""
Script de gestión para crear migraciones después de las mejoras en los modelos
"""

import os
import subprocess
import sys

def run_command(command, description):
    """Ejecuta un comando y maneja errores"""
    print(f"\n🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ {description} completado exitosamente")
            if result.stdout:
                print(f"Output: {result.stdout}")
        else:
            print(f"❌ Error en {description}")
            print(f"Error: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ Excepción en {description}: {str(e)}")
        return False
    return True

def main():
    """Función principal para ejecutar todas las migraciones"""
    print("🚀 Iniciando proceso de migración para modelos mejorados...")
    
    # Lista de aplicaciones a migrar en orden
    apps = [
        'usuarios',
        'notificaciones', 
        'plataforma',
        'atencion_poblacion',
        'internal',
        'secretaria_docente',
        'api'
    ]
    
    # Crear migraciones para cada aplicación
    for app in apps:
        if not run_command(
            f"python manage.py makemigrations {app}",
            f"Creando migraciones para {app}"
        ):
            print(f"⚠️ Advertencia: No se pudieron crear migraciones para {app}")
    
    # Aplicar todas las migraciones
    if not run_command(
        "python manage.py migrate",
        "Aplicando todas las migraciones"
    ):
        print("❌ Error aplicando migraciones")
        return False
    
    # Verificar estado de migraciones
    run_command(
        "python manage.py showmigrations",
        "Verificando estado de migraciones"
    )
    
    print("\n🎉 Proceso de migración completado!")
    print("\n📋 Resumen de mejoras implementadas:")
    print("✅ Modelo Usuario con validaciones de carnet y teléfono")
    print("✅ Modelo Notificación con timestamps y categorización") 
    print("✅ Modelos de Plataforma con abstracts y mixins")
    print("✅ Validadores personalizados para archivos")
    print("✅ Managers personalizados para consultas optimizadas")
    print("✅ Constraints de base de datos para integridad")
    print("✅ Métodos útiles y propiedades calculadas")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)