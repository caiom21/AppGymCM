import React, { forwardRef, useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import { BottomSheetModal, BottomSheetView, BottomSheetBackdrop, BottomSheetFlatList } from '@gorhom/bottom-sheet';
import * as PhosphorIcons from 'phosphor-react-native';
import { useSimilarExercises } from '@/src/hooks/exercise/useSimilarExercises';
import type { Exercise } from '@/src/services/exercise/exerciseTypes';
import { ExerciseListItem } from './ExerciseListItem';

interface ExerciseReplacerSheetProps {
  currentExercise: Exercise | null;
  onReplace: (newExercise: Exercise) => void;
  onClose: () => void;
  onOpenSearch: () => void; // Used to fallback to the full search sheet
}

/**
 * Specifically tailored for "Replace Exercise" flows.
 * Instead of showing a giant search generic list, it instantly pre-loads
 * highly similar exercises leveraging the `useSimilarExercises` hook. 
 */
export const ExerciseReplacerSheet = forwardRef<BottomSheetModal, ExerciseReplacerSheetProps>(
  ({ currentExercise, onReplace, onClose, onOpenSearch }, ref) => {
    
    // Automatically fetching alternative suggestions
    const { data: suggestions = [], isLoading } = useSimilarExercises(currentExercise, 15);

    const renderBackdrop = useCallback(
      (props: any) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />,
      []
    );

    const handleReplace = (exercise: Exercise) => {
      onReplace(exercise);
      onClose();
    };

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={['75%']}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: '#111111' }}
        handleIndicatorStyle={{ backgroundColor: '#FBFF00' }}
      >
        <BottomSheetView className="flex-1 bg-surface px-section-p pt-4 pb-8">
          <View className="mb-6 flex-row justify-between items-center border-b border-borderColor pb-4">
             <View>
               <Text className="text-textFaint font-mono text-[9px] uppercase tracking-widest">
                 Substituir Exercício
               </Text>
               <Text className="text-primary font-mono-bold text-lg uppercase truncate" numberOfLines={1}>
                 {currentExercise?.name || 'Selecionar'}
               </Text>
             </View>
             
             <Pressable 
               onPress={onOpenSearch} 
               className="flex-row items-center bg-surface2 px-3 py-1.5 rounded-lg border border-borderColor"
             >
               <PhosphorIcons.MagnifyingGlass size={14} color="#888" />
               <Text className="text-textPrimary text-xs ml-2 font-medium">Busca livre</Text>
             </Pressable>
          </View>
          
          <Text className="text-textSecondary font-semibold text-sm mb-4">
            Sugestões Similares (Mesmo alvo)
          </Text>

          {isLoading ? (
            <View className="flex-1 items-center justify-center">
              <Text className="text-textFaint">Analisando alternativas...</Text>
            </View>
          ) : (
            <BottomSheetFlatList
              data={suggestions}
              keyExtractor={(item: Exercise) => item.id}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }: { item: Exercise }) => (
                <ExerciseListItem 
                  exercise={item}
                  onPress={() => handleReplace(item)}
                  accessory={
                    <View className="px-3 py-1 bg-accentDim border border-accentBorder rounded-full">
                      <Text className="text-primary text-[10px] font-mono-bold">TROCAR</Text>
                    </View>
                  }
                />
              )}
              ListEmptyComponent={
                <View className="items-center justify-center py-12">
                   <View className="mb-2"><PhosphorIcons.SmileySad size={32} color="#888" /></View>
                   <Text className="text-textSecondary mb-4">Nenhuma boa sugestão encontrada.</Text>
                   <Pressable onPress={onOpenSearch}>
                     <Text className="text-primary font-bold">Abrir busca completa</Text>
                   </Pressable>
                </View>
              }
            />
          )}

        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

ExerciseReplacerSheet.displayName = 'ExerciseReplacerSheet';
