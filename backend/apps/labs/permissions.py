"""
Permisos personalizados para el sistema de reserva de locales.
"""

from rest_framework import permissions


class IsReservationOwnerOrAdmin(permissions.BasePermission):
    """
    Permiso personalizado que permite:
    - Administradores pueden ver y editar cualquier reserva
    - Usuarios solo pueden ver y editar sus propias reservas
    """
    
    def has_permission(self, request, view):
        """Verifica que el usuario esté autenticado"""
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        """Verifica permisos a nivel de objeto"""
        # Staff/Admin tiene todos los permisos
        if request.user.is_staff or request.user.is_superuser:
            return True
        
        # El propietario puede ver y editar su reserva
        return obj.user == request.user


class CanApproveReservations(permissions.BasePermission):
    """
    Permiso para aprobar/rechazar reservas.
    Solo usuarios con permisos de staff pueden aprobar reservas.
    """
    
    message = "No tiene permisos para aprobar o rechazar reservas."
    
    def has_permission(self, request, view):
        """Verifica que el usuario sea staff"""
        return (
            request.user and 
            request.user.is_authenticated and 
            (request.user.is_staff or request.user.is_superuser)
        )


class CanManageLocals(permissions.BasePermission):
    """
    Permiso para gestionar locales.
    Solo administradores pueden crear, editar o eliminar locales.
    """
    
    message = "No tiene permisos para gestionar locales."
    
    def has_permission(self, request, view):
        """Verifica que el usuario sea admin"""
        # Lectura permitida para usuarios autenticados
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        
        # Escritura solo para admin
        return (
            request.user and 
            request.user.is_authenticated and 
            (request.user.is_staff or request.user.is_superuser)
        )


class IsReservationOwner(permissions.BasePermission):
    """
    Permiso que solo permite acceso al propietario de la reserva.
    """
    
    def has_object_permission(self, request, view, obj):
        """El usuario debe ser el propietario de la reserva"""
        return obj.user == request.user