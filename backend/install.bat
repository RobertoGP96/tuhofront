call TUho_Env/Scripts/activate.bat
cd TUho
python manage.py makemigrations
python manage.py migrate
python manage.py install