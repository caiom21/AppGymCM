import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, Animated } from 'react-native';
import { useLiveWorkoutStore } from '../store/live-workout.store';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export const RestTimerOverlay = React.memo(() => {
  const { restTimerActive, restTimeLeft, restTimeTotal, tickRest, skipRest, addRestTime } =
    useLiveWorkoutStore();

  const flashAnim = useRef(new Animated.Value(1)).current;

  // Tick interval
  useEffect(() => {
    if (!restTimerActive) return;
    const interval = setInterval(tickRest, 1000);
    return () => clearInterval(interval);
  }, [restTimerActive, tickRest]);

  // Flash when done
  useEffect(() => {
    if (!restTimerActive && restTimeTotal > 0) {
      Animated.sequence([
        Animated.timing(flashAnim, { toValue: 0.3, duration: 150, useNativeDriver: true }),
        Animated.timing(flashAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
        Animated.timing(flashAnim, { toValue: 0.3, duration: 150, useNativeDriver: true }),
        Animated.timing(flashAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
        Animated.timing(flashAnim, { toValue: 0.3, duration: 150, useNativeDriver: true }),
        Animated.timing(flashAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();
    }
  }, [restTimerActive]);

  if (!restTimerActive) return null;

  const progress = restTimeTotal > 0 ? (restTimeTotal - restTimeLeft) / restTimeTotal : 0;
  const minutes = Math.floor(restTimeLeft / 60);
  const seconds = restTimeLeft % 60;
  const display = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <Animated.View
      style={{ opacity: flashAnim }}
      className="bg-surface border-b border-primary/40 px-4 py-3"
    >
      {/* Progress bar */}
      <View className="h-[3px] bg-borderColor rounded-full mb-2 overflow-hidden">
        <View
          className="h-full bg-primary rounded-full"
          style={{ width: `${progress * 100}%` }}
        />
      </View>

      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <FontAwesome name="clock-o" size={14} color="#FBFF00" />
          <Text className="text-primary font-mono-bold text-base tracking-tight">
            Descanso: {display}
          </Text>
        </View>

        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={() => addRestTime(30)}
            className="bg-accentDim px-3 py-1.5 border border-borderColor active:bg-primary/20"
          >
            <Text className="text-primary font-mono-bold text-[10px]">+30s</Text>
          </Pressable>
          <Pressable
            onPress={skipRest}
            className="bg-transparent px-3 py-1.5 border border-primary active:bg-primary/20"
          >
            <Text className="text-primary font-mono-bold text-[10px]">PULAR</Text>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
});
