import React, { memo } from 'react';
import { View, Text } from 'react-native';

interface ExerciseInstructionsProps {
  instructions: string[];
  className?: string;
}

/**
 * Formats a list of instructions cleanly, applying standard typography
 * and numbering layout.
 */
export const ExerciseInstructions = memo<ExerciseInstructionsProps>(({ instructions, className = '' }) => {
  if (!instructions || instructions.length === 0) return null;

  return (
    <View className={`w-full ${className}`}>
      {instructions.map((step, index) => (
        <View key={`step-${index}`} className="flex-row mb-compact last:mb-0">
          <View className="w-6 h-6 rounded-full bg-surface2 items-center justify-center mr-tight mt-[2px]">
            <Text className="text-primary text-[11px] font-mono-bold">
              {index + 1}
            </Text>
          </View>
          <Text className="text-textSecondary flex-1 text-[14px] leading-[22px]">
            {step}
          </Text>
        </View>
      ))}
    </View>
  );
});

ExerciseInstructions.displayName = 'ExerciseInstructions';
