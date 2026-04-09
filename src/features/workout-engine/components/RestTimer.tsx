import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { Button } from '@/src/shared/components/ui/Button';
import { engineFeedback } from '../lib/feedback';
import { Audio } from 'expo-av';

interface RestTimerProps {
  initialSeconds: number;
  onTimerEnd: () => void;
  onSkip: () => void;
}

export const RestTimer = React.memo(({ initialSeconds, onTimerEnd, onSkip }: RestTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const onTimerEndRef = React.useRef(onTimerEnd);
  // Keep ref continuously updated
  useEffect(() => {
    onTimerEndRef.current = onTimerEnd;
  }, [onTimerEnd]);

  useEffect(() => {
    // Attempt to load a default audio sound for transitions
    // In a real scenario we'd use bundled local assets (e.g. require('../../assets/sounds/beep.wav'))
    // Using a try-catch to ensure app doesn't crash if asset misses
    async function setupAudio() {
      try {
        // Placeholder for real audio loading
        // const { sound } = await Audio.Sound.createAsync(require('../../../../assets/sounds/rest-end.mp3'));
        // setSound(sound);
      } catch (e) {
        console.warn('Audio setup failed', e);
      }
    }
    setupAudio();
    return () => {
      if (sound) sound.unloadAsync();
    };
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      // Multimodal feedback
      engineFeedback.restEnd();
      if (sound) sound.playAsync();
      
      onTimerEndRef.current();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, sound]);

  const handleSkip = async () => {
    await engineFeedback.buttonPress();
    onSkip();
  };

  return (
    <View className="items-center">
      <Text className="text-primary font-mono-bold text-5xl mb-compact">{timeLeft}s</Text>
      <Text className="text-textSecondary font-mono text-[10px] uppercase tracking-widest mb-section-p">Tempo de Descanso</Text>
      <Button title="PULAR DESCANSO" variant="outline" onPress={handleSkip} className="w-full" />
    </View>
  );
});
