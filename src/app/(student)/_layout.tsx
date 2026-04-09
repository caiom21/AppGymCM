import React from 'react';
import { View, Pressable } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import {
  House,
  BookOpen,
  Plus,
  ShoppingCart,
  User,
} from 'phosphor-react-native';
import { useLiveWorkoutStore } from '@/src/features/workout-engine/store/live-workout.store';
import { engineFeedback } from '@/src/features/workout-engine/lib/feedback';
import { useAuth } from '@/src/features/auth/hooks/useAuth';

const PRIMARY = '#FBFF00';
const INACTIVE = '#888888';

// Center FAB button for Quick Start
function QuickStartFAB() {
  const router = useRouter();
  const liveStore = useLiveWorkoutStore();
  const { user } = useAuth();

  const handlePress = async () => {
    if (!user) return;
    await engineFeedback.buttonPress();
    await liveStore.startWorkout(user.id, 'Treino Rápido');
    router.push('/(student)/workout/live-workout' as any);
  };

  return (
    <Pressable
      onPress={handlePress}
      className="w-14 h-14 bg-primary rounded-full items-center justify-center -mt-6 shadow-lg active:bg-primary/80"
      style={{
        shadowColor: '#FBFF00',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
      }}
    >
      <Plus size={22} color="#0A0A0A" weight="bold" />
    </Pressable>
  );
}

export default function TabLayout() {
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: PRIMARY,
        tabBarInactiveTintColor: INACTIVE,
        tabBarStyle: {
          backgroundColor: '#0A0A0A',
          borderTopWidth: 1,
          borderTopColor: 'rgba(255, 255, 255, 0.08)',
          height: 92,
          paddingBottom: 32,
          paddingTop: 12,
        },
        headerStyle: {
          backgroundColor: '#0A0A0A',
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(255, 255, 255, 0.08)',
        },
        headerTitleStyle: {
          fontFamily: 'JetBrainsMono_700Bold',
          fontSize: 18,
          color: '#FFFFFF',
          letterSpacing: -0.5,
        },
        tabBarLabelStyle: {
          fontFamily: 'JetBrainsMono_400Regular',
          fontSize: 9,
          textTransform: 'uppercase',
          letterSpacing: 1,
        },
        headerShown: true,
      }}>
      {/* ── Tab 1: Home ── */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'HOME',
          headerShown: false,
          tabBarIcon: ({ color }) => <House size={22} color={color} weight={color === PRIMARY ? 'fill' : 'regular'} />,
        }}
      />

      {/* ── Tab 2: Plans ── */}
      <Tabs.Screen
        name="plans/index"
        options={{
          title: 'PLANOS',
          tabBarIcon: ({ color }) => <BookOpen size={22} color={color} weight={color === PRIMARY ? 'fill' : 'regular'} />,
        }}
      />

      {/* ── Tab 3: Center FAB (Quick Start) ── */}
      <Tabs.Screen
        name="quick-start"
        options={{
          title: '',
          tabBarButton: () => <QuickStartFAB />,
        }}
        listeners={{
          tabPress: (e) => { e.preventDefault(); },
        }}
      />

      {/* ── Tab 4: Store ── */}
      <Tabs.Screen
        name="store/index"
        options={{
          title: 'LOJA',
          tabBarIcon: ({ color }) => <ShoppingCart size={22} color={color} weight={color === PRIMARY ? 'fill' : 'regular'} />,
        }}
      />

      {/* ── Tab 5: Profile ── */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'PERFIL',
          headerShown: false,
          tabBarIcon: ({ color }) => <User size={22} color={color} weight={color === PRIMARY ? 'fill' : 'regular'} />,
        }}
      />

      {/* ── Hidden Routes ── */}
      <Tabs.Screen
        name="workout/live-workout"
        options={{
          href: null,
          tabBarStyle: { display: 'none' },
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="workout/summary"
        options={{
          href: null,
          tabBarStyle: { display: 'none' },
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="plans/[id]/edit"
        options={{
          href: null,
          tabBarStyle: { display: 'none' },
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="plans/create"
        options={{
          href: null,
          tabBarStyle: { display: 'none' },
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
