import type { Procedure } from "./general";

export type FeedingType = 'RESTAURANT' | 'HOTELITO';

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
  amount: number;
  feeding_days: FeedingDays[];
}
