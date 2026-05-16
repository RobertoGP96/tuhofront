"""
Permisos personalizados para los endpoints de trámites de la secretaría docente.

Reglas:
- Lectura/escritura del trámite: dueño (`created_by`) o staff del módulo.
- Staff del módulo = GESTOR_SECRETARIA o ADMIN.
"""
from rest_framework import permissions


SECRETARY_STAFF_ROLES = ('ADMIN', 'GESTOR_SECRETARIA')


def is_secretary_staff(user) -> bool:
    """¿El usuario puede gestionar trámites de la secretaría docente?"""
    if not user or not user.is_authenticated:
        return False
    if user.is_superuser:
        return True
    user_type = getattr(user, 'user_type', None)
    if user_type in SECRETARY_STAFF_ROLES:
        return True
    # ``is_staff`` de Django se considera ADMIN del sistema.
    return bool(user.is_staff)


class IsOwnerOrReadOnly(permissions.BasePermission):
    """Permiso histórico — conservado para compatibilidad con código viejo.

    Read permissions a cualquiera; write sólo al dueño.
    """

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.created_by == request.user


class IsAdminOrReadOnly(permissions.BasePermission):
    """Permiso histórico — read a cualquiera; write sólo a staff (is_staff)."""

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_staff)


class CanManageSecretaryProcedure(permissions.BasePermission):
    """
    Permiso unificado para ``TramiteViewSet``:

    - Acciones de lectura (GET/HEAD/OPTIONS): dueño o staff del módulo.
    - Acciones de escritura (POST/PUT/PATCH/DELETE) sobre objeto existente:
      sólo staff del módulo. El dueño no puede cambiar estado por sí mismo;
      eso lo hace el gestor.
    - ``create`` (POST sobre la colección): cualquier usuario autenticado.

    Se usa junto con un ``get_queryset`` filtrado para que los no-staff sólo
    vean sus propios trámites.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        # Crear un trámite lo puede hacer cualquier usuario autenticado.
        if view.action == 'create':
            return True
        return True

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False

        owner = getattr(obj, 'created_by', None)
        is_owner = owner is not None and owner == request.user
        is_staff = is_secretary_staff(request.user)

        # Lectura: dueño o staff
        if request.method in permissions.SAFE_METHODS:
            return is_owner or is_staff

        # Escritura: sólo staff del módulo (gestores)
        return is_staff
