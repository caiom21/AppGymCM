import React, { memo } from 'react';
import { View, Text, Pressable } from 'react-native';
import * as PhosphorIcons from 'phosphor-react-native';
import * as Haptics from 'expo-haptics';
import type { Exercise } from '@/src/services/exercise/exerciseTypes';
import { ExerciseImage } from './ExerciseImage';

interface ExerciseCardProps {
  exercise: Exercise;
  drag?: () => void;
  isActive?: boolean;
  onPressImage?: () => void;
  onLongPressImage?: () => void;
  onPressTitle?: () => void;
  onPressMenu?: () => void;
  children?: React.ReactNode; // For embedding sets (ExerciseSetRow)
  className?: string;
}

/**
 * The primary composite wrapper for an exercise within a workout.
 * Implements SDD v5 interactions:
 * - Drag handle (≡) with continuous haptic support (via prop)
 * - Gif tap options
 * - Ellipsis menu tap
 * Note: Actual inner `SetRow` implementation injected via `children` to keep this component highly reusable.
 */
export const ExerciseCard = memo<ExerciseCardProps>(({
  exercise,
  drag,
  isActive = false,
  onPressImage,
  onLongPressImage,
  onPressTitle,
  onPressMenu,
  children,
  className = ''
}) => {

  const handleMenuPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onPressMenu) onPressMenu();
  };

  const handleTitlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onPressTitle) onPressTitle();
  };

  const handleDragPressIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (drag) drag();
  };

  return (
    <View 
      className={`bg-surface rounded-xl p-3 border ${isActive ? 'border-primary/50 bg-surface shadow-2xl' : 'border-borderColor bg-surface/50'} ${className}`}
      style={isActive ? { elevation: 5, shadowColor: '#FBFF00', shadowOpacity: 0.1, shadowRadius: 10 } : {}}
    >
      
      {/* Header Row */}
      <View className="flex-row items-center mb-4">
        
        {/* Drag Handle */}
        {drag && (
          <Pressable onPressIn={handleDragPressIn} className="p-2 mr-1">
            <PhosphorIcons.List size={22} color="#666" weight="bold" />
          </Pressable>
        )}

        {/* Interactive Image */}
        <Pressable 
          onPress={onPressImage} 
          onLongPress={onLongPressImage}
          className="mr-3"
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        >
          <ExerciseImage 
            exerciseId={exercise.id} 
            bodyPart={exercise.bodyPart}
            size="md" // 48x48
            shape="rounded"
          />
        </Pressable>

        {/* Title and Meta */}
        <Pressable 
           onPress={handleTitlePress} 
           className="flex-1 justify-center"
           style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        >
          <Text 
            className="text-textPrimary font-mono-bold text-[16px] uppercase truncate mb-1"
            numberOfLines={2}
          >
            {exercise.name}
          </Text>
          <Text className="text-textSecondary text-[10px] font-mono uppercase tracking-widest">
             {exercise.target} • {exercise.equipment}
          </Text>
        </Pressable>

        {/* Context Menu Hook */}
        {onPressMenu && (
          <Pressable onPress={handleMenuPress} className="p-3 ml-2 bg-surface2 rounded-full border border-borderColor">
            <PhosphorIcons.DotsThreeOutlineVertical size={16} color="#FFF" weight="fill" />
          </Pressable>
        )}
      </View>

      {/* Children container (usu. the set table/rows) */}
      <View className="w-full">
         {children}
      </View>
      
    </View>
  );
});

ExerciseCard.displayName = 'ExerciseCard';
