"""
Permisos personalizados para los endpoints de trámites internos y catálogos.

- ``IsStaffOrReadOnly``: lectura para autenticados, escritura solo para staff del
  módulo interno (ADMIN / GESTOR_INTERNO).
- ``IsOwnerOrStaff``: usado en detail views; el dueño del trámite puede acceder
  a su propio recurso, los staff/admin del módulo interno pueden acceder a todos.

Los helpers ``is_internal_staff``, ``is_tramites_staff`` y ``is_reservas_staff``
permiten a las vistas de cada módulo aislar a los gestores: un GESTOR_RESERVAS
no debería poder crear/editar trámites internos, y viceversa.
"""
from rest_framework import permissions


INTERNAL_STAFF_ROLES = ('ADMIN', 'GESTOR_INTERNO')
TRAMITES_STAFF_ROLES = ('ADMIN', 'GESTOR_TRAMITES')
RESERVAS_STAFF_ROLES = ('ADMIN', 'GESTOR_RESERVAS')


def _has_module_role(user, roles) -> bool:
    if not user or not user.is_authenticated:
        return False
    if user.is_superuser:
        return True
    user_type = getattr(user, 'user_type', None)
    if user_type in roles:
        return True
    # ``is_staff`` se considera ADMIN del sistema (alineado con frontend useAuth.isAdmin),
    # por lo que pasa cualquier comprobación que incluya 'ADMIN'.
    return bool(user.is_staff and 'ADMIN' in roles)


def is_internal_staff(user) -> bool:
    """¿El usuario puede gestionar el módulo de trámites internos?"""
    return _has_module_role(user, INTERNAL_STAFF_ROLES)


def is_tramites_staff(user) -> bool:
    """¿El usuario puede gestionar el módulo de trámites externos?"""
    return _has_module_role(user, TRAMITES_STAFF_ROLES)


def is_reservas_staff(user) -> bool:
    """¿El usuario puede gestionar el módulo de reservas de locales?"""
    return _has_module_role(user, RESERVAS_STAFF_ROLES)


class IsStaffOrReadOnly(permissions.BasePermission):
    """Lectura para cualquier usuario autenticado; escritura solo para staff del módulo interno."""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return is_internal_staff(request.user)


class IsOwnerOrStaff(permissions.BasePermission):
    """A nivel de objeto: el dueño (campo ``user``) o el staff del módulo interno pueden operar."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        if is_internal_staff(request.user):
            return True
        owner = getattr(obj, 'user', None)
        return owner is not None and owner == request.user
