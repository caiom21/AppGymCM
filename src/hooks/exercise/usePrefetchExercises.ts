import { useCallback } from 'react';
import { exerciseService } from '@/src/services/exercise/exerciseService';

/**
 * Hook providing a fire-and-forget prefetch procedure for app launch.
 * Preloads definitions and caches them for offline/fast access.
 */
export function usePrefetchExercises() {
  const prefetch = useCallback(async (exerciseIds: string[]) => {
    try {
      await exerciseService.prefetchTodayExercises(exerciseIds);
    } catch (e) {
      console.warn('[usePrefetchExercises] Prefetch failed', e);
    }
  }, []);

  return { prefetch };
}
