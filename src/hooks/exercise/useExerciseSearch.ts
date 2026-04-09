import { useQuery } from '@tanstack/react-query';
import { exerciseService } from '@/src/services/exercise/exerciseService';
import type { Exercise, ExerciseSearchParams } from '@/src/services/exercise/exerciseTypes';

/**
 * Hook to perform advanced searches combining queries and filters.
 * Because text searches shouldn't be strictly cached for long, we don't set a large staleTime here.
 * Results will depend on the inner service caching behavior for combined requests.
 */
export function useExerciseSearch(params: ExerciseSearchParams) {
  return useQuery<Exercise[]>({
    queryKey: ['exerciseSearch', params],
    queryFn: () => exerciseService.searchAdvanced(params),
    // Always enabled to show default exercises on peak, unless explicitly limited
    staleTime: 5 * 60 * 1000, // 5 minutes cache for search results
  });
}
