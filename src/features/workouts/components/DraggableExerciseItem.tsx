import React, { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { ScaleDecorator } from 'react-native-draggable-flatlist';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { exerciseService } from '@/src/features/exercises/services/exercisedb.service';
import type { ExerciseBase } from '@/src/features/exercises/types/exercise.types';
import type { ResolvedSet, ExerciseDefaults } from '@/src/shared/types/user-workout.types';

interface DraggableExerciseItemProps {
  item: {
    id: string;
    exerciseId: string;
    defaults: ExerciseDefaults;
    resolvedSets: ResolvedSet[];
  };
  drag: () => void;
  isActive: boolean;
  onEdit: () => void;
}

export const DraggableExerciseItem = ({ item, drag, isActive, onEdit }: DraggableExerciseItemProps) => {
  const [exerciseDetail, setExerciseDetail] = useState<ExerciseBase | null>(null);

  useEffect(() => {
    exerciseService.getExerciseById(item.exerciseId)
      .then(setExerciseDetail)
      .catch(console.error);
  }, [item.exerciseId]);

  return (
    <ScaleDecorator>
       <Pressable 
         onLongPress={drag} 
         disabled={isActive} 
         onPress={onEdit}
         className={`bg-surface border mb-3 p-4 flex-row items-center overflow-hidden relative ${isActive ? 'border-primary opacity-90' : 'border-borderColor'}`}
       >
         {isActive && <View className="absolute inset-0 border-2 border-primary z-10 pointer-events-none" />}
         
         {/* Hamburger drag icon */}
         <View className="mr-4 w-6 items-center justify-center">
           <FontAwesome name="bars" size={16} color={isActive ? '#0FF033' : '#666'} />
         </View>
         
         {/* Details */}
         <View className="flex-1 justify-center">
            <Text className="text-textPrimary font-mono-bold text-base mb-1 uppercase tracking-tight">
              {exerciseDetail?.name || 'Carregando...'}
            </Text>
            <View className="flex-row items-center gap-2">
              <View className="bg-bg px-2 py-0.5 border border-borderColor">
                <Text className="text-primary font-mono text-[9px] uppercase tracking-widest">
                  {item.resolvedSets.length} Séries
                </Text>
              </View>
              <Text className="text-textSecondary font-mono text-[10px] uppercase">
                Base: {item.defaults.loadKg}kg
              </Text>
            </View>
         </View>
         
         <View className="ml-auto w-8 h-8 items-center justify-center bg-bg border border-borderColor">
            <FontAwesome name="pencil" size={12} color="#A3A3A3" />
         </View>
       </Pressable>
    </ScaleDecorator>
  );
};
