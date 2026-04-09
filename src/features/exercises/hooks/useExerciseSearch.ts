import { useState, useCallback } from "react";
import { exerciseService } from "../services/exercisedb.service";
import { ExerciseBase } from "../types/exercise.types";

/**
 * Hook centralizado para lidar com a busca e preenchimento dos menus do App GymOS.
 * Integra-se aos CircuitBreakers internos da camada de negócio e previne Race Conditions de React.
 */
export function useExerciseSearch() {
  const [exercises, setExercises] = useState<ExerciseBase[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const results = await exerciseService.searchExercises(query);
      setExercises(results);
    } catch (err) {
      setError((err as Error).message);
      setExercises([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const filterByTarget = useCallback((target: string) => {
    return exercises.filter(ex => ex.target.toLowerCase() === target.toLowerCase());
  }, [exercises]);

  return {
    exercises,
    isLoading,
    error,
    search,
    filterByTarget
  };
}
