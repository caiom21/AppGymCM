import { useQuery } from '@tanstack/react-query';
import { exerciseService } from '@/src/services/exercise/exerciseService';
import { CacheTTL } from '@/src/services/exercise/exerciseTypes';

/**
 * Hook to fetch the list of all available body parts.
 */
export function useBodyPartList() {
  return useQuery<string[]>({
    queryKey: ['bodyPartList'],
    queryFn: () => exerciseService.getBodyPartList(),
    staleTime: CacheTTL.BODY_PART_LIST, 
  });
}
