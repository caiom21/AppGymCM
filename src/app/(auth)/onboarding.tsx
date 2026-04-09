import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Barbell,
  Fire,
  Lightning,
  Heart,
  CheckCircle,
  Minus,
  Plus,
} from 'phosphor-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/features/auth/hooks/useAuth';
import { supabase } from '@/src/shared/lib/supabase';
import { engineFeedback } from '@/src/features/workout-engine/lib/feedback';

const { width } = Dimensions.get('window');

const GOALS = [
  { id: 'hypertrophy', label: 'Ganhar Massa', Icon: Barbell, desc: 'Foco em hipertrofia e volume' },
  { id: 'fat_loss', label: 'Perder Gordura', Icon: Fire, desc: 'Redução de gordura e definição' },
  { id: 'conditioning', label: 'Condicionamento', Icon: Lightning, desc: 'Força, explosão e agilidade' },
  { id: 'wellness', label: 'Saúde & Bem-estar', Icon: Heart, desc: 'Qualidade de vida e mobilidade' },
];

const EXPERIENCE = [
  { id: 'beginner', label: 'Iniciante', level: '1-6 meses' },
  { id: 'intermediate', label: 'Intermediário', level: '1-2 anos' },
  { id: 'advanced', label: 'Avançado', level: '3+ anos' },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Form State
  const [goal, setGoal] = useState('');
  const [exp, setExp] = useState('');
  const [days, setDays] = useState(3);

  const nextStep = async () => {
    await engineFeedback.buttonPress();
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Update Profile with onboarding data
      const { error: pError } = await supabase
        .from('profiles')
        .update({
          goal,
          experience_level: exp,
          training_days_per_week: days,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (pError) throw pError;

      // 2. Create Initial Plan based on choices (Simple Template)
      const { error: wError } = await supabase
        .from('user_workouts')
        .insert({
          user_id: user.id,
          name: `Plano ${GOALS.find(g => g.id === goal)?.label || 'Inicial'}`,
          exercises: [], // In a real app, we'd pick a template here
          is_archived: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (wError) throw wError;

      router.replace('/(student)');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <View className="flex-1 justify-center px-10">
            <View className="w-20 h-20 bg-primary rounded-3xl items-center justify-center mb-8 rotate-12 shadow-xl shadow-primary/40">
              <Lightning size={36} color="#0A0A0A" weight="fill" />
            </View>
            <Text className="text-textPrimary font-mono-bold text-4xl uppercase tracking-tighter leading-tight">
              Bem-vindo ao{'\n'}
              <Text className="text-primary italic">GymOS</Text>
            </Text>
            <Text className="text-textFaint font-mono text-xs mt-4 leading-5">
              O sistema operacional do seu treino.{'\n'}
              Mínima fricção, máxima performance.
            </Text>
          </View>
        );
      case 1:
        return (
          <View className="flex-1 px-6 pt-10">
            <Text className="text-textPrimary font-mono-bold text-2xl uppercase mb-2">Qual seu objetivo?</Text>
            <Text className="text-textFaint font-mono text-[10px] uppercase tracking-widest mb-8">Escolha a sua jornada</Text>
            
            {GOALS.map((g) => (
              <Pressable
                key={g.id}
                onPress={() => setGoal(g.id)}
                className={`flex-row items-center p-5 rounded-2xl border mb-3 active:scale-95 transition-all ${goal === g.id ? 'border-primary bg-primary/10' : 'border-borderColor bg-surface'}`}
              >
                <View className="w-12 h-12 rounded-xl bg-accentDim items-center justify-center mr-4">
                  <g.Icon size={22} color={goal === g.id ? '#FBFF00' : '#888'} weight={goal === g.id ? 'fill' : 'regular'} />
                </View>
                <View className="flex-1">
                  <Text className={`font-mono-bold text-sm uppercase ${goal === g.id ? 'text-primary' : 'text-textPrimary'}`}>{g.label}</Text>
                  <Text className="text-textFaint font-mono text-[9px] mt-1">{g.desc}</Text>
                </View>
                {goal === g.id && <CheckCircle size={20} color="#FBFF00" weight="fill" />}
              </Pressable>
            ))}
          </View>
        );
      case 2:
        return (
          <View className="flex-1 px-6 pt-10">
            <Text className="text-textPrimary font-mono-bold text-2xl uppercase mb-2">Sua experiência?</Text>
            <Text className="text-textFaint font-mono text-[10px] uppercase tracking-widest mb-8">Para adaptarmos os volumes</Text>
            
            {EXPERIENCE.map((e) => (
              <Pressable
                key={e.id}
                onPress={() => setExp(e.id)}
                className={`p-6 rounded-2xl border mb-3 active:scale-95 transition-all ${exp === e.id ? 'border-primary bg-primary/10' : 'border-borderColor bg-surface'}`}
              >
                <Text className={`font-mono-bold text-sm uppercase ${exp === e.id ? 'text-primary' : 'text-textPrimary'}`}>{e.label}</Text>
                <Text className="text-textFaint font-mono text-[9px] mt-1">{e.level}</Text>
              </Pressable>
            ))}
          </View>
        );
      case 3:
        return (
          <View className="flex-1 px-6 pt-10">
            <Text className="text-textPrimary font-mono-bold text-2xl uppercase mb-2">Quantos dias?</Text>
            <Text className="text-textFaint font-mono text-[10px] uppercase tracking-widest mb-10">Frequência semanal ideal</Text>
            
            <View className="flex-row justify-between items-center bg-surface border border-borderColor p-6 rounded-3xl">
              <Pressable onPress={() => setDays(Math.max(2, days - 1))} className="w-12 h-12 bg-bg border border-borderColor rounded-full items-center justify-center active:bg-accentDim">
                <Minus size={16} color="#FBFF00" weight="bold" />
              </Pressable>
              
              <View className="items-center">
                <Text className="text-primary font-mono-bold text-5xl">{days}</Text>
                <Text className="text-textFaint font-mono text-[9px] uppercase mt-2">Dias por semana</Text>
              </View>
              
              <Pressable onPress={() => setDays(Math.min(7, days + 1))} className="w-12 h-12 bg-bg border border-borderColor rounded-full items-center justify-center active:bg-accentDim">
                <Plus size={16} color="#FBFF00" weight="bold" />
              </Pressable>
            </View>

            <View className="mt-10 p-5 bg-primary/5 border border-primary/20 rounded-2xl">
              <Text className="text-textFaint font-mono text-[10px] text-center italic">
                "Consistência supera intensidade. Escolha uma meta realista."
              </Text>
            </View>
          </View>
        );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bg">
      {/* Progress Bar */}
      <View className="flex-row h-1.5 px-6 gap-2 mt-4">
        {[0, 1, 2, 3].map((s) => (
          <View key={s} className={`flex-1 rounded-full ${s <= step ? 'bg-primary' : 'bg-borderColor/30'}`} />
        ))}
      </View>

      <View className="flex-1">
        {renderStep()}
      </View>

      <View className="p-6">
        <Pressable
          onPress={nextStep}
          disabled={loading || (step === 1 && !goal) || (step === 2 && !exp)}
          className={`h-16 rounded-2xl items-center justify-center flex-row ${loading || (step === 1 && !goal) || (step === 2 && !exp) ? 'bg-primary/20' : 'bg-primary active:scale-95'}`}
        >
          {loading ? (
            <ActivityIndicator color="#0A0A0A" />
          ) : (
            <Text className="text-bg font-mono-bold text-sm uppercase tracking-wider">
              {step === 0 ? 'Começar Jornada' : step === 3 ? 'Finalizar Setup' : 'Continuar'}
            </Text>
          )}
        </Pressable>
        {step > 0 && !loading && (
           <Pressable onPress={() => setStep(step - 1)} className="mt-4 items-center">
             <Text className="text-textFaint font-mono text-[10px] uppercase">Voltar</Text>
           </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}
