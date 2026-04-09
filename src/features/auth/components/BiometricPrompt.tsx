import React from "react";
import { View, Text, Modal } from "react-native";
import { Button } from "../../../shared/components/ui/Button";

interface BiometricPromptProps {
  visible: boolean;
  onAuthenticate: () => void;
  onCancel: () => void;
}

export const BiometricPrompt: React.FC<BiometricPromptProps> = ({
  visible,
  onAuthenticate,
  onCancel,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 justify-center items-center bg-black/80 px-6">
        <View className="bg-surface border-[1px] border-primary p-8 w-full max-w-[320px]">
          <Text className="text-primary font-mono text-xl font-bold uppercase mb-4 tracking-tighter">
            Segurança Biométrica
          </Text>
          <Text className="text-white font-mono text-sm mb-8 leading-5">
            Use sua impressão digital ou reconhecimento facial para acessar seu treino com segurança.
          </Text>
          
          <Button title="Confirmar" onPress={onAuthenticate} className="mb-4" />
          <Button title="Cancelar" onPress={onCancel} variant="outline" />
        </View>
      </View>
    </Modal>
  );
};
