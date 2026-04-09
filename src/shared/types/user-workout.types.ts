export interface SetOverrides {
  repsTarget?: number;
  loadKg?: number;
  restSeconds?: number;
  rirTarget?: number;
  tempoUp?: number;      // segundos fase excêntrica
  tempoPause?: number;   // segundos pausa no pico
  tempoDown?: number;    // segundos fase concêntrica
}

export interface SetExecution {
  repsDone: number;
  loadUsed: number;
  completed: boolean;
  skipped: boolean;
  rpe?: number;          // 1-10, opcional
  timestamp: string;     // ISO
}

export interface WorkoutSet {
  id: string;
  setNumber: number;
  overrides: SetOverrides;
  execution?: SetExecution;
}

export interface ExerciseDefaults {
  repsTarget: number;
  loadKg: number;
  restSeconds: number;
  rirTarget: number;
  tempoUp?: number;
  tempoPause?: number;
  tempoDown?: number;
  notes: string;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;      // FK → ExerciseBase (SSOT do exercício)
  order: number;            // posição dentro do treino
  defaults: ExerciseDefaults;
  sets: WorkoutSet[];
  supersetGroupId?: string; // agrupamento para bi-set / tri-set
}

export interface WorkoutSummary {
  id: string;
  name: string;
  category: string;
  dayOfWeek: number[];
  exerciseCount: number;
  totalSets: number;
  estimatedDurationMin: number;
  isArchived: boolean;
  order: number;
  lastExecutedAt?: string;
  updatedAt: string;
  syncStatus: SyncStatus;
}

export type SyncStatus = 'synced' | 'pending' | 'conflict' | 'local_only';

export interface UserWorkout {
  id: string;
  userId: string;
  name: string;
  description?: string;
  category: string;
  dayOfWeek: number[];
  order: number;
  isArchived: boolean;

  // ── O dado pesado: exercícios com sérias ──
  exercises: WorkoutExercise[];

  // ── Proveniência ──
  sourcePlanId?: string;
  sourceTemplateId?: string;
  version: number;

  // ── Sync ──
  localUpdatedAt: string;
  remoteUpdatedAt?: string;
  syncStatus: SyncStatus;

  createdAt: string;
  updatedAt: string;
}

export interface ResolvedSet extends WorkoutSet {
  repsTarget: number;
  loadKg: number;
  restSeconds: number;
  rirTarget: number;
  tempoUp: number;
  tempoPause: number;
  tempoDown: number;
  hasOverrides: boolean; 
  overriddenFields: (keyof SetOverrides)[];
}
