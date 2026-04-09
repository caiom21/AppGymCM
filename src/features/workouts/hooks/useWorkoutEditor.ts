import { useCallback, useMemo } from 'react';
import { useUserWorkoutsStore } from '../store/user-workouts.store';
import { resolveSet, resolveAllSets, wouldChangeOtherSets } from '../lib/inheritance';
import type {
  ResolvedSet,
  SetOverrides,
  ExerciseDefaults,
} from '@/src/shared/types/user-workout.types';

export function useWorkoutEditor(workoutId: string) {
  const {
    loadWorkout,
    addExercise,
    removeExercise,
    updateExerciseDefaults,
    reorderExercises,
    addSet,
    removeSet,
    updateSetOverride,
    clearSetOverride,
    applyDefaultsToAllSets,
  } = useUserWorkoutsStore();

  const workout = useUserWorkoutsStore(s => s.getWorkout(workoutId));
  const loading = useUserWorkoutsStore(s => s.loadingWorkoutIds.has(workoutId));

  const ensureLoaded = useCallback(async () => {
    if (!workout) {
      await loadWorkout(workoutId);
    }
  }, [workout, workoutId, loadWorkout]);

  const resolvedExercises = useMemo(() => {
    if (!workout) return [];
    return workout.exercises.map(exercise => ({
      ...exercise,
      resolvedSets: resolveAllSets(exercise),
    }));
  }, [workout]);

  const addExerciseToWorkout = useCallback(
    (exerciseId: string, defaults: ExerciseDefaults, setCount?: number) => {
      addExercise(workoutId, exerciseId, defaults, setCount);
    },
    [workoutId, addExercise]
  );

  const removeExerciseFromWorkout = useCallback(
    (exerciseIdx: number) => removeExercise(workoutId, exerciseIdx),
    [workoutId, removeExercise]
  );

  const changeExerciseDefaults = useCallback(
    (exerciseIdx: number, defaults: Partial<ExerciseDefaults>) =>
      updateExerciseDefaults(workoutId, exerciseIdx, defaults),
    [workoutId, updateExerciseDefaults]
  );

  const moveExercise = useCallback(
    (fromIdx: number, toIdx: number) =>
      reorderExercises(workoutId, fromIdx, toIdx),
    [workoutId, reorderExercises]
  );

  const addSetToExercise = useCallback(
    (exerciseIdx: number) => addSet(workoutId, exerciseIdx),
    [workoutId, addSet]
  );

  const removeSetFromExercise = useCallback(
    (exerciseIdx: number, setIdx: number) =>
      removeSet(workoutId, exerciseIdx, setIdx),
    [workoutId, removeSet]
  );

  const overrideSetProperty = useCallback(
    (
      exerciseIdx: number,
      setIdx: number,
      overrides: Partial<SetOverrides>
    ) => updateSetOverride(workoutId, exerciseIdx, setIdx, overrides),
    [workoutId, updateSetOverride]
  );

  const resetSetToInherit = useCallback(
    (
      exerciseIdx: number,
      setIdx: number,
      field: keyof SetOverrides
    ) => clearSetOverride(workoutId, exerciseIdx, setIdx, field),
    [workoutId, clearSetOverride]
  );

  const resetAllSetsToDefaults = useCallback(
    (exerciseIdx: number) => applyDefaultsToAllSets(workoutId, exerciseIdx),
    [workoutId, applyDefaultsToAllSets]
  );

  const previewDefaultChange = useCallback(
    (
      exerciseIdx: number,
      property: keyof SetOverrides,
      newValue: number
    ) => {
      if (!workout) return { unchanged: [], changed: [] };
      return wouldChangeOtherSets(
        workout.exercises[exerciseIdx],
        0, 
        property,
        newValue
      );
    },
    [workout]
  );

  return {
    workout,
    loading,
    ensureLoaded,
    resolvedExercises,
    addExercise: addExerciseToWorkout,
    removeExercise: removeExerciseFromWorkout,
    updateDefaults: changeExerciseDefaults,
    reorderExercises: moveExercise,
    addSet: addSetToExercise,
    removeSet: removeSetFromExercise,
    overrideSetProperty,
    resetSetToInherit,
    resetAllSetsToDefaults,
    previewDefaultChange,
  };
}
