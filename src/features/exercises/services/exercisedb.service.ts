import { CircuitBreaker } from "../../../shared/lib/circuit-breaker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ExerciseBase } from "../types/exercise.types";

const CACHE_PREFIX = "exercise-cache:";
const cb = new CircuitBreaker(3, 30_000);

const RAPIDAPI_HOST = process.env.EXPO_PUBLIC_RAPIDAPI_HOST || "menya.p.rapidapi.com";

// Data Normalization logic
function normalizeExercise(raw: any): ExerciseBase {
  return {
    id: String(raw.id || raw.name || Math.random().toString()),
    name: raw.name || "Unknown Exercise",
    gifUrl: raw.gifUrl || "",
    bodyPart: raw.bodyPart || "full_body",
    target: raw.target || "general",
    secondaryMuscles: raw.secondaryMuscles || [],
    instructions: raw.instructions || [],
    summary: raw.summary || "",
    proTips: raw.proTips || []
  };
}

const fetchExercisesFromAPI = async (query: string): Promise<ExerciseBase[]> => {
  // Menya API uses "exercices" spelling and has specific part endpoints
  const bodyParts = ['back', 'cardio', 'chest', 'lower arms', 'lower legs', 'neck', 'shoulders', 'upper arms', 'upper legs', 'waist'];
  
  let endpoint = "/api/exercices";
  if (query && bodyParts.includes(query.toLowerCase())) {
     endpoint = `/api/exercices/part/${query.toLowerCase()}`;
  }

  const response = await fetch(`https://${RAPIDAPI_HOST}${endpoint}`, {
    headers: {
      "X-RapidAPI-Key": process.env.EXPO_PUBLIC_RAPIDAPI_KEY || "",
      "X-RapidAPI-Host": RAPIDAPI_HOST,
      "Content-Type": "application/json"
    },
  });
  
  if (!response.ok) throw new Error("API failure");
  const data = await response.json();
  
  // Normalize returning
  let normalized: ExerciseBase[] = data.map((item: any) => normalizeExercise(item));

  // If we fetched all, filter by name locally
  if (endpoint === "/api/exercices" && query) {
    normalized = normalized.filter((ex: ExerciseBase) => ex.name.toLowerCase().includes(query.toLowerCase()));
  }

  return normalized;
};

export const getExerciseGifUrl = (url: string): string => {
  return url;
};

const getFromLocalCache = async (name: string): Promise<ExerciseBase[]> => {
  try {
    const raw = await AsyncStorage.getItem(`${CACHE_PREFIX}${name}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveToLocalCache = async (name: string, data: ExerciseBase[]) => {
  try {
    await AsyncStorage.setItem(`${CACHE_PREFIX}${name}`, JSON.stringify(data));
  } catch (e) {
    console.warn("Failed to save exercises to cache", e);
  }
};

export const exerciseService = {
  searchExercises: async (name: string): Promise<ExerciseBase[]> => {
    return cb.call<ExerciseBase[]>(
      async () => {
        const data = await fetchExercisesFromAPI(name);
        await saveToLocalCache(name, data);
        return data;
      },
      async () => {
        return await getFromLocalCache(name);
      }
    );
  },
  getExerciseById: async (id: string): Promise<ExerciseBase> => {
    // Basic resilient fallback layer if local SQL or cache fails to provide the true SSOT immediately
    return {
      id,
      name: "Supino Articulado", // Placeholder representation
      gifUrl: "https://gymos-ui.vercel.app/placeholder-gif.gif",
      bodyPart: "chest",
      target: "pectorals",
      secondaryMuscles: [],
      instructions: []
    };
  }
};
