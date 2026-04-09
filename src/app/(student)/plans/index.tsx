import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Plus,
  MagicWand,
  Star,
  Barbell,
  CircleDashed,
} from 'phosphor-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/features/auth/hooks/useAuth';
import { supabaseService } from '@/src/shared/services/supabase.service';
import { supabase } from '@/src/shared/lib/supabase';

const TEMPLATE_CATEGORIES = [
  { id: '1', name: 'Iniciante', price: 'Grátis', Icon: CircleDashed },
  { id: '2', name: 'Hipertrofia', price: 'R$ 19', Icon: Barbell },
  { id: '3', name: 'Força 5×5', price: 'Grátis', Icon: Barbell },
];

type FilterType = 'all' | 'active' | 'archived';

export default function PlansScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadPlans();
    }
  }, [user]);

  const loadPlans = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await supabaseService.fetchUserPlans(user.id);
      setPlans(data);
    } catch (e) {
      console.error('Failed to load plans:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleArchive = async (plan: any) => {
    try {
      await supabaseService.upsertPlan(user!.id, {
        id: plan.id,
        is_archived: !plan.is_archived
      });
      loadPlans();
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível alterar o status do plano.');
    }
  };

  const handleDeletePlan = async (plan: any) => {
    Alert.alert('Excluir Plano', `Tem certeza que deseja excluir "${plan.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
        try {
          const { error } = await supabase.from('user_workouts').delete().eq('id', plan.id);
          if (error) throw error;
          loadPlans();
        } catch (e) {
          Alert.alert('Erro', 'Não foi possível excluir o plano.');
        }
      }},
    ]);
  };

  const handleContextMenu = (plan: any) => {
    Alert.alert(plan.name, undefined, [
      { text: plan.is_archived ? 'Restaurar' : 'Arquivar', onPress: () => handleToggleArchive(plan) },
      { text: 'Editar plano', onPress: () => router.push({ pathname: '/(student)/plans/[id]/edit' as any, params: { id: plan.id } }) },
      { text: 'Excluir', style: 'destructive', onPress: () => handleDeletePlan(plan) },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const filteredPlans = plans.filter(p => {
    if (filter === 'archived') return p.is_archived;
    if (filter === 'active') return !p.is_archived;
    return true;
  });

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['bottom']}>
      <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* ── Header ── */}
        <View className="mb-6">
          <Text className="text-textPrimary font-mono-bold text-2xl uppercase tracking-tighter">
            Meus Planos
          </Text>
          <Text className="text-textFaint font-mono text-[10px] uppercase tracking-widest mt-1">
            Build your legend
          </Text>
        </View>

        {/* ── Quick Actions ── */}
        <View className="flex-row gap-3 mb-6">
          <Pressable
            onPress={() => router.push('/(student)/plans/create' as any)}
            className="flex-1 bg-primary h-14 rounded-2xl items-center justify-center active:bg-primary/80 shadow-lg shadow-primary/20"
          >
            <View className="flex-row items-center gap-2">
              <Plus size={14} color="#0A0A0A" weight="bold" />
              <Text className="text-bg font-mono-bold text-[10px] uppercase tracking-wider">Novo Plano</Text>
            </View>
          </Pressable>
          <Pressable
            onPress={() => router.push('/(student)/store/index' as any)}
            className="flex-1 bg-surface border border-borderColor h-14 rounded-2xl items-center justify-center active:bg-accentDim"
          >
            <View className="flex-row items-center gap-2">
              <MagicWand size={14} color="#FBFF00" />
              <Text className="text-primary font-mono-bold text-[10px] uppercase tracking-wider">Customizar</Text>
            </View>
          </Pressable>
        </View>

        {/* ── Filters ── */}
        <View className="flex-row bg-surface border border-borderColor rounded-xl overflow-hidden mb-5">
          {(['all', 'active', 'archived'] as FilterType[]).map((f) => (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              className={`flex-1 py-2.5 items-center ${filter === f ? 'bg-primary' : ''}`}
            >
              <Text className={`font-mono-bold text-[10px] uppercase ${filter === f ? 'text-bg' : 'text-textFaint'}`}>
                {f === 'all' ? 'Todos' : f === 'active' ? 'Ativos' : 'Arquivados'}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* ── Plan Cards ── */}
        {loading ? (
          <ActivityIndicator color="#FBFF00" className="py-10" />
        ) : filteredPlans.length === 0 ? (
          <View className="py-10 items-center">
            <Text className="text-textFaint font-mono text-xs">Nenhum plano encontrado.</Text>
          </View>
        ) : (
          filteredPlans.map((plan) => (
            <Pressable
              key={plan.id}
              onPress={() => router.push({ pathname: '/(student)/plans/[id]/edit' as any, params: { id: plan.id } })}
              onLongPress={() => handleContextMenu(plan)}
              delayLongPress={400}
              className={`bg-surface border border-borderColor rounded-2xl p-4 mb-3 active:bg-accentDim ${plan.is_archived ? 'opacity-50' : ''}`}
            >
              <View className="flex-row items-center gap-2 mb-1">
                {!plan.is_archived && <Star size={12} color="#FBFF00" weight="fill" />}
                <Text className="text-textPrimary font-mono-bold text-sm uppercase flex-1">{plan.name}</Text>
              </View>
              <Text className="text-textFaint font-mono text-[10px] mb-2">
                {plan.exercises?.length || 0} exercícios
              </Text>
              <Text className="text-textFaint/60 font-mono text-[9px]">
                Atualizado em: {new Date(plan.updated_at).toLocaleDateString('pt-BR')}
              </Text>
            </Pressable>
          ))
        )}

        {/* ── Discover Section ── */}
        <View className="mt-6 mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-textFaint font-mono-bold text-[9px] uppercase tracking-widest">
              Descubra Planos
            </Text>
            <Pressable>
              <Text className="text-primary font-mono text-[9px]">Ver todos →</Text>
            </Pressable>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-1">
            {TEMPLATE_CATEGORIES.map((tpl) => (
              <Pressable
                key={tpl.id}
                className="bg-surface border border-borderColor rounded-2xl p-4 mr-3 w-32 items-center active:bg-accentDim"
              >
                <View className="w-10 h-10 rounded-xl bg-accentDim items-center justify-center mb-2">
                  <tpl.Icon size={20} color="#FBFF00" />
                </View>
                <Text className="text-textPrimary font-mono-bold text-[10px] uppercase text-center mb-1">{tpl.name}</Text>
                <Text className={`font-mono-bold text-[9px] ${tpl.price === 'Grátis' ? 'text-primary' : 'text-textFaint'}`}>{tpl.price}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
