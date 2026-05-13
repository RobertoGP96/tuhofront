"""
Permisos personalizados para el sistema de reserva de locales.
"""

from rest_framework import permissions

from apps.internal.permissions import is_reservas_staff


class IsReservationOwnerOrAdmin(permissions.BasePermission):
    """
    Permiso personalizado que permite:
    - Administradores y GESTOR_RESERVAS pueden ver y editar cualquier reserva
    - Usuarios solo pueden ver y editar sus propias reservas
    """

    def has_permission(self, request, view):
        """Verifica que el usuario esté autenticado"""
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        """Verifica permisos a nivel de objeto"""
        # Staff del módulo de reservas (admin / GESTOR_RESERVAS) tiene todos los permisos
        if is_reservas_staff(request.user):
            return True

        # El propietario puede ver y editar su reserva
        return obj.user == request.user


class CanApproveReservations(permissions.BasePermission):
    """
    Permiso para aprobar/rechazar reservas.
    Solo admin / GESTOR_RESERVAS pueden aprobar reservas.
    """

    message = "No tiene permisos para aprobar o rechazar reservas."

    def has_permission(self, request, view):
        return is_reservas_staff(request.user)


class CanManageLocals(permissions.BasePermission):
    """
    Permiso para gestionar locales.
    Solo admin / GESTOR_RESERVAS pueden crear, editar o eliminar locales.
    """

    message = "No tiene permisos para gestionar locales."

    def has_permission(self, request, view):
        # Lectura permitida para usuarios autenticados
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated

        # Escritura solo para staff del módulo de reservas
        return is_reservas_staff(request.user)


class IsReservationOwner(permissions.BasePermission):
    """
    Permiso que solo permite acceso al propietario de la reserva.
    """
    
    def has_object_permission(self, request, view, obj):
        """El usuario debe ser el propietario de la reserva"""
        return obj.user == request.user