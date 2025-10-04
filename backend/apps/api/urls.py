from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    # Estructuras básicas
    AreaCreateView, 
    
    # ViewSets básicos
    UsuarioViewSet, 
    NotificacionViewSet, 
    AtencionPoblacionViewSet,
    
    # ViewSets de Plataforma
    NoticiasViewSet,
    EmailViewSet,
    EstadosTramitesViewSet,
    
    # ViewSets de Secretaría Docente
    TramiteViewSet,
    
    # ViewSets de Internal Procedures
    GuestViewSet,
    FeedingDaysViewSet,
    InternalDepartmentViewSet,
    InternalAreaViewSet,
    NoteViewSet,
    FeedingProcedureViewSet,
    AccommodationProcedureViewSet,
    TransportProcedureTypeViewSet,
    TransportProcedureViewSet,
    MaintanceProcedureTypeViewSet,
    MaintancePriorityViewSet,
    MaintanceProcedureViewSet,
    
    # Vistas de autenticación
    Login, 
    Logout, 
    Register, 
    TokenValidationView, 
    PasswordResetRequestView,
    UserProfileView
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

# Crear un enrutador y registrar los viewsets
router = DefaultRouter()

# ViewSets básicos
router.register(r'usuarios', UsuarioViewSet)
router.register(r'notificaciones', NotificacionViewSet)
router.register(r'atencion_poblacion', AtencionPoblacionViewSet)

# ViewSets de Plataforma
router.register(r'noticias', NoticiasViewSet)
router.register(r'emails', EmailViewSet)
router.register(r'estados-tramites', EstadosTramitesViewSet)

# ViewSets de Secretaría Docente
router.register(r'tramites-secretaria', TramiteViewSet)

# ViewSets de Internal Procedures
router.register(r'guests', GuestViewSet)
router.register(r'feeding-days', FeedingDaysViewSet)
router.register(r'internal-departments', InternalDepartmentViewSet)
router.register(r'internal-areas', InternalAreaViewSet)
router.register(r'notes', NoteViewSet)
router.register(r'feeding-procedures', FeedingProcedureViewSet)
router.register(r'accommodation-procedures', AccommodationProcedureViewSet)
router.register(r'transport-procedure-types', TransportProcedureTypeViewSet)
router.register(r'transport-procedures', TransportProcedureViewSet)
router.register(r'maintance-procedure-types', MaintanceProcedureTypeViewSet)
router.register(r'maintance-priorities', MaintancePriorityViewSet)
router.register(r'maintance-procedures', MaintanceProcedureViewSet)

urlpatterns = [
    path('', include(router.urls)),  # Incluir las URLs del enrutador
    
    # Autenticación
    path('auth/login/', Login.as_view(), name='login'),
    path('auth/logout/', Logout.as_view(), name='logout'),
    path('auth/register/', Register.as_view(), name='register'),
    path('auth/profile/', UserProfileView.as_view(), name='user_profile'),
    path('auth/verify/<str:token>/', TokenValidationView.as_view(), name='token_validation'),
    path('auth/reset-password/', PasswordResetRequestView.as_view(), name='password_reset'),
    
    # JWT Tokens
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Estructura
    path('areas/', AreaCreateView.as_view(), name='area-list-create'),    
]