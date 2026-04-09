import React from 'react';
import { View, Text, ScrollView, Pressable, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Trophy,
  Timer,
  ChartBar,
  Medal,
  TrendUp,
  Fire,
  ShareNetwork,
} from 'phosphor-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '@/src/shared/components/ui/Button';

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  return `${m} min`;
}

function formatVolume(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)}k`;
  return String(kg);
}

export default function WorkoutSummaryScreen() {
  const params = useLocalSearchParams<{
    duration?: string; volume?: string; completedSets?: string;
    totalSets?: string; exerciseCount?: string; workoutName?: string;
  }>();
  const router = useRouter();

  const duration = parseInt(params.duration || '0');
  const volume = parseInt(params.volume || '0');
  const completedSets = parseInt(params.completedSets || '0');
  const totalSets = parseInt(params.totalSets || '0');
  const exerciseCount = parseInt(params.exerciseCount || '0');
  const workoutName = params.workoutName || 'Treino';

  const handleShare = async () => {
    try {
      await Share.share({
        message: `GymOS — ${workoutName}\n${formatDuration(duration)} · ${formatVolume(volume)} kg · ${completedSets} series\nBaixe o GymOS!`,
      });
    } catch (e) {}
  };

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* ── Celebration Header ── */}
        <View className="items-center pt-10 mb-8">
          <View className="w-24 h-24 rounded-full bg-primary items-center justify-center mb-5">
            <Trophy size={44} color="#0A0A0A" weight="bold" />
          </View>
          <Text className="text-textPrimary font-mono-bold text-2xl uppercase tracking-tighter">
            Treino Completo!
          </Text>
          <Text className="text-textSecondary font-mono text-[10px] uppercase tracking-widest mt-1">
            {workoutName}
          </Text>
        </View>

        {/* ── Main Metrics ── */}
        <View className="bg-surface border border-borderColor rounded-2xl p-5 mb-4">
          <View className="flex-row justify-between">
            <View className="items-center flex-1">
              <View className="flex-row items-center gap-1 mb-1">
                <Timer size={9} color="#888" />
                <Text className="text-textFaint font-mono text-[8px] uppercase">Duração</Text>
              </View>
              <Text className="text-primary font-mono-bold text-xl">{formatDuration(duration)}</Text>
            </View>
            <View className="w-[1px] bg-borderColor/30" />
            <View className="items-center flex-1">
              <View className="flex-row items-center gap-1 mb-1">
                <ChartBar size={9} color="#888" />
                <Text className="text-textFaint font-mono text-[8px] uppercase">Volume</Text>
              </View>
              <Text className="text-primary font-mono-bold text-xl">{formatVolume(volume)} kg</Text>
            </View>
            <View className="w-[1px] bg-borderColor/30" />
            <View className="items-center flex-1">
              <Text className="text-textFaint font-mono text-[8px] uppercase mb-1">Séries</Text>
              <Text className="text-primary font-mono-bold text-xl">{completedSets}</Text>
            </View>
          </View>
        </View>

        {/* ── Training Note ── */}
        <View className="bg-surface border border-borderColor rounded-2xl p-5 mb-4">
          <Text className="text-textSecondary font-mono-bold text-xs uppercase mb-3">Nota do Treino</Text>
          <View className="bg-bg border border-borderColor rounded-xl px-4 py-3 min-h-[100px]">
             <Text className="text-textFaint font-mono text-[10px] italic">Como foi o treino de hoje? (Em breve) </Text>
          </View>
        </View>

        {/* ── Share ── */}
        <Pressable
          onPress={handleShare}
          className="border border-primary rounded-2xl py-4 items-center justify-center flex-row mb-4 active:bg-primary/10"
        >
          <ShareNetwork size={14} color="#FBFF00" style={{ marginRight: 8 }} />
          <Text className="text-primary font-mono-bold text-xs uppercase">Compartilhar</Text>
        </Pressable>
      </ScrollView>

      {/* ── Bottom CTA ── */}
      <View className="absolute bottom-10 left-6 right-6">
        <Button
          title="Voltar ao Dashboard"
          onPress={() => router.replace('/(student)' as any)}
        />
      </View>
    </SafeAreaView>
  );
}
