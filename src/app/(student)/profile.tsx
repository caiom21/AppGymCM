import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  User,
  CaretRight,
  Fire,
  Barbell,
  ChartBar,
  Trophy,
  Ruler,
  Camera,
  Gear,
  Bell,
  PaintBrush,
  Lock,
  Diamond,
  SignOut,
} from 'phosphor-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/features/auth/hooks/useAuth';
import { supabaseService } from '@/src/shared/services/supabase.service';
import { supabase } from '@/src/shared/lib/supabase';

// ── Icon mapping for menu items ──
const ANALYTICS_ITEMS = [
  { label: 'Estatísticas Detalhadas', Icon: ChartBar, route: '/(student)/historyindex' },
  { label: 'Conquistas e Badges', Icon: Trophy, route: '/(student)/historyindex' },
  { label: 'Medidas Corporais', Icon: Ruler, route: '/(student)/historyindex' },
  { label: 'Fotos de Progresso', Icon: Camera, route: '/(student)/historyindex' },
];

const SETTINGS_ITEMS = [
  { Icon: Gear, label: 'Preferências de Treino', desc: 'Unidade, Timer, Sons' },
  { Icon: Bell, label: 'Notificações', desc: 'Lembretes e Status' },
  { Icon: PaintBrush, label: 'Aparência', desc: 'Tema e Cores' },
  { Icon: Lock, label: 'Segurança', desc: 'Biometria e Privacidade' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [prCount, setPrCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [userStats, userPrs] = await Promise.all([
        supabaseService.fetchUserStats(user!.id),
        supabaseService.fetchPRs(user!.id)
      ]);
      setStats(userStats.data);
      setPrCount(userPrs.data?.length ?? 0);
    } catch (e) {
      console.error('Failed to load stats:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Sair', 'Deseja sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      { 
        text: 'Sair', 
        style: 'destructive', 
        onPress: async () => {
          await supabase.auth.signOut();
        } 
      },
    ]);
  };

  if (loading) {
    return (
      <View className="flex-1 bg-bg items-center justify-center">
        <ActivityIndicator color="#FBFF00" />
      </View>
    );
  }

  const avatarUrl = user?.user_metadata?.avatar_url;
  const totalVolumeKg = ((stats?.totalVolume ?? 0) / 1000).toFixed(1);

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* ── Profile Header ── */}
        <View className="items-center py-10">
          <View className="w-24 h-24 rounded-full bg-accentDim items-center justify-center border-2 border-primary mb-4 shadow-lg shadow-black/20 overflow-hidden">
            {avatarUrl ? (
              // Bug fix: actually render the Image when avatar_url exists
              <Image
                source={{ uri: avatarUrl }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <User size={32} color="#FBFF00" weight="fill" />
            )}
          </View>
          <Text className="text-textPrimary font-mono-bold text-xl uppercase">{user?.user_metadata?.full_name || 'Usuário GymOS'}</Text>
          <Text className="text-textFaint font-mono text-[10px] uppercase tracking-widest mt-1">
            {user?.email}
          </Text>

          {/* Stats Row */}
          <View className="flex-row gap-8 mt-8 w-full justify-center px-4">
            <View className="items-center flex-1">
              <Text className="text-primary font-mono-bold text-2xl">{stats?.totalWorkouts || 0}</Text>
              <View className="flex-row items-center gap-1 mt-0.5">
                <Fire size={9} color="#888" />
                <Text className="text-textFaint font-mono text-[8px] uppercase tracking-tighter">Treinos</Text>
              </View>
            </View>
            <View className="w-[1px] h-8 bg-borderColor/20 mt-2" />
            <View className="items-center flex-1">
              <Text className="text-primary font-mono-bold text-2xl">{prCount}</Text>
              <View className="flex-row items-center gap-1 mt-0.5">
                <Barbell size={9} color="#888" />
                <Text className="text-textFaint font-mono text-[8px] uppercase tracking-tighter">PRs</Text>
              </View>
            </View>
            <View className="w-[1px] h-8 bg-borderColor/20 mt-2" />
            <View className="items-center flex-1">
              <Text className="text-primary font-mono-bold text-2xl">{totalVolumeKg}k</Text>
              <View className="flex-row items-center gap-1 mt-0.5">
                <ChartBar size={9} color="#888" />
                <Text className="text-textFaint font-mono text-[8px] uppercase tracking-tighter">kg total</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Analytics Section ── */}
        <View className="flex-row items-center gap-1.5 mb-2 px-1">
          <ChartBar size={10} color="#888" />
          <Text className="text-textFaint font-mono-bold text-[9px] uppercase tracking-widest">
            Analytics e Medidas
          </Text>
        </View>
        <View className="bg-surface border border-borderColor rounded-2xl mb-6 overflow-hidden">
          {ANALYTICS_ITEMS.map((item, i, arr) => (
            <Pressable
              key={i}
              onPress={() => item.route && router.push(item.route as any)}
              className={`flex-row items-center px-4 py-4 active:bg-accentDim ${i < arr.length - 1 ? 'border-b border-borderColor/10' : ''}`}
            >
              <View className="w-7 h-7 rounded-lg bg-accentDim items-center justify-center mr-3">
                <item.Icon size={14} color="#FBFF00" />
              </View>
              <Text className="text-textPrimary font-mono text-xs flex-1">{item.label}</Text>
              <CaretRight size={10} color="#333" />
            </Pressable>
          ))}
        </View>

        {/* ── Settings Section ── */}
        <View className="flex-row items-center gap-1.5 mb-2 px-1">
          <Gear size={10} color="#888" />
          <Text className="text-textFaint font-mono-bold text-[9px] uppercase tracking-widest">
            Ajustes do App
          </Text>
        </View>
        <View className="bg-surface border border-borderColor rounded-2xl mb-6 overflow-hidden">
          {SETTINGS_ITEMS.map((item, i, arr) => (
            <Pressable
              key={i}
              className={`px-4 py-4 active:bg-accentDim ${i < arr.length - 1 ? 'border-b border-borderColor/10' : ''}`}
            >
              <View className="flex-row items-center">
                <View className="w-7 h-7 rounded-lg bg-accentDim items-center justify-center mr-3">
                  <item.Icon size={14} color="#FBFF00" />
                </View>
                <View className="flex-1">
                  <Text className="text-textPrimary font-mono text-xs">{item.label}</Text>
                  <Text className="text-textFaint font-mono text-[9px] mt-0.5">{item.desc}</Text>
                </View>
                <CaretRight size={10} color="#333" />
              </View>
            </Pressable>
          ))}
        </View>

        {/* ── Premium ── */}
        <Pressable className="bg-primary/5 border border-primary/20 rounded-2xl p-5 mb-6 flex-row items-center active:bg-primary/10">
          <View className="w-12 h-12 rounded-xl bg-primary/20 items-center justify-center mr-4">
            <Diamond size={22} color="#FBFF00" weight="fill" />
          </View>
          <View className="flex-1">
            <Text className="text-primary font-mono-bold text-sm">GymOS Pro</Text>
            <Text className="text-textFaint font-mono text-[9px]">Acesse planos exclusivos e métricas avançadas.</Text>
          </View>
          <CaretRight size={10} color="#FBFF00" />
        </Pressable>

        {/* ── Danger Zone ── */}
        <Pressable
          onPress={handleLogout}
          className="border border-red-500/20 rounded-2xl py-4 items-center flex-row justify-center gap-2 mb-8 active:bg-red-500/5"
        >
          <SignOut size={14} color="#F87171" />
          <Text className="text-red-400 font-mono-bold text-xs uppercase tracking-widest">Sair da Conta</Text>
        </Pressable>

        {/* ── Version ── */}
        <View className="items-center opacity-30 mb-10">
          <Text className="text-textFaint font-mono text-[8px] uppercase tracking-widest">GymOS Engine v4.0.2</Text>
          <Text className="text-textFaint font-mono text-[8px] uppercase mt-1">Conectado ao Supabase Cluster</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
