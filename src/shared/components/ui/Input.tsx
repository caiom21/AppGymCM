import React from "react";
import { TextInput, View, Text } from "react-native";

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  error?: string;
  className?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  error,
  className,
}) => {
  return (
    <View className={`mb-default ${className}`}>
      {label && (
        <Text className="text-primary font-mono text-[10px] uppercase mb-1 tracking-widest">
          {label}
        </Text>
      )}
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#888888"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        className={`h-[56px] bg-surface border-[1px] ${error ? "border-error" : "border-surface2"} text-white px-4 font-mono text-sm focus:border-primary`}
        cursorColor="#CCFF00"
      />
      {error && (
        <Text className="text-error font-mono text-[10px] mt-1 uppercase">
          {error}
        </Text>
      )}
    </View>
  );
};
