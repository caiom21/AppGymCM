import { useQuery } from '@tanstack/react-query';
import { exerciseService } from '@/src/services/exercise/exerciseService';
import type { Exercise } from '@/src/services/exercise/exerciseTypes';
import { CacheTTL } from '@/src/services/exercise/exerciseTypes';

/**
 * Hook to fetch a paginated list of all exercises.
 */
export function useExerciseList(limit: number = 50, offset: number = 0) {
  return useQuery<Exercise[]>({
    queryKey: ['exerciseList', limit, offset],
    queryFn: () => exerciseService.getAll(limit, offset),
    staleTime: CacheTTL.EXERCISES_ALL, 
  });
}
