export interface DiveScore {
  dive: string;
  award: number;
  dd: number;
  j1: number;
  j2: number;
  j3: number;
  j4: number;
  j5: number;
  pr?: boolean;
}

export interface Result {
  id: number;
  event: string;
  score: number;
  meet: string;
  date: string;
  dives: DiveScore[];
}
