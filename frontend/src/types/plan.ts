// src/types/plan.ts
export interface Job {
  catalogCode: string;
  name: string;
  timePerPiece: number;
  qty: number;
}

export interface Project {
  name: string;
  customer: string;
  jobs: Job[];
}

export interface Manpower {
  id: string;
  ot: number;
  oe: number;
}

export interface DailyPlanPayload {
  date: string; // ISO String
  totalWorkload: number;
  totalCapacity: number;
  estimatedDays: number;
  projects: Project[];
  manpowers: Manpower[];
}