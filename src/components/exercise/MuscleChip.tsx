import React, { memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import * as PhosphorIcons from 'phosphor-react-native';
import * as Haptics from 'expo-haptics';
import { BODY_PART_ICONS } from '@/src/constants/exercise/bodyPartIcons';

interface MuscleChipProps {
  bodyPart: string;
  selected?: boolean;
  onPress?: () => void;
  className?: string;
}

/**
 * Interactive filter chip displaying a body part and its icon.
 * Supports active/inactive states and haptic feedback.
 */
export const MuscleChip = memo<MuscleChipProps>(({ 
  bodyPart,
  selected = false,
  onPress,
  className = ''
}) => {
  const lowerBodyPart = bodyPart.toLowerCase();
  const iconName = BODY_PART_ICONS[lowerBodyPart] || 'Person';
  
  // @ts-ignore
  const IconComponent = PhosphorIcons[iconName] || PhosphorIcons.Person;

  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const containerClasses = selected
    ? 'bg-primary border-primary'
    : 'bg-surface2 border-transparent';

  const textClasses = selected
    ? 'text-bg' // Dark text on primary bg
    : 'text-textPrimary';

  const iconColor = selected ? '#0A0A0A' : '#FFFFFF'; // bg vs textPrimary

  // Format text: 'upper legs' -> 'Upper legs'
  const label = bodyPart.charAt(0).toUpperCase() + bodyPart.slice(1);

  return (
    <Pressable
      onPress={handlePress}
      disabled={!onPress}
      className={`flex-row items-center px-compact py-tight rounded-full border ${containerClasses} ${className}`}
      style={({ pressed }) => ({
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <IconComponent size={14} color={iconColor} weight={selected ? "bold" : "regular"} />
      <View className="ml-micro" />
      <Text className={`text-[12px] font-semibold tracking-wide ${textClasses}`}>
        {label}
      </Text>
    </Pressable>
  );
});

MuscleChip.displayName = 'MuscleChip';
