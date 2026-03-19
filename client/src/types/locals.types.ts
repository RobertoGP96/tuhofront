// Enums

export type LocalType =
  | 'AULA'
  | 'LABORATORIO'
  | 'AUDITORIO'
  | 'SALA_REUNIONES'
  | 'BIBLIOTECA'
  | 'GIMNASIO'
  | 'CAFETERIA'
  | 'OTRO';

export type ReservationState =
  | 'BORRADOR'
  | 'PENDIENTE'
  | 'APROBADA'
  | 'RECHAZADA'
  | 'CANCELADA'
  | 'EN_CURSO'
  | 'FINALIZADA';

export type ReservationPurpose =
  | 'CLASE'
  | 'EXAMEN'
  | 'REUNION'
  | 'EVENTO'
  | 'TALLER'
  | 'CONFERENCIA'
  | 'ESTUDIO'
  | 'OTRO';

// Shared

export type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type UserRef = {
  id: number;
  email: string;
  full_name: string;
};

// Locals

export type LocalListItem = {
  id: number;
  name: string;
  code: string;
  local_type: LocalType;
  local_type_display: string;
  capacity: number;
  is_active: boolean;
  requires_approval: boolean;
  image: string | null;
  total_reservations: number;
};

export type UpcomingReservationRef = {
  id: number;
  start_time: string;
  end_time: string;
  purpose: ReservationPurpose;
  responsible_name: string;
};

export type LocalDetail = LocalListItem & {
  description: string;
  created_at: string;
  updated_at: string;
  upcoming_reservations: UpcomingReservationRef[];
  is_available_now: boolean;
};

export type LocalCreate = {
  name: string;
  code: string;
  local_type: LocalType;
  capacity: number;
  is_active?: boolean;
  requires_approval?: boolean;
  description?: string;
  image?: File | null;
};

export type LocalUpdate = Partial<LocalCreate>;

export type AvailabilityCheck = {
  start_time: string;
  end_time: string;
};

export type AvailabilityResult = {
  is_available: boolean;
  conflicts?: Array<{
    id: number;
    start_time: string;
    end_time: string;
  }>;
};

export type LocalStatistics = {
  total_reservations: number;
  approved_reservations: number;
  pending_reservations: number;
  rejected_reservations: number;
  cancelled_reservations: number;
  upcoming_reservations: number;
  average_duration_hours: number;
  most_common_purpose: ReservationPurpose | null;
};

export type CalendarEntry = {
  date: string;
  reservations: Array<{
    id: number;
    start_time: string;
    end_time: string;
    state: ReservationState;
    responsible_name: string;
  }>;
};

// Reservations

export type ReservationListItem = {
  id: number;
  numero_seguimiento: string;
  local: number;
  local_name: string;
  local_code: string;
  user: number;
  user_name: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  state: ReservationState;
  state_display: string;
  purpose: ReservationPurpose;
  purpose_display: string;
  expected_attendees: number;
  responsible_name: string;
  created_at: string;
};

export type ReservationDetail = {
  id: number;
  numero_seguimiento: string;
  local: LocalListItem;
  user: UserRef;
  start_time: string;
  end_time: string;
  duration_hours: number;
  duration_minutes: number;
  purpose: ReservationPurpose;
  purpose_display: string;
  purpose_detail: string;
  expected_attendees: number;
  responsible_name: string;
  responsible_phone: string;
  responsible_email: string;
  setup_requirements: string;
  state: ReservationState;
  state_display: string;
  observation: string | null;
  deadline: string | null;
  approved_by: UserRef | null;
  approved_at: string | null;
  rejection_reason: string | null;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  is_upcoming: boolean;
  is_past: boolean;
  can_be_edited: boolean;
  can_be_cancelled: boolean;
};

export type ReservationCreate = {
  local: string;
  start_time: string;
  end_time: string;
  purpose: ReservationPurpose;
  purpose_detail: string;
  expected_attendees: number;
  responsible_name: string;
  responsible_phone: string;
  responsible_email: string;
  setup_requirements?: string;
  observation?: string;
};

export type ReservationUpdate = Partial<ReservationCreate>;

export type ApproveReservationData = {
  observation?: string;
};

export type RejectReservationData = {
  rejection_reason: string;
};

export type CancelReservationData = {
  cancellation_reason: string;
};

export type ReservationHistoryItem = {
  id: number;
  user: UserRef;
  action: string;
  details: Record<string, unknown>;
  timestamp: string;
};

// Query params

export type GetLocalsParams = {
  local_type?: LocalType;
  is_active?: boolean;
  requires_approval?: boolean;
  search?: string;
  ordering?: string;
  page?: number;
};

export type GetReservationsParams = {
  state?: ReservationState;
  purpose?: ReservationPurpose;
  local?: number;
  user?: number;
  search?: string;
  ordering?: string;
  page?: number;
};

export type GetLocalReservationsParams = {
  state?: ReservationState;
  page?: number;
};
