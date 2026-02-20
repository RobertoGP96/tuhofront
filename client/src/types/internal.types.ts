// Base types for internal procedures
export interface BaseProcedure {
  id: number;
  user: number;
  state: 'P' | 'A' | 'R'; // Pending, Approved, Rejected
  created_at: string;
  updated_at: string;
  notes?: Note[];
  username?: string;
}

export interface Note {
  id: number;
  content: string;
  created_at: string;
  procedure?: number;
}

// Feeding Procedure Types
export interface FeedingDays {
  id?: number;
  date: string;
  breakfast: number;
  lunch: number;
  dinner: number;
  snack: number;
}

export interface FeedingProcedure extends BaseProcedure {
  feeding_type: 'RESTAURANT' | 'HOTELITO';
  start_day: string;
  end_day: string;
  description: string;
  amount: number;
  feeding_days: FeedingDays[];
}

// Accommodation Procedure Types
export interface Guest {
  id?: number;
  name: string;
  sex: 'M' | 'F';
  identification: string;
}

export interface AccommodationProcedure extends BaseProcedure {
  accommodation_type: 'HOTEL' | 'POSGRADO';
  start_day: string;
  end_day: string;
  description: string;
  guests: Guest[];
  feeding_days: FeedingDays[];
}

// Transport Procedure Types
export interface TransportProcedureType {
  id: number;
  name: string;
}

export interface TransportProcedure extends BaseProcedure {
  procedure_type: number | TransportProcedureType;
  departure_time: string;
  return_time: string;
  departure_place: string;
  return_place: string;
  passengers: number;
  description: string;
  plate?: string;
  round_trip: boolean;
}

// Maintenance Procedure Types
export interface MaintanceProcedureType {
  id: number;
  name: string;
}

export interface MaintancePriority {
  id: number;
  name: string;
}

export interface MaintanceProcedure extends BaseProcedure {
  description: string;
  picture?: string;
  procedure_type: number | MaintanceProcedureType;
  priority: number | MaintancePriority;
}

// Form Types (for creating/updating)
export interface FeedingProcedureForm {
  feeding_type: 'RESTAURANT' | 'HOTELITO';
  start_day: string;
  end_day: string;
  description: string;
  amount: number;
  feeding_days: FeedingDays[];
}

export interface AccommodationProcedureForm {
  accommodation_type: 'HOTEL' | 'POSGRADO';
  start_day: string;
  end_day: string;
  description: string;
  guests: Guest[];
  feeding_days: FeedingDays[];
}

export interface TransportProcedureForm {
  procedure_type: number;
  departure_time: string;
  return_time: string;
  departure_place: string;
  return_place: string;
  passengers: number;
  description: string;
  plate?: string;
  round_trip: boolean;
}

export interface MaintanceProcedureForm {
  description: string;
  picture?: File;
  procedure_type: number;
  priority: number;
}

// API Response Types
export interface ProcedureListResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ProcedureResponse<T> {
  id: number;
  data: T;
}

// Department and Area (referenced in serializers)
export interface Department {
  id: number;
  name: string;
}

export interface Area {
  id: number;
  name: string;
  department: number | Department;
}
