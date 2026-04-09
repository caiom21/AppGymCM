import { useState, useEffect, useCallback } from "react";

export const useRestTimer = (initialSeconds: number = 60) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);
    } else if (seconds === 0) {
      setIsActive(false);
      if (interval) clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, seconds]);

  const startTimer = useCallback((customSeconds?: number) => {
    if (customSeconds !== undefined) {
      setSeconds(customSeconds);
    }
    setIsActive(true);
  }, []);

  const pauseTimer = useCallback(() => {
    setIsActive(false);
  }, []);

  const resetTimer = useCallback((newSeconds: number = 60) => {
    setSeconds(newSeconds);
    setIsActive(false);
  }, []);

  return {
    seconds,
    isActive,
    startTimer,
    pauseTimer,
    resetTimer,
  };
};
