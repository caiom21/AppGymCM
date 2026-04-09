import React, { memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { Exercise } from '@/src/services/exercise/exerciseTypes';
import { ExerciseImage } from './ExerciseImage';
import { MuscleChip } from './MuscleChip';
import { EquipmentIcon } from './EquipmentIcon';

interface ExerciseListItemProps {
  exercise: Exercise;
  onPress: () => void;
  onLongPress?: () => void;
  accessory?: React.ReactNode;
  className?: string;
}

/**
 * A reusable list row utilizing ExerciseImage, MuscleChip, and custom typography. 
 * Built specifically for ExerciseSearchSheet and DraggableExerciseItem migrations later.
 */
export const ExerciseListItem = memo<ExerciseListItemProps>(({
  exercise,
  onPress,
  onLongPress,
  accessory,
  className = ''
}) => {

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const handleLongPress = () => {
    if (onLongPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onLongPress();
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      onLongPress={handleLongPress}
      className={`flex-row items-center py-3 border-b border-borderColor bg-bg ${className}`}
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
    >
      <ExerciseImage
        exerciseId={exercise.id}
        bodyPart={exercise.bodyPart}
        size="md" // usually 48x48 per spec
        shape="rounded"
      />

      <View className="flex-1 ml-compact justify-center">
        <Text 
          className="text-[16px] font-semibold text-textPrimary mb-[4px] leading-tight flex-wrap"
          numberOfLines={2}
        >
          {exercise.name}
        </Text>
        
        <View className="flex-row items-center">
          <MuscleChip bodyPart={exercise.bodyPart} />
          
          {exercise.equipment && (
            <>
              <View className="w-[4px] h-[4px] rounded-full bg-textFaint mx-2" />
              <View className="flex-row items-center">
                <EquipmentIcon equipment={exercise.equipment} size={14} color="#888888" />
                <Text className="text-[12px] text-textSecondary ml-1 capitalize">
                  {exercise.equipment}
                </Text>
              </View>
            </>
          )}
        </View>
      </View>

      {accessory && (
        <View className="ml-compact">
          {accessory}
        </View>
      )}
    </Pressable>
  );
});

ExerciseListItem.displayName = 'ExerciseListItem';
