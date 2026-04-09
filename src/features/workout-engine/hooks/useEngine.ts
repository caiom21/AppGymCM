import { useState, useCallback, useEffect } from 'react';
import { useWorkoutExecution } from '@/src/features/workouts/hooks/useWorkoutExecution';
import { exerciseService } from '@/src/features/exercises/services/exercisedb.service';
import type { ExerciseBase } from '@/src/features/exercises/types/exercise.types';
import { resolveSetProperty } from '@/src/features/workouts/lib/inheritance';

export type EngineState = "idle" | "loading" | "ready" | "exercising" | "resting" | "between" | "success_set" | "abandoned" | "completed";

export function useEngine(workoutId: string) {
  const {
    isReady,
    resolvedExercises,
    recordSetExecution,
    adjustLoadInExecution,
    getCurrentSet,
    getExecutionResult,
  } = useWorkoutExecution(workoutId);

  const [machineState, setMachineState] = useState<EngineState>("idle");
  const [currentExerciseIdx, setCurrentExerciseIdx] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [currentSSOT, setCurrentSSOT] = useState<ExerciseBase | null>(null);
  const [restTimeLeft, setRestTimeLeft] = useState(0);

  useEffect(() => {
    if (machineState === "idle" && workoutId) {
      setMachineState("loading");
    }
    if (isReady && machineState === "loading" && resolvedExercises.length > 0) {
      setMachineState("ready");
    }
  }, [isReady, machineState, workoutId, resolvedExercises]);

  useEffect(() => {
    if (!isReady || resolvedExercises.length === 0) return;
    const exId = resolvedExercises[currentExerciseIdx]?.exerciseId;
    if (exId) {
      exerciseService.getExerciseById(exId).then(setCurrentSSOT).catch(console.error);
    }
  }, [currentExerciseIdx, isReady, resolvedExercises]);

  const completeCurrentSet = useCallback(
    (repsDone: number, loadUsed: number) => {
      recordSetExecution(currentExerciseIdx, currentSetIndex, {
        repsDone,
        loadUsed,
        completed: true,
        skipped: false,
        timestamp: new Date().toISOString(),
      });

      const exercise = resolvedExercises[currentExerciseIdx];
      const isLastSetForExercise = currentSetIndex >= exercise.resolvedSets.length - 1;
      const isLastExerciseOverall = currentExerciseIdx >= resolvedExercises.length - 1;

      const nextRest = resolveSetProperty(exercise, currentSetIndex, 'restSeconds');
      setRestTimeLeft(nextRest);

      setMachineState("success_set");
      
      setTimeout(() => {
        if (isLastSetForExercise) {
           if (isLastExerciseOverall) {
               setMachineState("completed");
           } else {
               setMachineState("between"); 
           }
        } else {
           setMachineState("resting");
           setCurrentSetIndex(prev => prev + 1);
        }
      }, 500); // Brief feedback state
    },
    [currentExerciseIdx, currentSetIndex, resolvedExercises, recordSetExecution]
  );
  
  const progressRest = useCallback(() => {
     if (machineState === "between") {
         setMachineState("exercising");
         setCurrentExerciseIdx(prev => prev + 1);
         setCurrentSetIndex(0);
     } else {
         setMachineState("exercising");
     }
  }, [machineState]);

  const startWorkout = useCallback(() => {
    if (machineState === "ready") {
       setMachineState("exercising");
    }
  }, [machineState]);

  const adjustLoad = useCallback(
    (delta: number) => {
      const current = getCurrentSet(currentExerciseIdx, currentSetIndex);
      if (!current) return;
      adjustLoadInExecution(currentExerciseIdx, currentSetIndex, current.loadKg + delta);
    },
    [currentExerciseIdx, currentSetIndex, getCurrentSet, adjustLoadInExecution]
  );

  const finishWorkout = useCallback(async () => {
    setMachineState("completed");
    const result = getExecutionResult();
    console.log("Workout Session Log Emitted!", result?.id);
    return result;
  }, [getExecutionResult]);

  return {
    isReady,
    state: machineState,
    currentExerciseIdx,
    currentSetIndex,
    restTimeLeft,
    currentSSOT,
    resolvedExercises,
    getCurrentSet,
    startWorkout,
    completeCurrentSet,
    progressRest,
    adjustLoad,
    finishWorkout
  };
}
