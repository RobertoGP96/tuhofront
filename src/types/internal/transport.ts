import type { Procedure } from "./general";

export interface TransportProcedureType {
  id: number;
  name: string;
}

export interface TransportProcedure extends Procedure {
  nombre_tramite: 'Tramite de Transporte';
  procedure_type: TransportProcedureType | null;
  departure_time: string; // ISO datetime string
  return_time: string;    // ISO datetime string
  departure_place: string;
  return_place: string;
  passengers: number;
  description: string;
  plate: string | null;   // Placa del vehículo
  round_trip: boolean;    // Indica si es un viaje redondo
}
