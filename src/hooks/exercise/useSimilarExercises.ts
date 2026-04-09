import { useQuery } from '@tanstack/react-query';
import { exerciseService } from '@/src/services/exercise/exerciseService';
import type { Exercise } from '@/src/services/exercise/exerciseTypes';
import { CacheTTL } from '@/src/services/exercise/exerciseTypes';

/**
 * Hook to find similar exercises based on the target muscle or body part.
 * Prioritizes checking by target muscle first, as that is more specific.
 */
export function useSimilarExercises(exercise: Exercise | null | undefined, limit: number = 10) {
  return useQuery<Exercise[]>({
    queryKey: ['similarExercises', exercise?.id],
    queryFn: async () => {
      if (!exercise) return [];

      let results: Exercise[] = [];
      
      // Try by target muscle first for better accuracy
      if (exercise.target) {
        results = await exerciseService.getByTarget(exercise.target, limit + 1);
        results = results.filter(e => e.id !== exercise.id);
      }
      
      // Fallback to body part if target isn't returning enough
      if (results.length === 0 && exercise.bodyPart) {
         results = await exerciseService.getByBodyPart(exercise.bodyPart, limit + 1);
         results = results.filter(e => e.id !== exercise.id);
      }
      
      return results.slice(0, limit);
    },
    enabled: !!exercise?.id,
    staleTime: CacheTTL.EXERCISES_BY_TARGET,
  });
}
