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
from .news import NewsListSerializer, NewsDetailSerializer, NewsCreateUpdateSerializer
from .procedure import ProcedureSerializer, ProcedureDetailSerializer


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
    'NewsListSerializer',
    'NewsDetailSerializer',
    'NewsCreateUpdateSerializer',
    'ProcedureSerializer',
    'ProcedureDetailSerializer',
]