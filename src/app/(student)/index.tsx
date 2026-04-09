import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  HandWaving,
  Fire,
  ChartBar,
  Gear,
  Bell,
  PlayCircle,
  CaretRight,
  Play,
  Lightning,
  ListBullets,
  Check,
} from 'phosphor-react-native';
import { useRouter } from 'expo-router';
import { useLiveWorkoutStore } from '@/src/features/workout-engine/store/live-workout.store';
import { engineFeedback } from '@/src/features/workout-engine/lib/feedback';
import { useAuth } from '@/src/features/auth/hooks/useAuth';
import { supabaseService } from '@/src/shared/services/supabase.service';

// ── Streak Calendar (7 days) ──
const WEEKDAY_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

function WeekCalendar({ sessions }: { sessions: any[] }) {
  const today = new Date();
  const dayOfWeek = (today.getDay() + 6) % 7; // Monday = 0

  // Check which days of the current week have sessions
  const completedDays = new Array(7).fill(false);
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - dayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0);

  sessions.forEach(s => {
    const sDate = new Date(s.started_at);
    if (sDate >= startOfWeek) {
      const diff = Math.floor((sDate.getTime() - startOfWeek.getTime()) / (1000 * 60 * 60 * 24));
      if (diff >= 0 && diff < 7) {
        completedDays[diff] = true;
      }
    }
  });

  return (
    <View className="flex-row justify-between">
      {WEEKDAY_LABELS.map((label, idx) => {
        const isToday = idx === dayOfWeek;
        const isDone = completedDays[idx];

        return (
          <View key={idx} className="items-center flex-1">
            <Text className="text-textFaint font-mono text-[8px] uppercase mb-1">{label}</Text>
            <View
              className={`w-9 h-9 rounded-lg items-center justify-center border ${
                isToday ? 'border-primary bg-primary/15' :
                isDone ? 'border-primary/50 bg-primary/10' :
                'border-borderColor/40'
              }`}
            >
              {isDone && <Check size={10} color="#FBFF00" weight="bold" />}
              {isToday && !isDone && <View className="w-2 h-2 rounded-full bg-primary" />}
            </View>
          </View>
        );
      })}
    </View>
  );
}

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const liveStore = useLiveWorkoutStore();
  
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [prCount, setPrCount] = useState(0);
  const [hasResumable, setHasResumable] = useState(false);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [userPlans, userStats, userPrs, resumable] = await Promise.all([
        supabaseService.fetchUserPlans(user.id),
        supabaseService.fetchUserStats(user.id),
        supabaseService.fetchPRs(user.id),
        liveStore.resumeSession(user.id)
      ]);
      setPlans(userPlans);
      setStats(userStats.data);
      // Bug fix: safe null check on data before accessing .length
      setPrCount(userPrs.data?.length ?? 0);
      setHasResumable(resumable);
    } catch (e) {
      console.error('Failed to load dashboard:', e);
    } finally {
      setLoading(false);
    }
  };

  const activePlan = plans.find(p => !p.is_archived) || null;

  const handleStartToday = async () => {
    if (!user) return;
    await engineFeedback.buttonPress();
    
    const planName = activePlan?.name || 'Treino do Dia';
    const exercises = activePlan?.exercises || [];
    
    await liveStore.startWorkout(user.id, planName, exercises);
    router.push('/(student)/workout/live-workout' as any);
  };

  const handleQuickStart = async () => {
    if (!user) return;
    await engineFeedback.buttonPress();
    await liveStore.startWorkout(user.id, 'Início Rápido');
    router.push('/(student)/workout/live-workout' as any);
  };

  const handleResume = () => {
    router.push('/(student)/workout/live-workout' as any);
  };

  if (loading) {
    return (
      <View className="flex-1 bg-bg items-center justify-center">
        <ActivityIndicator color="#FBFF00" />
      </View>
    );
  }

  // Bug fix: safe division — totalVolume may be undefined/null
  const totalVolumeKg = ((stats?.totalVolume ?? 0) / 1000).toFixed(1);

  // Function to calculate consecutive days streak
  const calculateStreak = (sessions: any[]) => {
    if (!sessions || sessions.length === 0) return 0;
    
    const dates = sessions.map(s => {
      const d = new Date(s.started_at);
      d.setHours(0,0,0,0);
      return d.getTime();
    });
    
    const uniqueDates = Array.from(new Set(dates)).sort((a, b) => b - a);
    let streak = 0;
    const today = new Date();
    today.setHours(0,0,0,0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (uniqueDates[0] !== today.getTime() && uniqueDates[0] !== yesterday.getTime()) {
      return 0;
    }
    
    let checkDate = uniqueDates[0] === today.getTime() ? today.getTime() : yesterday.getTime();
    
    for (const d of uniqueDates) {
      if (d === checkDate) {
        streak++;
        checkDate -= 86400000; // 1 day in ms
      } else if (d < checkDate) {
        // Gap found
        break;
      }
    }
    return streak;
  };

  const currentStreak = calculateStreak(stats?.sessions || []);

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>

        {/* ── Greeting Header ── */}
        <View className="flex-row items-center justify-between mt-4 mb-2">
          <View>
            <View className="flex-row items-center gap-2">
              <Text className="text-textPrimary font-mono-bold text-lg">
                Olá, {user?.user_metadata?.full_name?.split(' ')[0] || 'Atleta'}
              </Text>
              <HandWaving size={20} color="#FBFF00" weight="fill" />
            </View>
            <View className="flex-row items-center gap-1.5 mt-0.5">
              <Fire size={11} color="#FBFF00" weight="fill" />
              <Text className="text-primary font-mono text-[10px] uppercase tracking-wider">
                {currentStreak} {currentStreak === 1 ? 'dia seguido' : 'dias seguidos'}
              </Text>
            </View>
          </View>
          <View className="flex-row gap-3">
            <Pressable className="w-9 h-9 items-center justify-center border border-borderColor rounded-lg active:bg-surface">
              <Gear size={16} color="#888" />
            </Pressable>
            <Pressable className="w-9 h-9 items-center justify-center border border-borderColor rounded-lg active:bg-surface">
              <Bell size={16} color="#888" />
            </Pressable>
          </View>
        </View>

        {/* ── Resume Banner (crash recovery) ── */}
        {hasResumable && (
          <Pressable
            onPress={handleResume}
            className="bg-primary/10 border-l-4 border-primary p-4 mb-4 flex-row items-center justify-between active:bg-primary/20 rounded-r-xl"
          >
            <View className="flex-row items-center gap-3">
              <PlayCircle size={20} color="#FBFF00" weight="fill" />
              <View>
                <Text className="text-primary font-mono-bold text-xs uppercase">Treino em andamento</Text>
                <Text className="text-textSecondary font-mono text-[9px]">Retomar sessão anterior</Text>
              </View>
            </View>
            <CaretRight size={12} color="#FBFF00" weight="bold" />
          </Pressable>
        )}

        {/* ── Primary CTA: Active Plan ── */}
        {activePlan ? (
          <View className="bg-surface border border-borderColor rounded-2xl p-5 mb-3">
            <Text className="text-primary font-mono text-[9px] uppercase tracking-widest mb-2">Treino de Hoje</Text>
            <Text className="text-textPrimary font-mono-bold text-xl uppercase mb-1">
              {activePlan.name}
            </Text>

            <View className="flex-row gap-5 mb-4 mt-2">
              <View>
                <Text className="text-textFaint font-mono text-[8px] uppercase">Exercícios</Text>
                <Text className="text-textPrimary font-mono-bold text-lg">{activePlan.exercises?.length || 0}</Text>
              </View>
              <View>
                <Text className="text-textFaint font-mono text-[8px] uppercase">Status</Text>
                <Text className="text-textPrimary font-mono-bold text-lg">Ativo</Text>
              </View>
            </View>

            <Pressable
              onPress={handleStartToday}
              className="h-14 bg-primary rounded-xl items-center justify-center flex-row active:bg-primary/80"
            >
              <Play size={14} color="#0A0A0A" weight="fill" style={{ marginRight: 10 }} />
              <Text className="text-bg font-mono-bold text-sm uppercase tracking-wider">
                Iniciar Treino
              </Text>
            </Pressable>
          </View>
        ) : (
          <View className="bg-surface border border-borderColor rounded-2xl p-5 mb-3 items-center">
            <View className="w-12 h-12 rounded-full bg-accentDim items-center justify-center mb-3">
              <ListBullets size={20} color="#FBFF00" />
            </View>
            <Text className="text-textPrimary font-mono-bold text-lg uppercase mb-1">Nenhum Plano Ativo</Text>
            <Text className="text-textFaint font-mono text-xs text-center mb-4">Escolha um plano para começar a acompanhar seu progresso.</Text>
            
            <Pressable
              onPress={() => router.push('/(student)/plans/index' as any)}
              className="w-full h-12 bg-primary/20 rounded-xl items-center justify-center active:bg-primary/30"
            >
              <Text className="text-primary font-mono-bold text-xs uppercase tracking-wider">
                Meus Planos
              </Text>
            </Pressable>
          </View>
        )}

        {/* ── Secondary CTAs ── */}
        <View className="flex-row gap-3 mb-5">
          <Pressable
            onPress={handleQuickStart}
            className="flex-1 border border-primary h-12 rounded-xl items-center justify-center flex-row active:bg-primary/10"
          >
            <Lightning size={13} color="#FBFF00" weight="fill" style={{ marginRight: 6 }} />
            <Text className="text-primary font-mono-bold text-[10px] uppercase">Início Rápido</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/(student)/plans/index' as any)}
            className="flex-1 border border-borderColor h-12 rounded-xl items-center justify-center flex-row active:bg-surface"
          >
            <ListBullets size={13} color="#888" style={{ marginRight: 6 }} />
            <Text className="text-textSecondary font-mono-bold text-[10px] uppercase">Meus Planos</Text>
          </Pressable>
        </View>

        {/* ── Weekly View ── */}
        <View className="bg-surface border border-borderColor rounded-2xl p-4 mb-5">
          <View className="flex-row items-center gap-2 mb-3">
            <ChartBar size={11} color="#888" />
            <Text className="text-textFaint font-mono-bold text-[9px] uppercase tracking-widest">
              Sua Semana
            </Text>
          </View>
          <WeekCalendar sessions={stats?.sessions || []} />
        </View>

        {/* ── Stats Summary ── */}
        <View className="flex-row gap-3 mb-5">
          <View className="flex-1 bg-surface border border-borderColor rounded-2xl p-4 items-center">
            <Text className="text-textFaint font-mono text-[8px] uppercase mb-1">Volume Total</Text>
            <Text className="text-textPrimary font-mono-bold text-lg">{totalVolumeKg}k <Text className="text-sm font-mono text-textFaint">kg</Text></Text>
          </View>
          <View className="flex-1 bg-surface border border-borderColor rounded-2xl p-4 items-center">
            <Text className="text-textFaint font-mono text-[8px] uppercase mb-1">Recordes Pessoais</Text>
            <Text className="text-textPrimary font-mono-bold text-lg">{prCount} <Text className="text-sm font-mono text-textFaint">PRs</Text></Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
