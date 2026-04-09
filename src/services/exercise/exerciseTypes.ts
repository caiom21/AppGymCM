/**
 * Exercise type definitions for the ExerciseDB integration layer.
 * These types represent the normalized data model used throughout the app.
 *
 * Backward Compatibility:
 *   ExerciseBase is re-exported as a deprecated alias of Exercise
 *   so existing imports continue to work during migration.
 *
 * @module services/exercise/exerciseTypes
 */

// ── Core Exercise Type ──

export interface Exercise {
  id: string;
  name: string;
  bodyPart: string;
  target: string;
  secondaryMuscles: string[];
  equipment: string;
  instructions: string[];
  gifUrl: string;
}

// ── Search / Filter Types ──

export interface ExerciseSearchParams {
  query?: string;
  bodyPart?: string;
  target?: string;
  equipment?: string;
  limit?: number;
  offset?: number;
}

// ── Cache TTL Values (milliseconds) ──

export const CacheTTL = {
  /** GET /exercises — general listing */
  EXERCISES_ALL: 24 * 60 * 60 * 1000,           // 24h

  /** GET /exercises/exercise/{id} — single exercise */
  EXERCISE_BY_ID: 7 * 24 * 60 * 60 * 1000,      // 7 days

  /** GET /exercises/bodyPart/{bp} — filter by body part */
  EXERCISES_BY_BODY_PART: 12 * 60 * 60 * 1000,   // 12h

  /** GET /exercises/target/{t} — filter by target muscle */
  EXERCISES_BY_TARGET: 12 * 60 * 60 * 1000,       // 12h

  /** GET /exercises/equipment/{e} — filter by equipment */
  EXERCISES_BY_EQUIPMENT: 12 * 60 * 60 * 1000,    // 12h

  /** GET /exercises/bodyPartList — list of body parts */
  BODY_PART_LIST: 30 * 24 * 60 * 60 * 1000,       // 30 days

  /** GET /exercises/targetList — list of target muscles */
  TARGET_LIST: 30 * 24 * 60 * 60 * 1000,          // 30 days

  /** GET /exercises/equipmentList — list of equipment */
  EQUIPMENT_LIST: 30 * 24 * 60 * 60 * 1000,       // 30 days
} as const;

// ── Image Resolution Types ──

export type ImageSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
export type ImageResolution = 180 | 360 | 720;

export interface SizeConfig {
  width: number;
  height: number;
  borderRadius: number;
  resolution: ImageResolution;
}

export const SIZE_CONFIG: Record<ImageSize, SizeConfig> = {
  xs:   { width: 32,  height: 32,  borderRadius: 8,  resolution: 180 },
  sm:   { width: 40,  height: 40,  borderRadius: 10, resolution: 180 },
  md:   { width: 48,  height: 48,  borderRadius: 12, resolution: 360 },
  lg:   { width: 56,  height: 56,  borderRadius: 12, resolution: 360 },
  xl:   { width: 120, height: 120, borderRadius: 16, resolution: 720 },
  full: { width: 280, height: 280, borderRadius: 20, resolution: 720 },
};

// ── Circuit Breaker State Types ──

export type CircuitState = 'closed' | 'open' | 'half-open';

// ── API Error Types ──

export type ExerciseApiErrorCode =
  | 'API_UNAVAILABLE'
  | 'RATE_LIMITED'
  | 'NOT_FOUND'
  | 'IMAGE_LOAD_FAILED'
  | 'OFFLINE'
  | 'MALFORMED_RESPONSE'
  | 'AUTH_EXPIRED'
  | 'TIMEOUT';

export class ExerciseApiError extends Error {
  constructor(
    message: string,
    public readonly code: ExerciseApiErrorCode,
    public readonly statusCode?: number,
    public readonly retryAfter?: number,
  ) {
    super(message);
    this.name = 'ExerciseApiError';
  }
}

// ── Backward Compatibility ──

/**
 * @deprecated Use `Exercise` instead. This alias exists for backward
 * compatibility with code that imports `ExerciseBase` from the old
 * `features/exercises/types/exercise.types.ts` module.
 */
export type ExerciseBase = Exercise;

/**
 * @deprecated Use the new LiveExercise type from the workout-engine store.
 * This interface is kept for consumers that still reference the old type.
 */
export interface WorkoutExercise extends Exercise {
  sets: number;
  reps: number;
  weight: number;
  restTime: number;
  completed: boolean[];
}
