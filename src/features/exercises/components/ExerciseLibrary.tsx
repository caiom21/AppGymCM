import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { FlashList } from "@shopify/flash-list";
import { LinearGradient } from 'expo-linear-gradient';
import { ExerciseBase } from '@/src/features/exercises/types/exercise.types';
import { useExerciseList } from '@/src/hooks/exercise/useExerciseList';

/**
 * ExerciseLibrary — specialized v4.0 component for global exercise browsing.
 * Optimizes performance for 8GB RAM devices using FlashList and memory-disk caching.
 */
export const ExerciseLibrary = () => {
  // Use the React Query hook we built in Phase 2, which now uses the Supabase-cached service
  const { data: exercises, isLoading } = useExerciseList(50, 0);
  
  const renderItem = ({ item }: { item: ExerciseBase }) => (
    <View style={styles.card}>
      <Image 
        source={{ uri: item.gifUrl }} 
        style={styles.exerciseImage}
        contentFit="cover"
        transition={1000}
        cachePolicy="memory-disk"
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.9)']}
        style={styles.cardGradient}
      >
        <Text style={styles.exerciseName} numberOfLines={2}>
          {item.name}
        </Text>
        <View style={styles.tagContainer}>
          <View style={[styles.tag, { borderColor: '#00FFFF' }]}>
            <Text style={styles.tagText}>{item.bodyPart}</Text>
          </View>
          <View style={[styles.tag, { borderColor: '#FF00FF' }]}>
            <Text style={styles.tagText}>{item.target}</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlashList
        data={(exercises as any) || []}
        renderItem={({ item }: { item: any }) => renderItem({ item })}
        estimatedItemSize={300}
        numColumns={2}
        keyExtractor={(item: any) => item.id}
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <Text style={styles.title}>GYMOS_CORE</Text>
            <Text style={styles.subtitle}>BIBLIOTECA_V4</Text>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Text style={{ color: '#555', fontStyle: 'italic' }}>
              {isLoading ? 'Carregando biblioteca...' : 'Nenhum exercício encontrado.'}
            </Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  header: { padding: 20, paddingTop: 60 },
  title: { color: '#FFF', fontSize: 32, fontWeight: '900', letterSpacing: 2 },
  subtitle: { color: '#00FFFF', fontSize: 12, fontWeight: 'bold' },
  card: {
    height: 250,
    margin: 8,
    borderRadius: 15,
    backgroundColor: '#1A1A1A',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
  },
  exerciseImage: { width: '100%', height: '100%' },
  cardGradient: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 10,
    height: '60%',
    justifyContent: 'flex-end',
  },
  exerciseName: { 
    color: '#FFF', 
    fontSize: 14, 
    fontWeight: 'bold', 
    textTransform: 'uppercase',
    marginBottom: 4 
  },
  tagContainer: { flexDirection: 'row', marginTop: 5, gap: 5 },
  tag: { borderWidth: 1, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  tagText: { color: '#FFF', fontSize: 8, fontWeight: 'bold' }
});
