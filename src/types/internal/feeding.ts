import type { Procedure } from "./general";

export type FeedingType = 'A' | 'B';

export interface FeedingDays {
  id?: number;
  date: Date; // ISO date string
  breakfast: number;
  lunch: number;
  dinner: number;
  snack: number;
}

export interface FeedingProcedure extends Procedure {
  nombre_tramite: "Trámite de Alimentación";
  feeding_type: FeedingType;
  start_day: string; // ISO date string
  end_day: string;   // ISO date string
  description: string;
  ammount: number;
  feeding_days: FeedingDays[];
}
