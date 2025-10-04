// Tipos para trámites de secretaría
export interface SecretaryProcedureType {
  id: number;
  name: string;
  description: string;
  required_documents: string[];
  estimated_time: string; // formato: "3-5 días"
  cost?: number;
  is_active: boolean;
}

export interface SecretaryProcedure {
  id: number;
  procedure_type: SecretaryProcedureType;
  student: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    student_id: string;
  };
  status: 'pending' | 'in_progress' | 'approved' | 'rejected' | 'completed';
  priority: 'low' | 'medium' | 'high';
  submission_date: string;
  completion_date?: string;
  notes?: string;
  documents: SecretaryProcedureDocument[];
  assigned_to?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  tracking_number: string;
}

export interface SecretaryProcedureDocument {
  id: number;
  name: string;
  file_url: string;
  uploaded_at: string;
  file_size: number;
  mime_type: string;
}

export interface CreateSecretaryProcedureData {
  procedure_type_id: number;
  notes?: string;
  documents?: File[];
}

export interface UpdateSecretaryProcedureData {
  status?: SecretaryProcedure['status'];
  priority?: SecretaryProcedure['priority'];
  notes?: string;
  assigned_to_id?: number;
}

export interface SecretaryProcedureFilters {
  status?: SecretaryProcedure['status'];
  priority?: SecretaryProcedure['priority'];
  procedure_type_id?: number;
  student_id?: number;
  assigned_to_id?: number;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface SecretaryProcedureStats {
  total_procedures: number;
  pending_procedures: number;
  in_progress_procedures: number;
  completed_procedures: number;
  rejected_procedures: number;
  average_completion_time: number; // en días
}