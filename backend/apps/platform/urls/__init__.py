from django.urls import path, include

app_name = 'platform'


urlpatterns = [
    path('', include([
        path('news/', include('apps.platform.urls.news')),
        path('areas/', include('apps.platform.urls.areas')),
        path('departments/', include('apps.platform.urls.department')),
        path('users/', include('apps.platform.urls.users')),
        path('procedures/', include('apps.platform.urls.procedure')),
    ])),
]