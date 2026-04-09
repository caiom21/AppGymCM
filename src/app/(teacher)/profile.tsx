import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/src/shared/components/ui/Button';
import { useAuth } from '@/src/features/auth/hooks/useAuth';

export default function TeacherProfileScreen() {
  const { user, signOut, role } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-bg px-6 pt-default">
      <View className="mb-section-gap">
        <Text className="text-textPrimary font-mono-bold text-4xl uppercase tracking-tighter">
          TEACHER /<Text className="text-primary">PROFILE</Text>
        </Text>
        <Text className="text-textSecondary font-mono text-xs mt-compact uppercase tracking-widest">
          Conta Verificada: Professor
        </Text>
      </View>

      <View className="bg-surface border border-borderColor p-default mb-default">
         <Text className="text-textPrimary font-mono text-xs mb-micro">ID: {user?.id}</Text>
         <Text className="text-textSecondary font-mono text-[10px]">{user?.email}</Text>
      </View>
      
      <Button title="Encerrar Sessão" variant="outline" onPress={signOut} className="mt-auto mb-hero-pt" />
    </SafeAreaView>
  );
}
