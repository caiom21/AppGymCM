import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  set: async (key: string, value: string) => {
    return AsyncStorage.setItem(key, value);
  },
  getString: async (key: string): Promise<string | undefined> => {
    const value = await AsyncStorage.getItem(key);
    return value !== null ? value : undefined;
  },
  delete: async (key: string) => {
    return AsyncStorage.removeItem(key);
  },
  deleteKey: async (key: string) => {
    return AsyncStorage.removeItem(key);
  }
};

export const set = async (key: string, value: string | boolean | number) => {
  return storage.set(key, String(value));
};

export const getString = async (key: string): Promise<string | undefined> => {
  return storage.getString(key);
};

export const getBoolean = async (key: string): Promise<boolean | undefined> => {
  const value = await storage.getString(key);
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
};

export const getNumber = async (key: string): Promise<number | undefined> => {
  const value = await storage.getString(key);
  if (value !== undefined) {
    const num = Number(value);
    if (!isNaN(num)) return num;
  }
  return undefined;
};

export const deleteKey = async (key: string) => {
  return storage.delete(key);
};

export const contains = async (key: string): Promise<boolean> => {
  const value = await storage.getString(key);
  return value !== undefined;
};

export const remove = deleteKey;
