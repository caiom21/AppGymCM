import React, { useEffect, useRef, useCallback } from 'react';
import { View, Text, FlatList, Pressable, TextInput, Alert, Image, ActionSheetIOS, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  X,
  Timer,
  Check,
  Lightning,
  Plus,
  TrendUp,
  ChatCircle,
  ChartBar,
} from 'phosphor-react-native';
import { useRouter } from 'expo-router';
import { usePreventRemove } from '@react-navigation/native';
import { useKeepAwake } from 'expo-keep-awake';

import { useLiveWorkoutStore, type LiveExercise } from '@/src/features/workout-engine/store/live-workout.store';
import { RestTimerOverlay } from '@/src/features/workout-engine/components/RestTimerOverlay';
import { engineFeedback } from '@/src/features/workout-engine/lib/feedback';
import { useAuth } from '@/src/features/auth/hooks/useAuth';
import { ExerciseSearchSheet } from '@/src/components/exercise/ExerciseSearchSheet';
import { ExerciseDetailSheet } from '@/src/components/exercise/ExerciseDetailSheet';
import { ExercisePreviewModal } from '@/src/components/exercise/ExercisePreviewModal';
import { ExerciseReplacerSheet } from '@/src/components/exercise/ExerciseReplacerSheet';
import { ExerciseCard as SDDExerciseCard } from '@/src/components/exercise/ExerciseCard';

// ── Set Type Badge Colors ──
const SET_TYPE_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  normal: { label: '', color: '#888', bgColor: '' },
  warmup: { label: 'W', color: '#FFC107', bgColor: 'bg-yellow-900/30' },
  drop: { label: 'D', color: '#9C27B0', bgColor: 'bg-purple-900/30' },
  failure: { label: 'F', color: '#F44336', bgColor: 'bg-red-900/30' },
  restpause: { label: 'R', color: '#2196F3', bgColor: 'bg-blue-900/30' },
};

// ── Set Row Component ──
const SetRow = React.memo(({
  set,
  exerciseId,
}: {
  set: { id: string; setNumber: number; kg: number; reps: number; previousKg: number | null; previousReps: number | null; completed: boolean; type?: any };
  exerciseId: string;
}) => {
  const { updateSetField, checkSet, uncheckSet } = useLiveWorkoutStore();
  const setType = (set.type as string) || 'normal';
  const config = SET_TYPE_CONFIG[setType] || SET_TYPE_CONFIG.normal;

  const handleToggle = () => {
    if (set.completed) uncheckSet(exerciseId, set.id);
    else checkSet(exerciseId, set.id);
  };

  const previousDisplay = set.previousKg !== null && set.previousReps !== null
    ? `${set.previousKg}×${set.previousReps}` : '—';

  const hasOverload = set.previousKg !== null && set.kg > set.previousKg;

  return (
    <View className={`flex-row items-center py-2.5 px-3 border-b border-borderColor/20 ${set.completed ? 'bg-primary/5' : ''}`}>
      {/* Set Number / Type Badge */}
      <View className="w-8 items-center">
        {config.label ? (
          <View className="w-6 h-6 rounded items-center justify-center" style={{ backgroundColor: config.color + '30' }}>
            <Text style={{ color: config.color, fontSize: 10, fontWeight: '800' }}>{config.label}</Text>
          </View>
        ) : (
          <Text className={`font-mono-bold text-xs text-center ${set.completed ? 'text-primary' : 'text-textFaint'}`}>
            {set.setNumber}
          </Text>
        )}
      </View>

      {/* Previous */}
      <Text className="w-16 font-mono text-[10px] text-textFaint text-center">{previousDisplay}</Text>

      {/* Kg Input */}
      <View className="flex-1 mx-1">
        <TextInput
          className={`h-9 bg-surface border text-center font-mono-bold text-sm rounded-lg ${set.completed ? 'border-primary/30 text-primary' : 'border-borderColor text-textPrimary'}`}
          keyboardType="numeric"
          value={set.kg > 0 ? String(set.kg) : ''}
          placeholder="0"
          placeholderTextColor="#555"
          onChangeText={(t) => updateSetField(exerciseId, set.id, 'kg', parseFloat(t) || 0)}
          selectTextOnFocus
          cursorColor="#FBFF00"
        />
        {hasOverload && !set.completed && (
          <View className="flex-row items-center justify-center mt-0.5 gap-0.5">
            <TrendUp size={8} color="#FBFF00" weight="bold" />
            <Text className="text-primary font-mono text-[7px]">+{(set.kg - (set.previousKg || 0)).toFixed(1)}</Text>
          </View>
        )}
      </View>

      {/* Reps Input */}
      <View className="flex-1 mx-1">
        <TextInput
          className={`h-9 bg-surface border text-center font-mono-bold text-sm rounded-lg ${set.completed ? 'border-primary/30 text-primary' : 'border-borderColor text-textPrimary'}`}
          keyboardType="numeric"
          value={set.reps > 0 ? String(set.reps) : ''}
          placeholder="0"
          placeholderTextColor="#555"
          onChangeText={(t) => updateSetField(exerciseId, set.id, 'reps', parseInt(t) || 0)}
          selectTextOnFocus
          cursorColor="#FBFF00"
        />
      </View>

      {/* Check */}
      <Pressable
        onPress={handleToggle}
        className={`w-9 h-9 items-center justify-center rounded-lg border ${set.completed ? 'bg-primary border-primary' : 'bg-transparent border-borderColor'}`}
      >
        {set.completed && <Check size={14} color="#0A0A0A" weight="bold" />}
      </Pressable>
    </View>
  );
});

