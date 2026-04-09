import React from "react";
import { TouchableOpacity, Text, ActivityIndicator } from "react-native";

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  variant?: "primary" | "secondary" | "outline";
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  loading,
  variant = "primary",
  className,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return "bg-primary border-primary";
      case "secondary":
        return "bg-surface2 border-surface2";
      case "outline":
        return "bg-transparent border-primary";
      default:
        return "bg-primary border-primary";
    }
  };

  const getTextColor = () => {
    return variant === "primary" ? "text-bg" : "text-primary";
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading}
      className={`h-[52px] justify-center items-center border-[1px] px-card-p rounded-none ${getVariantStyles()} ${className}`}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? "#0A0A0A" : "#CCFF00"} />
      ) : (
        <Text className={`font-mono text-sm uppercase tracking-widest font-bold ${getTextColor()}`}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};
