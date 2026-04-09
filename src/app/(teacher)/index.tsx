import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TeacherDashboard() {
  return (
    <SafeAreaView className="flex-1 bg-bg px-6 pt-default">
      <View className="mb-section-gap">
        <Text className="text-textPrimary font-mono-bold text-4xl uppercase tracking-tighter">
          TEACHER /<Text className="text-primary">HUB</Text>
        </Text>
        <Text className="text-textSecondary font-mono text-xs mt-compact uppercase tracking-widest">
          Gestão de Alunos e Vendas
        </Text>
      </View>
      
      <View className="bg-surface border border-borderColor p-default">
         <Text className="text-primary font-mono-bold text-lg mb-micro">BEM-VINDO, PROFESSOR</Text>
         <Text className="text-textSecondary font-mono text-xs">Módulo v3.0 ativo.</Text>
      </View>
    </SafeAreaView>
  );
}
