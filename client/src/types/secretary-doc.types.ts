export type StudyType = 'PREGRADO' | 'POSGRADO';
export type StudyVisibilityType = 'NACIONAL' | 'INTERNACIONAL';
export type InterestType = 'ESTATAL' | 'NO_ESTATAL';

export interface SecretaryDocProcedure {
  id: number;
  state: string;
  created_at: string;
  updated_at: string;
  study_type: StudyType;
  visibility_type: StudyVisibilityType;
  career: string;
  year: string;
  academic_program: string;
  document_type: string;
  interest: InterestType;
  full_name: string;
  id_card: string;
  email: string;
  phone: string;
  document_file?: string;
  document_file_url?: string;
  registry_volume?: string;
  folio?: string;
  number?: string;
  created_by?: number;
  updated_by?: number;
  seguimientos?: SeguimientoTramite[];
  documentos?: Documento[];
}

export interface SecretaryDocProcedureForm {
  study_type: StudyType;
  visibility_type: StudyVisibilityType;
  career: string;
  year: string;
  academic_program: string;
  document_type: string;
  interest: InterestType;
  full_name: string;
  id_card: string;
  email: string;
  phone: string;
  document_file?: File;
  registry_volume?: string;
  folio?: string;
  number?: string;
}

export interface SeguimientoTramite {
  id: number;
  tramite: number;
  estado: string;
  observaciones: string;
  fecha: string;
  usuario?: number;
}

export interface Documento {
  id: number;
  tramite: number;
  nombre: string;
  archivo: string;
  fecha_subida: string;
  subido_por?: number;
}

export interface ProcedureListResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}

export const STUDY_TYPE_OPTIONS: { value: StudyType; label: string }[] = [
  { value: 'PREGRADO', label: 'Pregrado' },
  { value: 'POSGRADO', label: 'Posgrado' },
];

export const STUDY_VISIBILITY_OPTIONS: { value: StudyVisibilityType; label: string }[] = [
  { value: 'NACIONAL', label: 'Nacional' },
  { value: 'INTERNACIONAL', label: 'Internacional' },
];

export const INTEREST_OPTIONS: { value: InterestType; label: string }[] = [
  { value: 'ESTATAL', label: 'Estatal' },
  { value: 'NO_ESTATAL', label: 'No Estatal' },
];
