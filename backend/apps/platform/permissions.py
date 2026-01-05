from rest_framework import permissions


class IsOwnerOrStaff(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object or staff to edit it.
    """
    
    def has_object_permission(self, request, view, obj):
        # Allow any access to safe methods
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to the owner of the object or staff/superuser
        return obj == request.user or request.user.is_staff


class IsStaffUser(permissions.BasePermission):
    """
    Custom permission to only allow staff users to access a view.
    """
    
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_staff)
