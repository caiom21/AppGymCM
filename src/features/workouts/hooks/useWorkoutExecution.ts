import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useUserWorkoutsStore } from '../store/user-workouts.store';
import { resolveSet, resolveAllSets } from '../lib/inheritance';
import { cloneForExecution } from '../lib/workout-factory';
import type {
  UserWorkout,
  ResolvedSet,
  SetExecution,
} from '@/src/shared/types/user-workout.types';

export function useWorkoutExecution(workoutId: string) {
  const loadWorkout = useUserWorkoutsStore(s => s.loadWorkout);
  // eslint-disable-next-line
  const originalWorkout = useUserWorkoutsStore(s => s.getWorkout(workoutId));

  const executionRef = useRef<UserWorkout | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const workout = await loadWorkout(workoutId);
      if (workout && !cancelled) {
        executionRef.current = cloneForExecution(workout);
      }
    }

    init();
    return () => { cancelled = true; };
  }, [workoutId, loadWorkout]);

  const execWorkout = executionRef.current;

  const resolvedExercises = useMemo(() => {
    if (!execWorkout) return [];
    return execWorkout.exercises.map(exercise => ({
      ...exercise,
      resolvedSets: resolveAllSets(exercise),
    }));
  }, [execWorkout]);

  const recordSetExecution = useCallback(
    (
      exerciseIdx: number,
      setIdx: number,
      execution: SetExecution
    ) => {
      if (!executionRef.current) return;
      executionRef.current.exercises[exerciseIdx].sets[setIdx].execution =
        execution;
    },
    []
  );

  const adjustLoadInExecution = useCallback(
    (exerciseIdx: number, setIdx: number, newLoadKg: number) => {
      if (!executionRef.current) return;
      const set =
        executionRef.current.exercises[exerciseIdx].sets[setIdx];
      set.overrides.loadKg = newLoadKg;
    },
    []
  );

  const getCurrentSet = useCallback(
    (exerciseIdx: number, setIdx: number): ResolvedSet | null => {
      if (!executionRef.current) return null;
      const exercise = executionRef.current.exercises[exerciseIdx];
      if (!exercise) return null;
      return resolveSet(exercise, setIdx);
    },
    []
  );

  const getExecutionResult = useCallback((): UserWorkout | null => {
    return executionRef.current;
  }, []);

  return {
    isReady: !!execWorkout,
    resolvedExercises,
    recordSetExecution,
    adjustLoadInExecution,
    getCurrentSet,
    getExecutionResult,
  };
}
