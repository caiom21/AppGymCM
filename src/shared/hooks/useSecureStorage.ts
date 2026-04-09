import * as SecureStore from "expo-secure-store";
import { useCallback } from "react";

export const useSecureStorage = () => {
  const setItem = useCallback(async (key: string, value: string) => {
    await SecureStore.setItemAsync(key, value, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  }, []);

  const getItem = useCallback(async (key: string) => {
    return await SecureStore.getItemAsync(key);
  }, []);

  const removeItem = useCallback(async (key: string) => {
    await SecureStore.deleteItemAsync(key);
  }, []);

  return { setItem, getItem, removeItem };
};
