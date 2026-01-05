from .area import AreaListSerializer, AreaSerializer
from .department import (
    DepartmentSerializer,
    DepartmentListSerializer,
    DepartmentDetailSerializer,
)
from .user import (
    UserBaseSerializer,
    UserListSerializer,
    UserDetailSerializer,
    UserCreateSerializer,
    UserUpdateSerializer,
    ChangePasswordSerializer,
    ActivateAccountSerializer,
    VerifyPhoneSerializer,
    ResetPasswordSerializer,
    ResetPasswordConfirmSerializer,
    UserStaffSerializer,
    BulkUserActionSerializer,
    UserStatsSerializer,
)
from .procedure import ProcedureSerializer, ProcedureDetailSerializer
# Nota: `news.py` está vacío actualmente; añadir `NoticiaSerializer` cuando exista.


__all__ = [
    'DepartmentSerializer',
    'DepartmentListSerializer',
    'DepartmentDetailSerializer',
    'AreaListSerializer',
    'AreaSerializer',
    'UserBaseSerializer',
    'UserListSerializer',
    'UserDetailSerializer',
    'UserCreateSerializer',
    'UserUpdateSerializer',
    'ChangePasswordSerializer',
    'ActivateAccountSerializer',
    'VerifyPhoneSerializer',
    'ResetPasswordSerializer',
    'ResetPasswordConfirmSerializer',
    'UserStaffSerializer',
    'BulkUserActionSerializer',
    'UserStatsSerializer',
    'ProcedureSerializer',
    'ProcedureDetailSerializer',
]