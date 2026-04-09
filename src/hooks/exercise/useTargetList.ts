import { useQuery } from '@tanstack/react-query';
import { exerciseService } from '@/src/services/exercise/exerciseService';
import { CacheTTL } from '@/src/services/exercise/exerciseTypes';

/**
 * Hook to fetch the list of all available target muscles.
 */
export function useTargetList() {
  return useQuery<string[]>({
    queryKey: ['targetList'],
    queryFn: () => exerciseService.getTargetList(),
    staleTime: CacheTTL.TARGET_LIST, 
  });
}
