import type {
  WorkoutExercise,
  WorkoutSet,
  SetOverrides,
  ResolvedSet,
} from '@/src/shared/types/user-workout.types';

export function resolveSetProperty<K extends keyof SetOverrides>(
  exercise: WorkoutExercise,
  setIndex: number,
  property: K
): number {
  const set = exercise.sets[setIndex];
  if (!set) return 0;

  const overrideValue = set.overrides[property];

  if (overrideValue !== undefined) {
    return overrideValue;
  }

  const defaultMap: Record<keyof SetOverrides, () => number> = {
    repsTarget: () => exercise.defaults.repsTarget,
    loadKg: () => exercise.defaults.loadKg,
    restSeconds: () => exercise.defaults.restSeconds,
    rirTarget: () => exercise.defaults.rirTarget,
    tempoUp: () => exercise.defaults.tempoUp ?? 0,
    tempoPause: () => exercise.defaults.tempoPause ?? 0,
    tempoDown: () => exercise.defaults.tempoDown ?? 0,
  };

  return defaultMap[property]();
}

export function resolveSet(
  exercise: WorkoutExercise,
  setIndex: number
): ResolvedSet {
  const set = exercise.sets[setIndex];
  if (!set) {
    throw new Error(`Set index ${setIndex} out of bounds for exercise ${exercise.id}`);
  }

  const allKeys: (keyof SetOverrides)[] = [
    'repsTarget', 'loadKg', 'restSeconds', 'rirTarget',
    'tempoUp', 'tempoPause', 'tempoDown',
  ];

  const overriddenFields = allKeys.filter(
    key => set.overrides[key] !== undefined
  );

  return {
    ...set,
    repsTarget: resolveSetProperty(exercise, setIndex, 'repsTarget'),
    loadKg: resolveSetProperty(exercise, setIndex, 'loadKg'),
    restSeconds: resolveSetProperty(exercise, setIndex, 'restSeconds'),
    rirTarget: resolveSetProperty(exercise, setIndex, 'rirTarget'),
    tempoUp: resolveSetProperty(exercise, setIndex, 'tempoUp'),
    tempoPause: resolveSetProperty(exercise, setIndex, 'tempoPause'),
    tempoDown: resolveSetProperty(exercise, setIndex, 'tempoDown'),
    hasOverrides: overriddenFields.length > 0,
    overriddenFields,
  };
}

export function resolveAllSets(
  exercise: WorkoutExercise
): ResolvedSet[] {
  return exercise.sets.map((_, idx) => resolveSet(exercise, idx));
}

export function wouldChangeOtherSets(
  exercise: WorkoutExercise,
  setIndex: number,
  property: keyof SetOverrides,
  newValue: number
): { unchanged: number[]; changed: number[] } {
  const currentEffective = resolveSetProperty(exercise, setIndex, property);
  if (newValue === currentEffective) {
    return { unchanged: exercise.sets.map((_, i) => i), changed: [] };
  }

  const unchanged: number[] = [];
  const changed: number[] = [];

  exercise.sets.forEach((s, i) => {
    const otherEffective = resolveSetProperty(exercise, i, property);
    if (otherEffective === currentEffective) {
      changed.push(i);
    } else {
      unchanged.push(i);
    }
  });

  return { unchanged, changed };
}
