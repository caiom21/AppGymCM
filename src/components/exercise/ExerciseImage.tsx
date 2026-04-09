import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useExerciseMedia } from '@/src/hooks/exercise/useExerciseMedia';
import type { ImageSize } from '@/src/services/exercise/exerciseTypes';
import * as PhosphorIcons from 'phosphor-react-native';

interface ExerciseImageProps {
  exerciseId: string;
  bodyPart?: string;
  size: ImageSize;
  shape?: 'square' | 'rounded' | 'circle';
  onPress?: () => void;
  onLongPress?: () => void;
  className?: string;
}

/**
 * Visualise an exercise image, utilizing the 4-layer fallback hook.
 * Uses standard React Native Image because react-native-fast-image 
 * has peer dependency conflicts with React 19 (Expo SDK 54).
 * RN Image natively supports HTTP headers in the source object.
 */
export const ExerciseImage = memo<ExerciseImageProps>(({ 
  exerciseId, 
  bodyPart, 
  size, 
  shape = 'rounded',
  onPress,
  onLongPress,
  className = ''
}) => {
  const { status, currentSource, handleError, handleLoad, config } = useExerciseMedia(exerciseId, size, bodyPart);

  // Shape to exact tailwind rounded class
  const roundedClass = shape === 'circle' ? 'rounded-full' 
    : shape === 'rounded' ? 'rounded-xl' 
    : 'rounded-none';

  return (
    <View 
      className={`overflow-hidden bg-surface2 items-center justify-center ${roundedClass} ${className}`}
      style={{ width: config.width, height: config.height }}
      onTouchEnd={onPress} // simple standard bindings without heavy gesture handler for now
    >
      {/* 
        Using expo-image for high-performance GIF support and caching.
        It natively handles headers and has better React 19 compatibility.
      */}
      <Image
        source={currentSource as any}
        style={[StyleSheet.absoluteFillObject, { width: config.width, height: config.height }]}
        contentFit="cover"
        transition={200}
        cachePolicy="memory-disk"
        onError={handleError}
        onLoad={handleLoad}
      />
      
      {/* Loading Skeleton Overlay */}
      {status === 'loading' && (
        <View className="absolute inset-0 bg-surface2 items-center justify-center">
           {/* Shimmer proxy for now: just a static placeholder icon until loaded per spec 'skeleton' */}
           <PhosphorIcons.Image size={24} color="#444444" weight="light" />
        </View>
      )}
    </View>
  );
});

ExerciseImage.displayName = 'ExerciseImage';
