import React, { forwardRef, useState, useCallback, useMemo } from 'react';
import { View, Text, TextInput, Pressable, FlatList, ActivityIndicator } from 'react-native';
import { BottomSheetModal, BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { MagnifyingGlass, X, Plus } from 'phosphor-react-native';
import { exerciseService } from '@/src/features/exercises/services/exercisedb.service';
import type { ExerciseBase } from '@/src/features/exercises/types/exercise.types';
import { useWorkoutEditor } from '@/src/features/workouts/hooks/useWorkoutEditor';

interface ExerciseSearchSheetProps {
  workoutId?: string;
  onSelect?: (exercise: ExerciseBase) => void;
  onClose: () => void;
}

export const ExerciseSearchSheet = forwardRef<BottomSheetModal, ExerciseSearchSheetProps>(
  ({ workoutId, onSelect, onClose }, ref) => {
    // Only init workout editor if we have a workoutId
    const editor = workoutId ? useWorkoutEditor(workoutId) : null;
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<ExerciseBase[]>([]);
    const [loading, setLoading] = useState(false);

    const renderBackdrop = useCallback(
      (props: any) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />,
      []
    );

    const handleSearch = async () => {
      if (!query.trim()) return;
      setLoading(true);
      try {
        const res = await exerciseService.searchExercises(query.trim());
        setResults(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const handleAdd = (exercise: ExerciseBase) => {
      if (onSelect) {
        onSelect(exercise);
      } else if (editor) {
        // Apply defaults that respect the System DB
        editor.addExercise(exercise.id, {
          repsTarget: 10,
          loadKg: 20,
          restSeconds: 60,
          rirTarget: 2,
          notes: ''
        }, 3);
      }
      onClose();
    };

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={['80%', '90%']}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: '#1A1A1A' }}
        handleIndicatorStyle={{ backgroundColor: '#0FF033' }}
      >
        <BottomSheetView className="flex-1 bg-surface px-6 pt-4 pb-8">
          <Text className="text-primary font-mono-bold text-lg uppercase tracking-tight mb-4 border-b border-borderColor pb-2">
            Adicionar Exercício
          </Text>

          <View className="flex-row items-center border border-borderColor bg-bg/50 px-4 h-12 mb-4">
            <MagnifyingGlass size={16} color="#666" style={{ marginRight: 12 }} />
            <TextInput 
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={handleSearch}
              className="flex-1 text-textPrimary font-mono py-0 text-sm"
              placeholder="Ex: Supino ou Chest..."
              placeholderTextColor="#666"
              returnKeyType="search"
            />
            {query.length > 0 && (
              <Pressable onPress={() => { setQuery(''); setResults([]); }} className="p-2">
                <X size={16} color="#666" />
              </Pressable>
            )}
          </View>

          {loading ? (
             <View className="flex-1 items-center justify-center">
               <ActivityIndicator size="small" color="#0FF033" />
             </View>
          ) : (
            <FlatList
              data={results}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ gap: 12, paddingBottom: 60 }}
              renderItem={({ item }) => (
                <View className="flex-row items-center bg-bg border border-borderColor p-3">
                  <View className="flex-1">
                    <Text className="text-textPrimary font-mono-bold uppercase mb-1">{item.name}</Text>
                    <Text className="text-textSecondary font-mono text-[9px] uppercase tracking-widest">
                      {item.bodyPart} • {item.target}
                    </Text>
                  </View>
                  <Pressable 
                    onPress={() => handleAdd(item)}
                    className="w-10 h-10 items-center justify-center bg-primary/10 border border-primary/30"
                  >
                    <Plus size={16} color="#0FF033" weight="bold" />
                  </Pressable>
                </View>
              )}
              ListEmptyComponent={
                query && results.length === 0 ? (
                  <Text className="text-textSecondary font-mono text-xs text-center mt-6 uppercase">
                    Nenhum exercício encontrado.
                  </Text>
                ) : null
              }
            />
          )}
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);
