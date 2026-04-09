import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TeacherPlansScreen() {
  return (
    <SafeAreaView className="flex-1 bg-bg px-6 pt-default">
      <View className="mb-section-gap">
        <Text className="text-textPrimary font-mono-bold text-4xl uppercase tracking-tighter">
          GESTÃO /<Text className="text-primary">PLANOS</Text>
        </Text>
        <Text className="text-textSecondary font-mono text-xs mt-compact uppercase tracking-widest">
          Criar e Publicar templates de treino
        </Text>
      </View>
      
      <View className="flex-1 items-center justify-center border border-dashed border-borderColor p-10">
        <Text className="text-textFaint font-mono text-[10px] uppercase text-center">
          Editor de Planos v3.0 // Drag-and-Drop em breve
        </Text>
      </View>
    </SafeAreaView>
  );
}
