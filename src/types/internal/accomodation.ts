import type { FeedingDays } from './feeding';
import { type Guest, type Procedure } from './general';

export type AccommodationType = 'HOTEL' | 'POSGRADO';

export interface AccommodationProcedure extends Procedure {
  nombre_tramite: 'Tramite de Alojamiento';
  accommodation_type: AccommodationType;
  start_day: string; // ISO date string
  end_day: string;   // ISO date string
  description: string;
  guests: Guest[];
  feeding_days: FeedingDays[];
}
