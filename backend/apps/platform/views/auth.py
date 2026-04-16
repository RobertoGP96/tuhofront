"""
Vistas de autenticación.

- Login con throttle `login` y rate limit por IP+username (django-axes).
- Respuesta de bloqueo Axes.
"""
from django.conf import settings
from django.http import JsonResponse
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.throttling import ScopedRateThrottle

from ..serializers.user import MyTokenObtainPairSerializer


class LoginThrottle(ScopedRateThrottle):
    scope = 'login'


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer
    throttle_classes = [LoginThrottle]


def axes_lockout_response(request, credentials=None, *args, **kwargs):
    """Respuesta cuando Axes bloquea por exceso de intentos fallidos."""
    return JsonResponse(
        {
            'detail': 'Demasiados intentos fallidos. Tu cuenta/IP ha sido bloqueada temporalmente.',
            'cooloff_minutes': int(getattr(settings, 'AXES_COOLOFF_TIME', None).total_seconds() / 60)
            if getattr(settings, 'AXES_COOLOFF_TIME', None) else 15,
        },
        status=429,
    )
