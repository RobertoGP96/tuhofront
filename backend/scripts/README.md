Reset migrations helper
======================

This folder contains a helper script `reset_migrations.py` to remove all Django migration files (except `__init__.py`) and delete `db.sqlite3` in the `backend` folder. Use only in development.

Usage (PowerShell):

```powershell
cd backend
python scripts/reset_migrations.py
```

The script will prompt for confirmation before deleting anything.
