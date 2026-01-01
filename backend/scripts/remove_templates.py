"""Script para eliminar todos los archivos de plantillas (`templates/`) en el backend.
Úsalo solo en desarrollo. El script escribirá un listado y pedirá confirmación antes de borrar.

Uso:
    cd backend
    python scripts/remove_templates.py
"""
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def list_template_files(root):
    files = []
    for dirpath, dirnames, filenames in os.walk(root):
        if os.path.basename(dirpath) == 'templates':
            for fname in filenames:
                files.append(os.path.join(dirpath, fname))
        else:
            # also check nested template subfolders
            if 'templates' in dirpath.split(os.sep):
                for fname in filenames:
                    files.append(os.path.join(dirpath, fname))
    return files

def remove_files(files):
    removed = []
    for p in files:
        try:
            os.remove(p)
            removed.append(p)
        except Exception as e:
            print(f'Error removing {p}: {e}')
    return removed

def main():
    files = list_template_files(ROOT)
    if not files:
        print('No template files found.')
        return
    print('Template files to remove:')
    for p in files:
        print(' -', p)
    confirm = input('\nThis will delete the above files. Continue? [y/N]: ')
    if confirm.lower() != 'y':
        print('Aborted.')
        sys.exit(0)
    removed = remove_files(files)
    print(f'Removed {len(removed)} files.')

if __name__ == '__main__':
    main()
