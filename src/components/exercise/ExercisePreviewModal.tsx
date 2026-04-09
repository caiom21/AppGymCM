import React, { forwardRef, useCallback, useState } from 'react';
import { View, Text, Pressable, Modal, Dimensions } from 'react-native';
import * as PhosphorIcons from 'phosphor-react-native';
import { useExercise } from '@/src/hooks/exercise/useExercise';
import { ExerciseImage } from './ExerciseImage';

interface ExercisePreviewModalProps {
  exerciseId: string | null;
  visible: boolean;
  onClose: () => void;
}

/**
 * Lightweight modal providing a full-screen or large view of an exercise image.
 * Triggered by double-tapping exercise thumbnails per SDD v5 global gestures.
 * Implements a simple modal overlay with a close button and the largest resolution fallback (720px).
 */
export const ExercisePreviewModal = ({ exerciseId, visible, onClose }: ExercisePreviewModalProps) => {
  const { data: exercise, isLoading } = useExercise(exerciseId || undefined);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-bg/95 items-center justify-center relative">
         <Pressable 
            className="absolute inset-0 items-center justify-center" 
            onPress={onClose}
          >
           {exerciseId ? (
             <View className="w-full bg-surface items-center py-8">
               <ExerciseImage 
                 exerciseId={exerciseId} 
                 bodyPart={exercise?.bodyPart}
                 size="full" 
                 shape="square" 
               />
               
               <View className="mt-6 px-section-p w-full items-center">
                 {isLoading ? (
                   <Text className="text-textSecondary">Loading...</Text>
                 ) : exercise ? (
                   <>
                     <Text className="text-textPrimary font-mono-bold uppercase text-xl text-center mb-1">
                       {exercise.name}
                     </Text>
                     <Text className="text-textSecondary text-xs uppercase tracking-widest text-center">
                       {exercise.bodyPart} • {exercise.equipment}
                     </Text>
                   </>
                 ) : (
                   <Text className="text-error font-semibold text-center">Failed to load details</Text>
                 )}
               </View>
             </View>
           ) : null}
         </Pressable>
         <Pressable 
           onPress={onClose} 
           className="absolute top-12 right-6 p-3 bg-surface2/80 rounded-full"
         >
           <PhosphorIcons.X size={20} color="#FFF" />
         </Pressable>
      </View>
    </Modal>
  );
};

ExercisePreviewModal.displayName = 'ExercisePreviewModal';
