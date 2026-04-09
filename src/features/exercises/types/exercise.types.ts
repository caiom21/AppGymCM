export interface ExerciseBase {
  id: string; // ID vindo da API
  name: string;
  gifUrl: string;
  bodyPart: string;
  target: string;
  equipment: string;
  secondaryMuscles: string[];
  instructions: string[];
  summary?: string; 
  proTips?: string[];
}

// O que o Workout Engine usa (estende o base com dados de execução)
export interface WorkoutExercise extends ExerciseBase {
  sets: number; // Substitui setsTarget (por coerência com o prompt)
  reps: number; // Substitui repsTarget
  weight: number; // Substitui loadKg
  restTime: number; // Em segundos
  completed: boolean[]; // Array para marcar cada série concluída (ex: [true, false, false])
}