// Delete inline ExerciseCard, it's now imported as SDDExerciseCard
// ── Partial Summary Footer ──────
function PartialSummary() {
  const store = useLiveWorkoutStore();
  const completedSets = store.exercises.reduce((s, ex) => s + ex.sets.filter(st => st.completed).length, 0);
  const totalSets = store.exercises.reduce((s, ex) => s + ex.sets.length, 0);
  const totalVolume = store.exercises.reduce(
    (sum, ex) => sum + ex.sets.filter(s => s.completed).reduce((v, s) => v + s.kg * s.reps, 0), 0
  );

  if (completedSets === 0) return null;

  return (
    <View className="bg-surface border border-borderColor rounded-2xl p-4 mt-4">
      <View className="flex-row items-center gap-2 mb-2">
        <ChartBar size={11} color="#888" />
        <Text className="text-textFaint font-mono-bold text-[8px] uppercase tracking-widest">Resumo Parcial</Text>
      </View>
      <View className="flex-row gap-6">
        <View>
          <Text className="text-textFaint font-mono text-[8px] uppercase">Volume</Text>
          <Text className="text-primary font-mono-bold text-sm">{totalVolume.toLocaleString()} kg</Text>
        </View>
        <View>
          <Text className="text-textFaint font-mono text-[8px] uppercase">Séries</Text>
          <Text className="text-textPrimary font-mono-bold text-sm">{completedSets}/{totalSets}</Text>
        </View>
      </View>
    </View>
  );
}

