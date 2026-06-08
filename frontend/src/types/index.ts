// src/types/index.ts

export interface Job {
  id: number;
  catalogCode?: string; // รหัสอ้างอิงจาก Master Data
  name: string;
  timePerPiece: number;
  qty: number;
}

export interface JobCatalogItem {
  code: string;
  name: string;
  time: number;
}

export interface Project {
  id: number;
  name: string;
  customer: string;
  jobs: Job[];
}

export interface Employee {
  id: number;
  name: string;
  baseTime: number;
  ot: number;
  oe: number;
}

export interface EmployeeStat extends Employee {
  maxCap: number;
  actualCap: number;
}