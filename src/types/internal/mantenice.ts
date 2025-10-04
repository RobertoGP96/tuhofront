import type { Procedure } from "./general";

export interface MaintanceProcedureType {
  id: number;
  name: string;
}

export interface MaintancePriority {
  id: number;
  name: string;
}

export interface MaintanceProcedure extends Procedure {
  nombre_tramite: 'Tramite de Mantenimiento';
  description: string;
  picture?: string | null; // URL o path de la imagen
  procedure_type: MaintanceProcedureType | null;
  priority: MaintancePriority | null;
}

