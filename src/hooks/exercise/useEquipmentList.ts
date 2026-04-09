import { useQuery } from '@tanstack/react-query';
import { exerciseService } from '@/src/services/exercise/exerciseService';
import { CacheTTL } from '@/src/services/exercise/exerciseTypes';

/**
 * Hook to fetch the list of all available equipment types.
 */
export function useEquipmentList() {
  return useQuery<string[]>({
    queryKey: ['equipmentList'],
    queryFn: () => exerciseService.getEquipmentList(),
    staleTime: CacheTTL.EQUIPMENT_LIST, 
  });
}
