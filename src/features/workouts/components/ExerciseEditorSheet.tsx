import React, { forwardRef, useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import { BottomSheetModal, BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Plus, Trash } from 'phosphor-react-native';
import { useWorkoutEditor } from '@/src/features/workouts/hooks/useWorkoutEditor';
import { ExerciseSetRow } from './ExerciseSetRow';

interface ExerciseEditorSheetProps {
  workoutId: string;
  exerciseIdx: number | null;
}

export const ExerciseEditorSheet = forwardRef<BottomSheetModal, ExerciseEditorSheetProps>(
  ({ workoutId, exerciseIdx }, ref) => {
    const { 
      resolvedExercises, 
      overrideSetProperty, 
      resetSetToInherit, 
      addSet, 
      removeSet 
    } = useWorkoutEditor(workoutId);

    const exercise = exerciseIdx !== null ? resolvedExercises[exerciseIdx] : null;

    const renderBackdrop = useCallback(
      (props: any) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />,
      []
    );

    const handleOverride = (setIdx: number, field: string, value: number) => {
      if (exerciseIdx === null) return;
      overrideSetProperty(exerciseIdx, setIdx, { [field]: value });
    };

    const handleReset = (setIdx: number, field: string) => {
      if (exerciseIdx === null) return;
      resetSetToInherit(exerciseIdx, setIdx, field as any);
    };

    if (!exercise || exerciseIdx === null) return null;

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={['50%', '80%']}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: '#1A1A1A' }}
        // Bug fix: use design system primary color instead of mismatched #0FF033
        handleIndicatorStyle={{ backgroundColor: '#FBFF00' }}
      >
        <BottomSheetView className="flex-1 bg-surface px-6 pt-4 pb-8">
          <View className="mb-6 flex-row justify-between items-center border-b border-borderColor pb-4">
            <View>
              <Text className="text-textFaint font-mono text-[9px] uppercase tracking-widest">
                Modificador de Overrides
              </Text>
              <Text className="text-primary font-mono-bold text-lg uppercase">
                Ajuste Fino
              </Text>
            </View>
            <View className="flex-row items-center gap-4">
              <Pressable 
                onPress={() => addSet(exerciseIdx)} 
                className="w-8 h-8 items-center justify-center bg-bg border border-primary/50"
              >
                <Plus size={12} color="#FBFF00" />
              </Pressable>
            </View>
          </View>

          <View className="bg-bg/50 border border-borderColor rounded-md overflow-hidden">
            {exercise.resolvedSets.map((set, setIdx) => (
               <View key={set.id} className="relative">
                 <ExerciseSetRow 
                   exercise={exercise} 
                   setIndex={setIdx} 
                   onOverride={handleOverride} 
                   onResetOverride={handleReset} 
                   isEditing={true} 
                 />
                 <Pressable 
                    onPress={() => removeSet(exerciseIdx, setIdx)}
                    className="absolute right-[-10px] top-1/2 -translate-y-1/2 w-6 h-6 items-center justify-center bg-accent border border-accentBorder"
                 >
                    <Trash size={10} color="#FFFFFF" />
                 </Pressable>
               </View>
            ))}
          </View>

          <Text className="text-textSecondary font-mono text-[9px] mt-4 uppercase tracking-[0.1em] text-center">
            Qualquer item com ponto amarelo está isolado do Pai. (Tier 2 Override)
          </Text>
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);
