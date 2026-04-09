import { useState, useEffect } from 'react';
import { 
  buildFallbackChain, 
  getFallbackImage 
} from '@/src/services/exercise/exerciseMediaResolver';
import type { ImageResolution, ImageSize } from '@/src/services/exercise/exerciseTypes';
import { SIZE_CONFIG } from '@/src/services/exercise/exerciseTypes';
import { EXERCISE_IMAGE_HEADERS } from '@/src/services/exercise/exerciseMediaResolver';

export type MediaState = 'loading' | 'loaded' | 'error';

/**
 * Hook to manage the 4-layer fallback state for images.
 * Determines the correct resolution based on size, builds the fallback chain,
 * and tracks the state of the image loading.
 */
export function useExerciseMedia(exerciseId: string, size: ImageSize, bodyPart?: string) {
  const [status, setStatus] = useState<MediaState>('loading');
  const [fallbackIndex, setFallbackIndex] = useState(0);

  // Re-run fallback chain logic if the ID or size changes
  useEffect(() => {
    setStatus('loading');
    setFallbackIndex(0);
  }, [exerciseId, size]);

  const config = SIZE_CONFIG[size];
  const fallbackUrls = buildFallbackChain(exerciseId, config.resolution);

  const handleError = () => {
    if (fallbackIndex < fallbackUrls.length - 1) {
      // Try next lower resolution (Layer 2)
      setFallbackIndex(prev => prev + 1);
    } else {
      // All URLs failed, fall back to local asset (Layer 3 & 4)
      setStatus('error');
    }
  };

  const handleLoad = () => {
    setStatus('loaded');
  };

  const currentSource = status === 'error' 
    ? getFallbackImage(bodyPart) 
    : { uri: fallbackUrls[fallbackIndex], headers: EXERCISE_IMAGE_HEADERS };

  return {
    status,
    currentSource,
    handleError,
    handleLoad,
    config
  };
}
