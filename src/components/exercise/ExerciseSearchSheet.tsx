import { useBodyPartList } from '@/src/hooks/exercise/useBodyPartList';
import { useExerciseSearch } from '@/src/hooks/exercise/useExerciseSearch';
import type { Exercise } from '@/src/services/exercise/exerciseTypes';
import { BottomSheetBackdrop, BottomSheetFlatList, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import * as PhosphorIcons from 'phosphor-react-native';
import React, { forwardRef, useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { ExerciseListItem } from './ExerciseListItem';
import { MuscleChip } from './MuscleChip';

interface ExerciseSearchSheetProps {
  onSelect?: (exercise: Exercise) => void;
  onClose: () => void;
  onLongPressItem?: (exercise: Exercise) => void;
}

/**
 * Robust Exercise Search Sheet replacing legacy implementations.
 * Uses useExerciseSearch hook to provide debounce-capable 300ms lookups.
 * Also uses bodyPartList hook to render fast filter chips below search bar.
 */
export const ExerciseSearchSheet = forwardRef<BottomSheetModal, ExerciseSearchSheetProps>(
  ({ onSelect, onClose, onLongPressItem }, ref) => {

    // Local State
    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [selectedBodyPart, setSelectedBodyPart] = useState<string>('');

    // Debounce implementation (300ms per spec)
    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedQuery(query);
      }, 300);
      return () => clearTimeout(handler);
    }, [query]);

    // Data Hooks
    const {
      data: exercises = [],
      isLoading,
      isFetching
    } = useExerciseSearch({
      query: debouncedQuery,
      bodyPart: selectedBodyPart,
      limit: 50
    });

    const { data: bodyParts = [] } = useBodyPartList();

    const renderBackdrop = useCallback(
      (props: any) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />,
      []
    );

    const handleSelect = (exercise: Exercise) => {
      if (onSelect) {
        onSelect(exercise);
      }
      onClose();
    };

    const handleClear = () => {
      setQuery('');
      setDebouncedQuery('');
    };

    const toggleBodyPart = (bp: string) => {
      setSelectedBodyPart(prev => prev === bp ? '' : bp);
    };

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={['80%', '90%']}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: '#1A1A1A' }} // surface2
        handleIndicatorStyle={{ backgroundColor: '#FBFF00' }} // new primary tone
      >
        <BottomSheetView className="flex-1 bg-surface px-section-p pt-4 pb-8">

          <Text className="text-primary font-mono-bold text-lg uppercase tracking-tight mb-4 border-b border-borderColor pb-2">
            Adicionar Exercício
          </Text>

          {/* Search Bar */}
          <View className="flex-row items-center border border-borderColor bg-bg/50 px-4 h-12 mb-4 rounded-xl">
            <PhosphorIcons.MagnifyingGlass size={16} color="#888" style={{ marginRight: 12 }} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              className="flex-1 text-textPrimary font-mono py-0 text-sm"
              placeholder="Ex: Supino ou Chest..."
              placeholderTextColor="#666"
              returnKeyType="search"
            />
            {query.length > 0 && (
              <Pressable onPress={handleClear} className="p-2">
                <PhosphorIcons.X size={16} color="#666" />
              </Pressable>
            )}
            {(isLoading || isFetching) && query.length > 0 && (
              <ActivityIndicator size="small" color="#FBFF00" style={{ marginLeft: 8 }} />
            )}
          </View>

          {/* Body Part Filter Chips */}
          <View className="mb-4">
            <BottomSheetFlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={bodyParts}
              keyExtractor={(item: string) => item}
              contentContainerStyle={{ gap: 8 }}
              renderItem={({ item }: { item: string }) => (
                <MuscleChip
                  bodyPart={item}
                  selected={selectedBodyPart === item}
                  onPress={() => toggleBodyPart(item)}
                />
              )}
            />
          </View>

          {/* List Results */}
          <BottomSheetFlatList
            data={exercises}
            keyExtractor={(item: Exercise) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 60 }}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }: { item: Exercise }) => (
              <ExerciseListItem
                exercise={item}
                onPress={() => handleSelect(item)}
                onLongPress={() => onLongPressItem && onLongPressItem(item)}
                accessory={
                  <View className="w-8 h-8 rounded-full items-center justify-center bg-accentDim border border-accentBorder">
                    <PhosphorIcons.Plus size={14} color="#FBFF00" weight="bold" />
                  </View>
                }
              />
            )}
              ListEmptyComponent={
                !isLoading ? (
                  <View className="items-center mt-12 px-10">
                    <PhosphorIcons.MagnifyingGlass size={32} color="#444" weight="light" />
                    <Text className="text-textSecondary font-sans text-sm text-center mt-4">
                      { (debouncedQuery || selectedBodyPart) 
                        ? 'Nenhum exercício encontrado.' 
                        : 'Carregando exercícios populares...' }
                    </Text>
                  </View>
                ) : null
              }
          />
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

ExerciseSearchSheet.displayName = 'ExerciseSearchSheet';
