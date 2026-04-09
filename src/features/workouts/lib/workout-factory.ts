import 'react-native-get-random-values';
import { v4 as uuid } from 'uuid';
import type {
  UserWorkout,
  WorkoutExercise,
  WorkoutSet,
  ExerciseDefaults,
  SetOverrides,
  WorkoutSummary,
} from '@/src/shared/types/user-workout.types';
import { resolveAllSets } from './inheritance';

export const GOAL_DEFAULTS: Record<string, ExerciseDefaults> = {
  hypertrophy: {
    repsTarget: 10, loadKg: 0, restSeconds: 90,
    rirTarget: 2, notes: '',
  },
  strength: {
    repsTarget: 5, loadKg: 0, restSeconds: 180,
    rirTarget: 3, notes: '',
  },
  fat_loss: {
    repsTarget: 15, loadKg: 0, restSeconds: 45,
    rirTarget: 1, notes: '',
  },
  endurance: {
    repsTarget: 20, loadKg: 0, restSeconds: 30,
    rirTarget: 0, notes: '',
  },
  beginner: {
    repsTarget: 12, loadKg: 0, restSeconds: 120,
    rirTarget: 2, notes: '',
  },
};

export function createSets(count: number): WorkoutSet[] {
  return Array.from({ length: count }, (_, i) => ({
    id: uuid(),
    setNumber: i + 1,
    overrides: {},
  }));
}

export function createExercise(
  exerciseId: string,
  order: number,
  defaults: ExerciseDefaults,
  setCount: number = 3
): WorkoutExercise {
  return {
    id: uuid(),
    exerciseId,
    order,
    defaults: { ...defaults },
    sets: createSets(setCount),
  };
}

export function createEmptyWorkout(
  userId: string,
  name: string,
  category: string = 'custom',
  goal?: string
): UserWorkout {
  const now = new Date().toISOString();
  const defaults = goal ? GOAL_DEFAULTS[goal] : GOAL_DEFAULTS.hypertrophy;

  return {
    id: uuid(),
    userId,
    name,
    category,
    dayOfWeek: [],
    order: 0,
    isArchived: false,
    exercises: [],
    version: 1,
    localUpdatedAt: now,
    syncStatus: 'local_only',
    createdAt: now,
    updatedAt: now,
  };
}

export function toSummary(workout: UserWorkout): WorkoutSummary {
  const totalSets = workout.exercises.reduce(
    (sum, ex) => sum + ex.sets.length, 0
  );

  const estimatedDurationMin = Math.round(
    totalSets * 2 + workout.exercises.length
  );

  return {
    id: workout.id,
    name: workout.name,
    category: workout.category,
    dayOfWeek: workout.dayOfWeek,
    exerciseCount: workout.exercises.length,
    totalSets,
    estimatedDurationMin,
    isArchived: workout.isArchived,
    order: workout.order,
    lastExecutedAt: undefined, 
    updatedAt: workout.updatedAt,
    syncStatus: workout.syncStatus,
  };
}

export function cloneForExecution(workout: UserWorkout): UserWorkout {
  return JSON.parse(JSON.stringify(workout));
}

export function applyOverloadSuggestion(
  workout: UserWorkout,
  exerciseIdx: number,
  newLoadKg: number
): UserWorkout {
  const clone = JSON.parse(JSON.stringify(workout)) as UserWorkout;
  clone.exercises[exerciseIdx].defaults.loadKg = newLoadKg;
  clone.localUpdatedAt = new Date().toISOString();
  clone.syncStatus = 'pending';
  return clone;
}
