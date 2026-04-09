import React, { memo } from 'react';
import { View, Text } from 'react-native';
import { DIFFICULTY_COLORS } from '@/src/constants/exercise/difficultyColors';

interface DifficultyBadgeProps {
  level: 'beginner' | 'intermediate' | 'advanced';
  className?: string;
}

/**
 * A rounded pill badge displaying the workout difficulty level 
 * using semantic NativeWind colors defined in SDD v5.
 */
export const DifficultyBadge = memo<DifficultyBadgeProps>(({ level, className = '' }) => {
  const colorToken = DIFFICULTY_COLORS[level] || 'bg-surface2 text-textSecondary';
  
  // Format text: 'beginner' -> 'Beginner'
  const label = level.charAt(0).toUpperCase() + level.slice(1);

  return (
    <View className={`px-2 py-1 rounded-full ${colorToken} ${className}`}>
      <Text className="text-[10px] font-mono-bold uppercase tracking-wider text-textPrimary opacity-90">
        {label}
      </Text>
    </View>
  );
});

DifficultyBadge.displayName = 'DifficultyBadge';
