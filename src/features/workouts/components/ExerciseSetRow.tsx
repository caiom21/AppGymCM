import React, { memo, useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { resolveSet } from '../lib/inheritance';
import type { WorkoutExercise, ResolvedSet } from '@/src/shared/types/user-workout.types';

interface ExerciseSetRowProps {
  exercise: WorkoutExercise;
  setIndex: number;
  onOverride: (setIdx: number, field: string, value: number) => void;
  onResetOverride: (setIdx: number, field: string) => void;
  isEditing: boolean;
}

const ExerciseSetRow = memo(function ExerciseSetRow({
  exercise,
  setIndex,
  onOverride,
  onResetOverride,
  isEditing,
}: ExerciseSetRowProps) {
  const resolved: ResolvedSet = resolveSet(exercise, setIndex);

  const handleFieldPress = useCallback(
    (field: keyof typeof resolved) => {
      if (!isEditing) return;

      if (resolved.overriddenFields.includes(field as any)) {
        onResetOverride(setIndex, field);
      } else {
        openValuePicker(field, resolved[field] as number, (newValue) => {
          onOverride(setIndex, field, newValue);
        });
      }
    },
    [isEditing, resolved, setIndex, onOverride, onResetOverride]
  );

  return (
    <View className="flex-row items-center py-2 px-3 border-b border-white/5">
      <Text className="w-7 text-center font-mono text-sm text-textSecondary">{resolved.setNumber}</Text>

      <SetFieldCell
        label="Reps"
        value={resolved.repsTarget}
        isOverridden={resolved.overriddenFields.includes('repsTarget')}
        onPress={() => handleFieldPress('repsTarget')}
        editable={isEditing}
      />

      <SetFieldCell
        label="Kg"
        value={resolved.loadKg}
        isOverridden={resolved.overriddenFields.includes('loadKg')}
        onPress={() => handleFieldPress('loadKg')}
        editable={isEditing}
      />

      <SetFieldCell
        label="Desc"
        value={resolved.restSeconds}
        isOverridden={resolved.overriddenFields.includes('restSeconds')}
        suffix="s"
        onPress={() => handleFieldPress('restSeconds')}
        editable={isEditing}
      />

      <SetFieldCell
        label="RIR"
        value={resolved.rirTarget}
        isOverridden={resolved.overriddenFields.includes('rirTarget')}
        onPress={() => handleFieldPress('rirTarget')}
        editable={isEditing}
      />
    </View>
  );
});

const SetFieldCell = memo(function SetFieldCell({
  label,
  value,
  isOverridden,
  suffix,
  onPress,
  editable,
}: {
  label: string;
  value: number;
  isOverridden: boolean;
  suffix?: string;
  onPress: () => void;
  editable: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!editable}
      activeOpacity={editable ? 0.6 : 1}
      className={`flex-1 items-center py-1.5 mx-0.5 rounded-lg border relative ${
        isOverridden 
          ? 'bg-primary/10 border-primary/30' 
          : 'bg-white/5 border-transparent'
      }`}
    >
      <Text className="text-[10px] text-textTertiary mb-0.5">{label}</Text>
      <Text className={`font-mono text-sm ${isOverridden ? 'text-primary font-bold' : 'text-textPrimary'}`}>
        {value}{suffix ?? ''}
      </Text>
      {isOverridden && (
        <View className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-primary" />
      )}
    </TouchableOpacity>
  );
});

function openValuePicker(
  _field: string,
  _currentValue: number,
  _onConfirm: (value: number) => void
) {
  // Quick test patch to automatically invoke the override state loop
  _onConfirm(_currentValue + 2.5);
}

export { ExerciseSetRow };
