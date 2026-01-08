from django.urls import path
from .views import (
    GuestListCreateView, GuestRetrieveUpdateDestroyView,
    FeedingDaysListCreateView, FeedingDaysRetrieveUpdateDestroyView,
    FeedingProcedureListCreateView, FeedingProcedureRetrieveUpdateDestroyView,
    AccommodationProcedureListCreateView, AccommodationProcedureRetrieveUpdateDestroyView,
    TransportProcedureTypeListCreateView, TransportProcedureTypeRetrieveUpdateDestroyView,
    TransportProcedureListCreateView, TransportProcedureRetrieveUpdateDestroyView,
    MaintanceProcedureTypeListCreateView, MaintanceProcedureTypeRetrieveUpdateDestroyView,
    MaintancePriorityListCreateView, MaintancePriorityRetrieveUpdateDestroyView,
    MaintanceProcedureListCreateView, MaintanceProcedureRetrieveUpdateDestroyView,
    get_all_procedures, get_procedure_stats, DepartmentListCreateView, 
    DepartmentRetrieveUpdateDestroyView, AreaListCreateView, AreaRetrieveUpdateDestroyView, 
    NoteListCreateView, NoteRetrieveUpdateDestroyView
)

urlpatterns = [
    # Rutas para Guest
    path('guests/', GuestListCreateView.as_view(), name='guest-list-create'),
    path('guests/<int:pk>/', GuestRetrieveUpdateDestroyView.as_view(), name='guest-detail'),

    # Rutas para FeedingDays
    path('feeding-days/', FeedingDaysListCreateView.as_view(), name='feeding-days-list-create'),
    path('feeding-days/<int:pk>/', FeedingDaysRetrieveUpdateDestroyView.as_view(), name='feeding-days-detail'),

    # Rutas para FeedingProcedure
    path('feeding-procedures/', FeedingProcedureListCreateView.as_view(), name='feeding-procedure-list-create'),
    path('feeding-procedures/<int:pk>/', FeedingProcedureRetrieveUpdateDestroyView.as_view(), name='feeding-procedure-detail'),

    # Rutas para AccommodationProcedure
    path('accommodation-procedures/', AccommodationProcedureListCreateView.as_view(), name='accommodation-procedure-list-create'),
    path('accommodation-procedures/<int:pk>/', AccommodationProcedureRetrieveUpdateDestroyView.as_view(), name='accommodation-procedure-detail'),

    # Rutas para TransportProcedureType
    path('transport-procedure-types/', TransportProcedureTypeListCreateView.as_view(), name='transport-procedure-type-list-create'),
    path('transport-procedure-types/<int:pk>/', TransportProcedureTypeRetrieveUpdateDestroyView.as_view(), name='transport-procedure-type-detail'),

    # Rutas para TransportProcedure
    path('transport-procedures/', TransportProcedureListCreateView.as_view(), name='transport-procedure-list-create'),
    path('transport-procedures/<int:pk>/', TransportProcedureRetrieveUpdateDestroyView.as_view(), name='transport-procedure-detail'),

    # Rutas para MaintanceProcedureType
    path('maintance-procedure-types/', MaintanceProcedureTypeListCreateView.as_view(), name='maintance-procedure-type-list-create'),
    path('maintance-procedure-types/<int:pk>/', MaintanceProcedureTypeRetrieveUpdateDestroyView.as_view(), name='maintance-procedure-type-detail'),

    # Rutas para MaintancePriority
    path('maintance-priorities/', MaintancePriorityListCreateView.as_view(), name='maintance-priority-list-create'),
    path('maintance-priorities/<int:pk>/', MaintancePriorityRetrieveUpdateDestroyView.as_view(), name='maintance-priority-detail'),

    # Rutas para MaintenanceProcedure
    path('maintance-procedures/', MaintanceProcedureListCreateView.as_view(), name='maintance-procedure-list-create'),
    path('maintance-procedures/<int:pk>/', MaintanceProcedureRetrieveUpdateDestroyView.as_view(), name='maintance-procedure-detail'),
    
    # Rutas para Department
    path('departments/', DepartmentListCreateView.as_view(), name='department-list-create'),
    path('departments/<int:pk>/', DepartmentRetrieveUpdateDestroyView.as_view(), name='department-detail'),
    
    # Rutas para Area
    path('areas/', AreaListCreateView.as_view(), name='area-list-create'),
    path('areas/<int:pk>/', AreaRetrieveUpdateDestroyView.as_view(), name='area-detail'),
    
    # Rutas para Note
    path('notes/', NoteListCreateView.as_view(), name='note-list-create'),
    path('notes/<int:pk>/', NoteRetrieveUpdateDestroyView.as_view(), name='note-detail'),
    
    
    path('procedures/', get_all_procedures, name='get-all-procedures'),
    path('stats/', get_procedure_stats, name='get_procedure_stats'),
    
    # PDF
    # path('feeding-procedures/<int:pk>/pdf/', print_feeding_procedure_pdf, name='feeding_procedure_pdf'),
    # path('accommodation-procedures/<int:pk>/pdf/', print_accommodation_procedure_pdf, name='accommodation_procedure_pdf'),
    # path('transport-procedures/<int:pk>/pdf/', print_transport_procedure_pdf, name='transport_procedure_pdf'),
    # path('maintance-procedures/<int:pk>/pdf/', print_maintance_procedure_pdf, name='maintance_procedure_pdf'),
]