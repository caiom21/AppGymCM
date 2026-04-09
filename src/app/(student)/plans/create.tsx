import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function CreatePlanScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [daysPerWeek, setDaysPerWeek] = useState('3');

  const handleCreate = () => {
    if (!name.trim()) {
      Alert.alert('Nome obrigatório', 'Dê um nome ao seu plano.');
      return;
    }
    // TODO: Create plan in store, then navigate to editor
    Alert.alert('Plano Criado', `"${name}" criado com sucesso!`, [
      { text: 'Editar', onPress: () => router.replace({ pathname: '/(student)/plans/[id]/edit' as any, params: { id: 'new' } }) },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-bg px-6 pt-default">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-section-gap">
        <Pressable onPress={() => router.back()}>
          <Text className="text-textSecondary font-mono text-sm">Cancelar</Text>
        </Pressable>
        <Text className="text-textPrimary font-mono-bold text-sm uppercase">Novo Plano</Text>
        <View className="w-16" />
      </View>

      {/* Form */}
      <View className="mb-section-gap">
        <Text className="text-primary font-mono text-[10px] uppercase mb-1 tracking-widest">Nome do Plano</Text>
        <TextInput
          className="h-14 bg-surface border border-borderColor px-4 font-mono text-sm text-textPrimary"
          placeholder="Ex: Push Pull Legs"
          placeholderTextColor="#555"
          value={name}
          onChangeText={setName}
          cursorColor="#FBFF00"
          autoFocus
        />
      </View>

      <View className="mb-section-gap">
        <Text className="text-primary font-mono text-[10px] uppercase mb-1 tracking-widest">Dias por Semana</Text>
        <View className="flex-row gap-2">
          {['3', '4', '5', '6'].map((d) => (
            <Pressable
              key={d}
              onPress={() => setDaysPerWeek(d)}
              className={`flex-1 h-14 items-center justify-center border ${daysPerWeek === d ? 'bg-primary border-primary' : 'bg-surface border-borderColor'}`}
            >
              <Text className={`font-mono-bold text-lg ${daysPerWeek === d ? 'text-bg' : 'text-textFaint'}`}>{d}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Pressable
        onPress={handleCreate}
        className="bg-primary h-14 items-center justify-center mt-auto mb-10 active:bg-primary/80"
      >
        <Text className="text-bg font-mono-bold text-xs uppercase tracking-[0.15em]">Criar Plano</Text>
      </Pressable>
    </SafeAreaView>
  );
}
