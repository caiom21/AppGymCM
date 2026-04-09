import React from "react";
import { View, Text, SafeAreaView } from "react-native";
import { useNetworkState } from "../../hooks/useNetworkState";

export const OfflineBanner = () => {
  const { isConnected } = useNetworkState();

  if (isConnected) return null;

  return (
    <SafeAreaView className="bg-warning">
      <View className="py-2 px-4 flex-row justify-center items-center">
        <Text className="text-bg font-mono text-[10px] font-bold uppercase tracking-widest">
          Modo Offline Ativo • Alterações serão sincronizadas
        </Text>
      </View>
    </SafeAreaView>
  );
};
