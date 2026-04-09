import React, { forwardRef, useCallback } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { BottomSheetModal, BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import * as PhosphorIcons from 'phosphor-react-native';
import { useExercise } from '@/src/hooks/exercise/useExercise';
import { ExerciseImage } from './ExerciseImage';
import { DifficultyBadge } from './DifficultyBadge';
import { MuscleChip } from './MuscleChip';
import { EquipmentIcon } from './EquipmentIcon';
import { ExerciseInstructions } from './ExerciseInstructions';

interface ExerciseDetailSheetProps {
  exerciseId: string | null;
  onClose: () => void;
  onImageDoubleTap?: () => void; // Used to trigger ExercisePreviewModal
}

/**
 * Displays full details of an exercise in a stacked sheet. 
 * Shows HD video/gif placeholder via `ExerciseImage`, instructions, and metadata.
 */
export const ExerciseDetailSheet = forwardRef<BottomSheetModal, ExerciseDetailSheetProps>(
  ({ exerciseId, onClose, onImageDoubleTap }, ref) => {
    
    const { data: exercise, isLoading } = useExercise(exerciseId || undefined);

    const renderBackdrop = useCallback(
      (props: any) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.6} />,
      []
    );

    // Naive double tap implementation logic
    let lastTap = 0;
    const handleImagePress = () => {
      const now = Date.now();
      if (lastTap && (now - lastTap) < 300) {
        if (onImageDoubleTap) onImageDoubleTap();
      }
      lastTap = now;
    };

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={['85%']}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: '#111111' }} // surface
        handleIndicatorStyle={{ backgroundColor: '#FBFF00' }}
      >
        <BottomSheetView className="flex-1 bg-surface">
          {!exercise && isLoading ? (
            <View className="flex-1 items-center justify-center">
              <Text className="text-textSecondary">Carregando...</Text>
            </View>
          ) : !exercise ? (
            <View className="flex-1 px-section-p pt-8 items-center">
               <PhosphorIcons.WarningCircle size={32} color="#EF4444" />
               <Text className="text-textPrimary font-semibold mt-4">Exercício não encontrado</Text>
            </View>
          ) : (
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              
              {/* Header Image Full-Bleed */}
              <View className="w-full relative">
                <ExerciseImage 
                  exerciseId={exercise.id} 
                  bodyPart={exercise.bodyPart}
                  size="full" 
                  shape="square"
                  onPress={handleImagePress}
                />
                <View className="absolute top-4 right-4 bg-bg/80 rounded-full">
                  <Pressable onPress={onClose} className="p-2">
                    <PhosphorIcons.X size={20} color="#FFF" />
                  </Pressable>
                </View>
              </View>

              {/* Title and Badges */}
              <View className="px-section-p py-6">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-textPrimary font-mono-bold text-2xl uppercase tracking-tight flex-1">
                    {exercise.name}
                  </Text>
                  {/* Basic inference of difficulty since ExerciseDB lacks it natively: 
                      could be static for now or random, using beginner safely fallback */}
                  <DifficultyBadge level="beginner" className="ml-4" />
                </View>

                {/* Tags row */}
                <View className="flex-row items-center flex-wrap gap-2 mt-4">
                  <MuscleChip bodyPart={exercise.bodyPart} />
                  
                  {exercise.equipment && (
                    <View className="flex-row items-center px-3 py-1.5 rounded-full border border-borderColor bg-surface2">
                      <EquipmentIcon equipment={exercise.equipment} size={14} />
                      <Text className="text-textSecondary text-xs ml-1 capitalize">{exercise.equipment}</Text>
                    </View>
                  )}
                  
                  {exercise.target && (
                    <View className="flex-row items-center px-3 py-1.5 rounded-full border border-borderColor bg-surface2">
                      <PhosphorIcons.Target size={14} color="#F59E0B" />
                      <Text className="text-textSecondary text-xs ml-1 capitalize">{exercise.target}</Text>
                    </View>
                  )}
                </View>

                {/* Secondary Muscles */}
                {exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0 && (
                  <View className="mt-6">
                    <Text className="text-textPrimary font-semibold text-sm mb-2">Músculos Secundários</Text>
                    <View className="flex-row gap-2 flex-wrap">
                      {exercise.secondaryMuscles.map(muscle => (
                         <View key={muscle} className="px-2 py-1 rounded-md bg-surface2 border border-borderColor">
                           <Text className="text-textSecondary text-xs capitalize">{muscle}</Text>
                         </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Instructions */}
                <View className="mt-8 border-t border-borderColor pt-6">
                  <Text className="text-textPrimary font-bold text-lg mb-4">Instruções</Text>
                  <ExerciseInstructions instructions={exercise.instructions || []} />
                </View>

              </View>
            </ScrollView>
          )}
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

ExerciseDetailSheet.displayName = 'ExerciseDetailSheet';
