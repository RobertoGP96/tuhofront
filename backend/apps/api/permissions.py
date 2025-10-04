from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Permiso personalizado para permitir solo a los propietarios de un objeto editarlo.
    """

    def has_object_permission(self, request, view, obj):
        # Los permisos de lectura se permiten para cualquier solicitud,
        # así que siempre permitiremos solicitudes GET, HEAD o OPTIONS.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Los permisos de escritura solo se otorgan al propietario del objeto.
        return obj.usuario == request.user or obj.user == request.user


class IsOwnerOrStaff(permissions.BasePermission):
    """
    Permiso personalizado para permitir solo a los propietarios o staff editar.
    """

    def has_object_permission(self, request, view, obj):
        # El staff puede hacer todo
        if request.user.is_staff:
            return True
        
        # Los usuarios normales solo pueden editar sus propios objetos
        return (hasattr(obj, 'usuario') and obj.usuario == request.user) or \
               (hasattr(obj, 'user') and obj.user == request.user)


class IsStaffOrReadOnly(permissions.BasePermission):
    """
    Permiso personalizado para permitir solo al staff escribir, pero todos pueden leer.
    """

    def has_permission(self, request, view):
        # Permitir lectura a todos los usuarios autenticados
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        
        # Solo permitir escritura al staff
        return request.user and request.user.is_staff


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Permiso personalizado para permitir solo a los administradores escribir.
    """

    def has_permission(self, request, view):
        # Permitir lectura a todos los usuarios autenticados
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        
        # Solo permitir escritura a administradores
        return request.user and request.user.is_superuser


class IsInGroupOrReadOnly(permissions.BasePermission):
    """
    Permiso personalizado para verificar si el usuario pertenece a un grupo específico.
    """
    
    def __init__(self, group_name):
        self.group_name = group_name
    
    def has_permission(self, request, view):
        # Permitir lectura a todos los usuarios autenticados
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        
        # Verificar si el usuario pertenece al grupo
        return request.user and request.user.groups.filter(name=self.group_name).exists()