// ── Timer Display ──
function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// ── Main Screen ──
export default function LiveWorkoutScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const store = useLiveWorkoutStore();
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const searchSheetRef = useRef<any>(null);
  const detailSheetRef = useRef<any>(null);
  const replacerSheetRef = useRef<any>(null);
  
  const [finishing, setFinishing] = React.useState(false);
  const [detailExerciseId, setDetailExerciseId] = React.useState<string | null>(null);
  const [previewExerciseId, setPreviewExerciseId] = React.useState<string | null>(null);
  const [replacingTarget, setReplacingTarget] = React.useState<LiveExercise | null>(null);

  useKeepAwake('gymos-live-workout');

  useEffect(() => {
    if (store.isActive) {
      timerRef.current = setInterval(store.tickElapsed, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [store.isActive]);

  const isDirty = store.hasCheckedSets();
  usePreventRemove(isDirty, (_) => {
    Alert.alert('Treino em andamento', 'Descartar ou continuar?', [
      { text: 'Continuar', style: 'cancel' },
      { text: 'Descartar', style: 'destructive', onPress: () => { store.discardSession(); router.back(); } },
    ]);
  });

  const handleFinish = () => {
    const incompletes = store.exercises.reduce((s, ex) => s + ex.sets.filter(st => !st.completed).length, 0);

    if (incompletes > 0) {
      Alert.alert(
        'Séries Incompletas',
        `${incompletes} série(s) não marcada(s). Descartar incompletas?`,
        [
          { text: 'Voltar ao Treino', style: 'cancel' },
          { text: 'Descartar e Finalizar', onPress: doFinish },
        ]
      );
    } else {
      doFinish();
    }
  };

  const doFinish = async () => {
    setFinishing(true);
    try {
      const metrics = await store.finishWorkout();
      router.replace({
        pathname: '/(student)/workout/summary' as any,
        params: {
          duration: String(metrics.durationSeconds),
          volume: String(metrics.totalVolume),
          completedSets: String(metrics.completedSets),
          totalSets: String(metrics.totalSets),
          exerciseCount: String(metrics.exerciseCount),
          workoutName: store.workoutName,
        },
      });
    } catch (e) {
      Alert.alert('Erro ao finalizar', 'Não foi possível salvar seu treino.');
    } finally {
      setFinishing(false);
    }
  };

  const handleExerciseLongPress = (exercise: LiveExercise) => {
    const options = ['Remover', 'Cancelar'];
    const destructiveButtonIndex = 0;
    const cancelButtonIndex = 1;

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options, destructiveButtonIndex, cancelButtonIndex, title: exercise.name },
        (idx) => {
          if (idx === 0) store.removeExercise(exercise.id);
        }
      );
    } else {
      Alert.alert(exercise.name, undefined, [
        { text: 'Remover', style: 'destructive', onPress: () => store.removeExercise(exercise.id) },
        { text: 'Cancelar', style: 'cancel' },
      ]);
    }
  };

  const handleAddExercise = async () => {
    await engineFeedback.buttonPress();
    searchSheetRef.current?.present();
  };

  const openDetail = (exId: string) => {
    setDetailExerciseId(exId);
    detailSheetRef.current?.present();
  };

  const openReplacer = (exercise: LiveExercise) => {
    setReplacingTarget(exercise);
    replacerSheetRef.current?.present();
  };

  const renderExercise = useCallback(({ item, drag, isActive }: { item: LiveExercise, drag?: () => void, isActive?: boolean }) => {
    // Phase 5 mapping abstraction to bridge LiveExercise into Global Exercise interface expectations
    const mappedGlobalExercise = {
      id: item.exerciseId, // Key mapping for global dictionary (hooks, images, details)
      name: item.name,
      bodyPart: item.bodyPart || 'Uncategorized',
      equipment: '', 
      target: '',
      gifUrl: item.gifUrl,
      instructions: []
    } as any;

    return (
      <View className="mb-4">
        <SDDExerciseCard
          exercise={mappedGlobalExercise}
          drag={drag}
          isActive={isActive}
          onPressImage={() => setPreviewExerciseId(item.exerciseId)}
          onLongPressImage={() => openDetail(item.exerciseId)}
          onPressTitle={() => openDetail(item.exerciseId)}
          onPressMenu={() => handleExerciseLongPress(item)}
        >
          {/* Table Header */}
          <View className="flex-row items-center py-1.5 px-3 bg-bg/30">
            <Text className="w-8 font-mono text-[7px] text-textFaint text-center uppercase">Set</Text>
            <Text className="w-16 font-mono text-[7px] text-textFaint text-center uppercase">Anterior</Text>
            <Text className="flex-1 font-mono text-[7px] text-textFaint text-center uppercase mx-1">Kg</Text>
            <Text className="flex-1 font-mono text-[7px] text-textFaint text-center uppercase mx-1">Reps</Text>
            <View className="w-9" />
          </View>

          {/* Set Rows */}
          {item.sets.map(set => (
            <SetRow key={set.id} set={set} exerciseId={item.id} />
          ))}

          {/* Add Set Options */}
          <View className="flex-row border-t border-borderColor/20">
            <Pressable onPress={() => store.addSet(item.id)} className="flex-1 py-3 items-center active:bg-accentDim">
              <Text className="text-primary font-mono text-[10px] uppercase tracking-wider">+ Set</Text>
            </Pressable>
            <View className="w-[1px] bg-borderColor/20" />
            <Pressable onPress={() => store.addSet(item.id, 'warmup')} className="flex-1 py-3 items-center active:bg-accentDim">
              <Text className="text-yellow-400 font-mono text-[10px] uppercase tracking-wider">+ Aquec.</Text>
            </Pressable>
            <View className="w-[1px] bg-borderColor/20" />
            <Pressable onPress={() => store.addSet(item.id, 'drop')} className="flex-1 py-3 items-center active:bg-accentDim">
              <Text className="text-purple-400 font-mono text-[10px] uppercase tracking-wider">+ Drop</Text>
            </Pressable>
          </View>

          {/* Special Context Option (Replacer integration) */}
          <View className="px-3 py-2 border-t border-borderColor/20 bg-bg/5 flex-row justify-end">
            <Pressable onPress={() => openReplacer(item)}>
               <Text className="text-textSecondary font-mono text-[9px] uppercase tracking-widest underline underline-offset-2">Mudar Exercício</Text>
            </Pressable>
          </View>
        </SDDExerciseCard>
      </View>
    );
  }, [store]);

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ExerciseSearchSheet 
        ref={searchSheetRef}
        onClose={() => searchSheetRef.current?.dismiss()}
        onSelect={(ex) => {
          store.addExercise({
            exerciseId: ex.id || `exercise_${Date.now()}`,
            name: ex.name,
            gifUrl: ex.gifUrl,
            bodyPart: ex.bodyPart,
            restSeconds: 90,
            notes: '',
          });
        }}
      />
      {/* ── Fixed Header ── */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-borderColor">
        <Pressable
          onPress={() => {
            if (isDirty) {
              Alert.alert('Descartar Treino?', 'O progresso será perdido.', [
                { text: 'Continuar', style: 'cancel' },
                { text: 'Descartar', style: 'destructive', onPress: () => { store.discardSession(); router.back(); } },
              ]);
            } else { store.discardSession(); router.back(); }
          }}
          className="w-10 h-10 items-center justify-center"
        >
          <X size={18} color="#888" />
        </Pressable>

        <View className="items-center">
          <Text className="text-textFaint font-mono text-[8px] uppercase tracking-widest" numberOfLines={1}>
            {store.workoutName}
          </Text>
          <View className="flex-row items-center gap-1.5">
            <Timer size={14} color="#FBFF00" weight="fill" />
            <Text className="text-primary font-mono-bold text-base tracking-tight">
              {formatTime(store.elapsedSeconds)}
            </Text>
          </View>
        </View>

        <Pressable onPress={handleFinish} disabled={finishing} className="bg-primary px-4 py-2 rounded-lg active:bg-primary/80 min-w-[100px] items-center">
          {finishing ? <ActivityIndicator size="small" color="#0A0A0A" /> : <Text className="text-bg font-mono-bold text-[10px] uppercase">Finalizar</Text>}
        </Pressable>
      </View>

      {/* ── Rest Timer Overlay ── */}
      <RestTimerOverlay />

      {/* ── Exercise List ── */}
      <FlatList
        data={store.exercises}
        renderItem={renderExercise}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          <View>
            {/* Add Exercise */}
            <Pressable
              onPress={handleAddExercise}
              className="border border-dashed border-primary/40 py-4 items-center rounded-2xl active:bg-accentDim"
            >
              <Plus size={16} color="#FBFF00" />
              <Text className="text-primary font-mono-bold text-[10px] uppercase tracking-wider mt-2">
                Adicionar Exercício
              </Text>
            </Pressable>

            {/* Partial Summary */}
            <PartialSummary />
          </View>
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-20">
            <View className="w-20 h-20 rounded-full bg-accentDim items-center justify-center mb-4">
              <Plus size={28} color="#FBFF00" />
            </View>
            <Text className="text-textFaint font-mono text-[10px] uppercase text-center mb-1">
              Nenhum exercício adicionado
            </Text>
            <Text className="text-textFaint font-mono text-[9px] text-center mb-4 opacity-60">
              Adicione exercícios com o +
            </Text>
            <Pressable onPress={handleAddExercise} className="border border-primary px-6 py-3 rounded-xl active:bg-primary/10">
              <Text className="text-primary font-mono-bold text-xs uppercase">Adicionar Primeiro Exercício</Text>
            </Pressable>
          </View>
        }
      />
      
      {/* ── Root Modals & Sheets Pipeline ── */}
      <ExerciseDetailSheet 
        ref={detailSheetRef}
        exerciseId={detailExerciseId}
        onClose={() => detailSheetRef.current?.dismiss()}
        onImageDoubleTap={() => setPreviewExerciseId(detailExerciseId)}
      />

      <ExerciseReplacerSheet
        ref={replacerSheetRef}
        currentExercise={
          replacingTarget ? {
            id: replacingTarget.exerciseId,
            name: replacingTarget.name,
            bodyPart: replacingTarget.bodyPart || 'Uncategorized',
            gifUrl: replacingTarget.gifUrl,
            target: '', equipment: '', instructions: []
          } as any : null
        }
        onReplace={(newEx) => {
          if (replacingTarget) {
            store.replaceExercise(replacingTarget.id, {
              exerciseId: newEx.id,
              name: newEx.name,
              bodyPart: newEx.bodyPart,
              gifUrl: newEx.gifUrl,
            });
          }
        }}
        onClose={() => replacerSheetRef.current?.dismiss()}
        onOpenSearch={() => {
           replacerSheetRef.current?.dismiss();
           // In future iteration could trigger search pre-seeded, here just open generic:
           searchSheetRef.current?.present();
        }}
      />

      <ExercisePreviewModal
        exerciseId={previewExerciseId}
        visible={previewExerciseId !== null}
        onClose={() => setPreviewExerciseId(null)}
      />

    </SafeAreaView>
  );
}
