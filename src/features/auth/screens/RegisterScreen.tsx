import React, { useState } from "react";
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, Pressable } from "react-native";
import { Button } from "../../../shared/components/ui/Button";
import { Input } from "../../../shared/components/ui/Input";
import { useAuth } from "../hooks/useAuth";
import { useRouter } from "expo-router";

export const RegisterScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<"student" | "teacher">("student");
  const { signUp } = useAuth();
  const router = useRouter();

  const handleRegister = async () => {
    if (!email || !password || password !== confirmPassword) {
      alert("Por favor, verifique os campos e a senha.");
      return;
    }
    
    setLoading(true);
    const { error } = await signUp({ email, password }, role);
    
    if (error) {
      alert(error.message || "Erro ao criar conta.");
    } else {
      alert("Cadastro realizado! Verifique seu e-mail.");
      router.replace("/(auth)/login");
    }
    setLoading(false);
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
              Novo Cadastro
            </Text>
          </View>
          
          <Text className="text-textPrimary font-mono-bold text-5xl tracking-tighter leading-[0.9]">
            CRIAR/<Text className="text-primary">PERFIL</Text>
          </Text>
          
          <Text className="text-textSecondary font-mono text-sm mt-default max-w-[280px] leading-relaxed">
            Inicie sua jornada na plataforma de performance v2.0
          </Text>
        </View>

        <View className="mb-section-p">
          <Text className="text-textFaint font-mono text-[9px] uppercase tracking-widest mb-compact">
            SELECIONE SEU TIPO DE ACESSO:
          </Text>
          <View className="flex-row gap-compact">
            <Pressable 
              onPress={() => setRole("student")}
              className={`flex-1 p-compact border ${role === "student" ? "border-primary bg-surface2" : "border-borderColor bg-surface"}`}
            >
              <Text className={`font-mono-bold text-xs uppercase ${role === "student" ? "text-primary" : "text-textSecondary"}`}>
                Aluno/Atleta
              </Text>
              <Text className="text-textFaint font-mono text-[8px] mt-micro uppercase">
                Treine com motor v3.0
              </Text>
            </Pressable>
            <Pressable 
              onPress={() => setRole("teacher")}
              className={`flex-1 p-compact border ${role === "teacher" ? "border-primary bg-surface2" : "border-borderColor bg-surface"}`}
            >
              <Text className={`font-mono-bold text-xs uppercase ${role === "teacher" ? "text-primary" : "text-textSecondary"}`}>
                Professor/Coach
              </Text>
              <Text className="text-textFaint font-mono text-[8px] mt-micro uppercase">
                Venda planos e treinos
              </Text>
            </Pressable>
          </View>
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
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <Input
            label="Confirmar Chave"
            placeholder="Repita a senha"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>

        <Button title="Finalizar Registro" onPress={handleRegister} loading={loading} className="mb-default" />

        <View className="flex-row justify-center mt-auto pb-hero-pt">
          <Text className="text-textSecondary font-mono text-[10px] uppercase">
            Já possui acesso?{" "}
          </Text>
          <Pressable onPress={() => router.push("/(auth)/login" as any)}>
            <Text className="text-primary font-mono-bold text-[10px] uppercase">
              Entrar no Sistema
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
