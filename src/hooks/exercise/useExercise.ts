import { useQuery } from '@tanstack/react-query';
import { exerciseService } from '@/src/services/exercise/exerciseService';
import type { Exercise } from '@/src/services/exercise/exerciseTypes';
import { CacheTTL } from '@/src/services/exercise/exerciseTypes';

/**
 * Hook to fetch a single exercise by ID.
 * Returns the cached value if available, otherwise fetches from API.
 * Uses a generic staleTime of 7 days to match the manual cache TTL.
 */
export function useExercise(id: string | undefined) {
  return useQuery<Exercise | null>({
    queryKey: ['exercise', id],
    queryFn: () => exerciseService.getById(id!),
    enabled: !!id,
    // Match the custom TTL
    staleTime: CacheTTL.EXERCISE_BY_ID, 
  });
}
