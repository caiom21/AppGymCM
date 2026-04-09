import { useRouter } from "expo-router";
import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { Button } from "../../../shared/components/ui/Button";
import { Input } from "../../../shared/components/ui/Input";
import { useAuth } from "../hooks/useAuth";
import { useBiometric } from "../hooks/useBiometric";

export const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const { authenticate } = useBiometric();
  const router = useRouter();


  const handleLogin = async () => {
    if (!email || !password) return;

    setLoading(true);
    const { error } = await signIn({ email, password });

    if (error) {
      alert(error.message || "Erro ao entrar. Verifique suas credenciais.");
    }
    // No need to redirect manually, _layout.tsx will handle it on session change
    setLoading(false);
  };

  const handleBiometric = async () => {
    const success = await authenticate();
    if (success) {
      // Biometrics usually needs a stored refresh token or similar
      // For now, we'll keep the TODO or use it to fast-track if a session existed
    }
  };


  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-bg"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6 pt-hero-pt">
        <View className="mb-section-gap">
          <View className="flex-row items-center mb-compact">
            <View className="w-2 h-2 bg-primary mr-2" />
            <Text className="text-primary font-mono text-[10px] uppercase tracking-[0.2em]">
              Sessão de Acesso
            </Text>
          </View>

          <Text className="text-textPrimary font-mono-bold text-5xl tracking-tighter leading-[0.9]">
            GYM/<Text className="text-primary">OS</Text>
          </Text>

          <Text className="text-textSecondary font-mono text-sm mt-default max-w-[280px] leading-relaxed">
            Sincronize seu treino com a plataforma de performance v2.0
          </Text>
        </View>

        <View className="mb-section-p-lg">
          <Input
            label="Credencial (E-mail)"
            placeholder="seu@perfil.os"
            value={email}
            onChangeText={setEmail}
          />
          <Input
            label="Chave de Acesso"
            placeholder="********"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <Button title="Entrar no Sistema" onPress={handleLogin} loading={loading} className="mb-default" />

        <View className="flex-row items-center gap-micro mb-section-gap">
          <View className="h-[1px] flex-1 bg-borderColor" />
          <Text className="text-textFaint font-mono text-[8px] uppercase px-2">Autenticação Biométrica</Text>
          <View className="h-[1px] flex-1 bg-borderColor" />
        </View>

        <Button
          title="Leitura Biométrica"
          onPress={handleBiometric}
          variant="outline"
        />

        <View className="flex-row justify-center mt-auto pb-hero-pt">
          <Text className="text-textSecondary font-mono text-[10px] uppercase">
            Novo Operador?{" "}
          </Text>
          <Pressable onPress={() => router.push("/(auth)/register" as any)}>
            <Text className="text-primary font-mono-bold text-[10px] uppercase">
              Registrar Perfil
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
