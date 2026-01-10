import { BaseModel } from './base';

/**
 * Procedure state types
 */
export type ProcedureState = 
  | 'BORRADOR'    // Draft
  | 'ENVIADO'     // Sent
  | 'EN_PROCESO'  // In Process
  | 'REQUIERE_INFO' // Requires Information
  | 'APROBADO'    // Approved
  | 'RECHAZADO'   // Rejected
  | 'FINALIZADO';  // Completed

/**
 * Base procedure interface
 */
export interface ProcedureBase extends BaseModel {
  id: string; // UUID
  user: number; // User ID
  state: ProcedureState;
  observation: string | null;
  deadline: string | null; // ISO 8601 date string
  follow_number: string; // Generated tracking number
}

/**
 * Procedure with detailed information
 */
export interface ProcedureDetail extends ProcedureBase {
  // Additional fields from the Procedure model
  current_step: number;
  total_steps: number;
  progress: number; // 0-100
  
  // Related data
  documents: Document[];
  history: ProcedureHistory[];
  assigned_to: number | null; // User ID of the assigned staff
  
  // Metadata
  is_editable: boolean;
  is_deletable: boolean;
  can_be_submitted: boolean;
  
  // UI helpers
  state_display: string;
  deadline_formatted: string | null;
  is_overdue: boolean;
}

/**
 * Procedure list item (for listing)
 */
export interface ProcedureListItem extends Omit<ProcedureDetail, 'documents' | 'history'> {
  // Simplified version for lists
  document_count: number;
  last_updated: string; // ISO 8601 date string
}

/**
 * Procedure creation data
 */
export interface CreateProcedureData {
  type: string; // Procedure type identifier
  title: string;
  description: string;
  deadline?: string | null; // ISO 8601 date string
  documents?: File[];
  metadata?: Record<string, any>;
}

/**
 * Procedure update data
 */
export type UpdateProcedureData = Partial<Omit<CreateProcedureData, 'type'>> & {
  state?: ProcedureState;
  observation?: string;
};

/**
 * Procedure state transition
 */
export interface ProcedureStateTransition {
  from_state: ProcedureState;
  to_state: ProcedureState;
  timestamp: string; // ISO 8601 date string
  user: number; // User ID
  comment: string | null;
}

/**
 * Procedure history entry
 */
export interface ProcedureHistory {
  id: number;
  procedure: string; // Procedure ID
  action: string;
  description: string;
  created_at: string; // ISO 8601 date string
  user: {
    id: number;
    name: string;
    email: string;
  } | null;
  state_change?: {
    from_state: ProcedureState;
    to_state: ProcedureState;
  };
}

/**
 * Document associated with a procedure
 */
export interface Document {
  id: number;
  name: string;
  description: string | null;
  file: string; // URL to the file
  file_size: number;
  file_type: string;
  uploaded_at: string; // ISO 8601 date string
  uploaded_by: number; // User ID
  is_required: boolean;
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
  rejection_reason: string | null;
}

/**
 * Procedure type definition
 */
export interface ProcedureType {
  id: string;
  name: string;
  description: string;
  icon: string;
  is_active: boolean;
  requires_approval: boolean;
  approval_flow: string[]; // Array of role IDs
  required_documents: string[];
  metadata_schema: Record<string, any>;
  settings: {
    allow_multiple: boolean;
    max_instances: number | null;
    days_to_complete: number | null;
    requires_payment: boolean;
    payment_amount: number | null;
  };
}

/**
 * Procedure statistics
 */
export interface ProcedureStats {
  total: number;
  by_state: Record<ProcedureState, number>;
  by_type: Record<string, number>;
  avg_processing_time: number; // in hours
  completion_rate: number; // 0-100
  pending_review: number;
  overdue: number;
}

/**
 * Procedure filter options
 */
export interface ProcedureFilterOptions {
  state?: ProcedureState[];
  type?: string[];
  date_from?: string; // ISO 8601 date string
  date_to?: string; // ISO 8601 date string
  assigned_to?: number[]; // User IDs
  search?: string;
  sort_by?: 'created_at' | 'deadline' | 'state' | 'type';
  sort_order?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
}
