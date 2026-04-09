import { useAuth } from '@/src/features/auth/hooks/useAuth';
import { supabase } from '@/src/shared/lib/supabase';
import { supabaseService } from '@/src/shared/services/supabase.service';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ListBullets, Plus, X } from 'phosphor-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface PlanExercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  restSeconds: number;
  notes: string;
  expanded: boolean;
}

interface PlanDay {
  id: string;
  label: string;
  exercises: PlanExercise[];
}

export default function PlanEditorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [days, setDays] = useState<PlanDay[]>([]);
  const [activeDay, setActiveDay] = useState(0);
  const [isDirty, setIsDirty] = useState(false);
  const [defaultRest, setDefaultRest] = useState('90');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id && id !== 'create') {
      loadPlan();
    } else {
      setLoading(false);
      // Initialize with one day for "create" mode
      setDays([{ id: `d_${Date.now()}`, label: 'Dia 1', exercises: [] }]);
    }
  }, [id]);

  const loadPlan = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_workouts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setName(data.name);
      setDays(data.exercises || []);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível carregar o plano.');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const currentDay = days[activeDay];

  const handleCancel = () => {
    if (isDirty) {
      Alert.alert('Descartar alterações?', 'Você perderá as modificações não salvas.', [
        { text: 'Continuar Editando', style: 'cancel' },
        { text: 'Descartar', style: 'destructive', onPress: () => router.back() },
      ]);
    } else {
      router.back();
    }
  };

  const handleSave = async () => {
    if (!user) return;
    if (!name.trim()) {
      Alert.alert('Erro', 'O plano precisa de um nome.');
      return;
    }

    setSaving(true);
    try {
      await supabaseService.upsertPlan(user.id, {
        id: id === 'create' ? undefined : id,
        name,
        exercises: days,
        is_archived: false
      });

      Alert.alert('Salvo!', 'Plano atualizado com sucesso.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível salvar o plano.');
    } finally {
      setSaving(false);
    }
  };

  const toggleExpand = (exerciseId: string) => {
    setDays(prev => prev.map((day, i) =>
      i === activeDay
        ? {
          ...day,
          exercises: day.exercises.map(ex =>
            ex.id === exerciseId ? { ...ex, expanded: !ex.expanded } : ex
          ),
        }
        : day
    ));
  };

  const removeExercise = (exerciseId: string) => {
    setIsDirty(true);
    setDays(prev => prev.map((day, i) =>
      i === activeDay
        ? { ...day, exercises: day.exercises.filter(ex => ex.id !== exerciseId) }
        : day
    ));
  };

  const addDay = () => {
    setIsDirty(true);
    const newDay: PlanDay = {
      id: `d_${Date.now()}`,
      label: `Dia ${days.length + 1}`,
      exercises: [],
    };
    setDays(prev => [...prev, newDay]);
    setActiveDay(days.length);
  };

  const addExercise = () => {
    setIsDirty(true);
    const newEx: PlanExercise = {
      id: `ex_${Date.now()}`,
      name: 'Novo Exercício',
      sets: 3,
      reps: 10,
      restSeconds: parseInt(defaultRest) || 90,
      notes: '',
      expanded: true,
    };
    setDays(prev => prev.map((day, i) =>
      i === activeDay ? { ...day, exercises: [...day.exercises, newEx] } : day
    ));
  };

  const applyDefaultRest = () => {
    setIsDirty(true);
    const rest = parseInt(defaultRest) || 90;
    setDays(prev => prev.map((day, i) =>
      i === activeDay
        ? { ...day, exercises: day.exercises.map(ex => ({ ...ex, restSeconds: rest })) }
        : day
    ));
    Alert.alert('Aplicado', `Descanso de ${rest}s aplicado a todos os exercícios.`);
  };

  if (loading) {
    return (
      <View className="flex-1 bg-bg items-center justify-center">
        <ActivityIndicator color="#FBFF00" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bg">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-borderColor">
        <Pressable onPress={handleCancel}>
          <Text className="text-textSecondary font-mono text-sm">Cancelar</Text>
        </Pressable>
        <TextInput
          className="text-textPrimary font-mono-bold text-sm uppercase flex-1 text-center mx-2"
          placeholder="NOME DO PLANO"
          placeholderTextColor="#444"
          value={name}
          onChangeText={(t) => { setName(t); setIsDirty(true); }}
          cursorColor="#FBFF00"
        />
        <Pressable onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator size="small" color="#FBFF00" /> : <Text className="text-primary font-mono-bold text-sm">Salvar</Text>}
        </Pressable>
      </View>

      {/* Day Tabs */}
      <View className="max-h-14 border-b border-borderColor">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 8, paddingHorizontal: 12 }}>
          {days.map((day, idx) => (
            <Pressable
              key={day.id}
              onPress={() => setActiveDay(idx)}
              className={`px-4 py-2 mr-1.5 rounded-lg border ${idx === activeDay ? 'bg-primary border-primary' : 'bg-surface border-borderColor'}`}
            >
              <Text className={`font-mono-bold text-[10px] uppercase ${idx === activeDay ? 'text-bg' : 'text-textFaint'}`}>
                Dia {idx + 1}
              </Text>
            </Pressable>
          ))}
          <Pressable onPress={addDay} className="px-4 py-2 border border-dashed border-primary/40 rounded-lg items-center justify-center">
            <Plus size={10} color="#FBFF00" />
          </Pressable>
        </ScrollView>
      </View>

      {/* Exercise List */}
      <ScrollView className="flex-1 px-4 pt-3" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {currentDay?.exercises.length === 0 ? (
          <View className="py-20 items-center justify-center opacity-40">
            <ListBullets size={40} color="#444" />
            <Text className="text-textFaint font-mono text-[10px] uppercase mt-4">Vazio</Text>
          </View>
        ) : (
          currentDay?.exercises.map((ex) => (
            <View key={ex.id} className="bg-surface border border-borderColor rounded-xl mb-3 overflow-hidden">
              <Pressable
                onPress={() => toggleExpand(ex.id)}
                className="flex-row items-center p-3"
              >
                <Text className="text-textFaint font-mono text-[10px] mr-2">≡</Text>
                <TextInput
                  className="text-textPrimary font-mono-bold text-xs uppercase flex-1"
                  value={ex.name}
                  onChangeText={(v) => {
                    setIsDirty(true);
                    setDays(prev => prev.map((d, i) =>
                      i === activeDay
                        ? { ...d, exercises: d.exercises.map(e => e.id === ex.id ? { ...e, name: v } : e) }
                        : d
                    ));
                  }}
                  cursorColor="#FBFF00"
                />
                <Text className="text-textFaint font-mono text-[10px] mr-3">
                  {ex.sets}×{ex.reps}
                </Text>
                <Pressable onPress={() => removeExercise(ex.id)} hitSlop={8}>
                  <X size={12} color="#666" />
                </Pressable>
              </Pressable>

              {ex.expanded && (
                <View className="px-3 pb-3 border-t border-borderColor/30 pt-2">
                  <View className="flex-row gap-3 mb-2">
                    <View className="flex-1">
                      <Text className="text-textFaint font-mono text-[8px] uppercase mb-1">Séries</Text>
                      <TextInput
                        className="h-9 bg-bg border border-borderColor text-center font-mono-bold text-sm text-textPrimary rounded"
                        keyboardType="numeric"
                        value={String(ex.sets)}
                        onChangeText={(v) => {
                          setIsDirty(true);
                          setDays(prev => prev.map((d, i) =>
                            i === activeDay
                              ? { ...d, exercises: d.exercises.map(e => e.id === ex.id ? { ...e, sets: parseInt(v) || 0 } : e) }
                              : d
                          ));
                        }}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-textFaint font-mono text-[8px] uppercase mb-1">Reps</Text>
                      <TextInput
                        className="h-9 bg-bg border border-borderColor text-center font-mono-bold text-sm text-textPrimary rounded"
                        keyboardType="numeric"
                        value={String(ex.reps)}
                        onChangeText={(v) => {
                          setIsDirty(true);
                          setDays(prev => prev.map((d, i) =>
                            i === activeDay
                              ? { ...d, exercises: d.exercises.map(e => e.id === ex.id ? { ...e, reps: parseInt(v) || 0 } : e) }
                              : d
                          ));
                        }}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-textFaint font-mono text-[8px] uppercase mb-1">Desc. (s)</Text>
                      <TextInput
                        className="h-9 bg-bg border border-borderColor text-center font-mono-bold text-sm text-textPrimary rounded"
                        keyboardType="numeric"
                        value={String(ex.restSeconds)}
                        onChangeText={(v) => {
                          setIsDirty(true);
                          setDays(prev => prev.map((d, i) =>
                            i === activeDay
                              ? { ...d, exercises: d.exercises.map(e => e.id === ex.id ? { ...e, restSeconds: parseInt(v) || 0 } : e) }
                              : d
                          ));
                        }}
                      />
                    </View>
                  </View>
                  <TextInput
                    className="h-9 bg-bg border border-borderColor px-3 font-mono text-xs text-textSecondary rounded"
                    placeholder="Notas..."
                    placeholderTextColor="#555"
                    value={ex.notes}
                    onChangeText={(v) => {
                      setIsDirty(true);
                      setDays(prev => prev.map((d, i) =>
                        i === activeDay
                          ? { ...d, exercises: d.exercises.map(e => e.id === ex.id ? { ...e, notes: v } : e) }
                          : d
                      ));
                    }}
                  />
                </View>
              )}
            </View>
          ))
        )}

        <Pressable
          onPress={addExercise}
          className="border border-dashed border-primary/40 py-4 items-center rounded-xl active:bg-accentDim"
        >
          <Plus size={16} color="#FBFF00" />
          <Text className="text-primary font-mono-bold text-[10px] uppercase tracking-wider mt-1">
            Adicionar Exercício
          </Text>
        </Pressable>
      </ScrollView>

      {/* Footer */}
      <View className="px-4 py-3 border-t border-borderColor bg-surface flex-row items-center gap-3">
        <Text className="text-textFaint font-mono text-[9px] uppercase">Descanso:</Text>
        <TextInput
          className="w-14 h-8 bg-bg border border-borderColor text-center font-mono-bold text-[10px] text-primary rounded"
          keyboardType="numeric"
          value={defaultRest}
          onChangeText={setDefaultRest}
        />
        <Pressable onPress={applyDefaultRest} className="ml-auto bg-primary/10 border border-primary px-3 py-1.5 active:bg-primary/20">
          <Text className="text-primary font-mono-bold text-[9px] uppercase">Aplicar Todos</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
