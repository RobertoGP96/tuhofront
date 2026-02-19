import { BaseModel } from './base';

export type SecretaryStudyType = 'PREGRADO' | 'POSGRADO' | '';
export type SecretaryStudyMode = 'Nacional' | 'Internacional' | '';
export type SecretaryUseType = 'Nacional' | 'Internacional' | '';

export interface SecretaryProcedure extends BaseModel {
  id: number;
  tramite_id: string; // Central procedure UUID
  tipo_estudio: SecretaryStudyType;
  tipo_est: SecretaryStudyMode;
  uso: SecretaryUseType;
  uso_i: string;
  nombre: string;
  apellidos: string;
  ci: string;
  email: string;
  telefono: string;
  tomo: string;
  folio: string;
  numero: string;
  fecha: string;
  estado: string;
  intereses: string;
  organismo: string | null;
  organismo_op: string;
  motivo: string | null;
  funcionario: string;
  carrera: string;
  year: string;
  programa_academico: string;
  nombre_programa: string;
  tipo_pren: string;
  tipo_prei: string;
  tipo_posn: string;
  tipo_posi: string;
  legalizacion: string;
  archivo: string; // URL
}

export interface CreateSecretaryProcedureData extends Partial<Omit<SecretaryProcedure, 'id' | 'tramite_id'>> {
  archivo?: File;
}
