import type { FeedingDays } from './feeding';
import { type Guest, type Procedure } from './general';

export type AccommodationType = 'A' | 'B';

export interface AccommodationProcedure extends Procedure {
  nombre_tramite: 'Tramite de Alojamiento';
  accommodation_type: AccommodationType;
  start_day: string;
  end_day: string;
  description: string;
  guests: Guest[];
  feeding_days?: FeedingDays[];
}
