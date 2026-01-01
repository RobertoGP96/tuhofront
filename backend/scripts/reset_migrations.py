"""Script para eliminar migraciones y la base de datos sqlite local.
Úsalo únicamente en entornos de desarrollo y después de respaldar si es necesario.

Cómo usar (PowerShell):
    cd backend
    python scripts/reset_migrations.py

El script eliminará todos los archivos dentro de las carpetas `migrations` salvo `__init__.py`
y borrará `db.sqlite3` si existe.
"""
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def remove_migrations(root):
    removed = []
    for dirpath, dirnames, filenames in os.walk(root):
        if os.path.basename(dirpath) == 'migrations':
            for fname in filenames:
                if fname == '__init__.py':
                    continue
                full = os.path.join(dirpath, fname)
                try:
                    os.remove(full)
                    removed.append(full)
                except Exception as e:
                    print(f'Error removing {full}: {e}')
    return removed

def remove_db(root):
    db_path = os.path.join(root, 'db.sqlite3')
    if os.path.exists(db_path):
        try:
            os.remove(db_path)
            return db_path
        except Exception as e:
            print(f'Error removing DB {db_path}: {e}')
    return None

def main():
    print('Root detected:', ROOT)
    confirm = input('This will delete all migration files (except __init__.py) and db.sqlite3 in the backend. Continue? [y/N]: ')
    if confirm.lower() != 'y':
        print('Aborted.')
        sys.exit(0)
    removed = remove_migrations(ROOT)
    if removed:
        print('Removed migration files:')
        for p in removed:
            print(' -', p)
    else:
        print('No migration files removed.')
    db_removed = remove_db(ROOT)
    if db_removed:
        print('Removed DB:', db_removed)
    else:
        print('No DB file removed (not found or error).')

    print('\nAhora puedes ejecutar `python manage.py makemigrations` y `python manage.py migrate` para crear migraciones iniciales.')

if __name__ == '__main__':
    main()
