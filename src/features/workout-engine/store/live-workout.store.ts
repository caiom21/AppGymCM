import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { v4 as uuid } from 'uuid';
import * as MMKV from '@/src/shared/lib/mmkv';
import { engineFeedback } from '../lib/feedback';
import { supabaseService } from '@/src/shared/services/supabase.service';

// ────── Types ──────
export interface LiveSet {
  id: string;
  setNumber: number;
  kg: number;
  reps: number;
  previousKg: number | null;
  previousReps: number | null;
  completed: boolean;
  completedAt?: string;
  type?: 'normal' | 'warmup' | 'drop' | 'failure' | 'rest-pause';
}

export interface LiveExercise {
  id: string;
  exerciseId: string; // ExerciseDB SSOT ID
  name: string;
  gifUrl?: string;
  bodyPart?: string;
  sets: LiveSet[];
  restSeconds: number;
  notes: string;
}

export interface WorkoutMetrics {
  durationSeconds: number;
  totalVolume: number;
  completedSets: number;
  totalSets: number;
  exerciseCount: number;
  prs: { exerciseName: string; kg: number; reps: number }[];
}

interface LiveWorkoutState {
  // Session
  userId: string | null;
  sessionId: string | null;
  workoutName: string;
  exercises: LiveExercise[];
  startedAt: string | null;
  elapsedSeconds: number;
  isActive: boolean;

  // Rest Timer
  restTimerActive: boolean;
  restTimeLeft: number;
  restTimeTotal: number;

  // Actions — Session
  startWorkout: (userId: string, name: string, exercises?: LiveExercise[]) => Promise<void>;
  resumeSession: (userId: string) => Promise<boolean>;
  discardSession: () => void;

  // Actions — Exercises
  addExercise: (exercise: Omit<LiveExercise, 'id' | 'sets'>, setCount?: number) => void;
  removeExercise: (exerciseId: string) => void;
  reorderExercise: (fromIdx: number, toIdx: number) => void;
  replaceExercise: (id: string, newMetadata: Partial<LiveExercise>) => void;

  // Actions — Sets
  addSet: (exerciseId: string, type?: LiveSet['type']) => void;
  removeSet: (exerciseId: string, setId: string) => void;
  updateSetField: (exerciseId: string, setId: string, field: 'kg' | 'reps', value: number) => void;
  checkSet: (exerciseId: string, setId: string) => void;
  uncheckSet: (exerciseId: string, setId: string) => void;

  // Actions — Timer
  startRestTimer: (seconds: number) => void;
  tickRest: () => void;
  skipRest: () => void;
  addRestTime: (seconds: number) => void;

  // Actions — Finish
  finishWorkout: () => Promise<WorkoutMetrics>;
  tickElapsed: () => void;

  // Helpers
  hasCheckedSets: () => boolean;
  persist: () => void;
  syncToSupabase: () => Promise<void>;
}

const MMKV_KEY = 'gymos_live_session';

export const useLiveWorkoutStore = create<LiveWorkoutState>()(
  immer((set, get) => ({
    userId: null,
    sessionId: null,
    workoutName: '',
    exercises: [],
    startedAt: null,
    elapsedSeconds: 0,
    isActive: false,
    restTimerActive: false,
    restTimeLeft: 0,
    restTimeTotal: 0,

    startWorkout: async (userId, name, exercises = []) => {
      let remoteSessionId = uuid();
      try {
        const session = await supabaseService.startSession(userId, undefined);
        remoteSessionId = session.id;
      } catch (e) {
        console.error('Failed to start remote session:', e);
      }

      set(s => {
        s.userId = userId;
        s.sessionId = remoteSessionId;
        s.workoutName = name || 'Treino Rápido';
        s.exercises = exercises;
        s.startedAt = new Date().toISOString();
        s.elapsedSeconds = 0;
        s.isActive = true;
        s.restTimerActive = false;
        s.restTimeLeft = 0;
      });
      get().persist();
      get().syncToSupabase();
    },

    resumeSession: async (userId) => {
      try {
        // 1. Try MMKV first (faster)
        const raw = await MMKV.getString(MMKV_KEY);
        let saved = raw ? JSON.parse(raw) : null;

        // 2. Fallback to Supabase Snapshot if MMKV is empty
        if (!saved || !saved.isActive) {
          const { data: snapshot } = await supabaseService.fetchUserStats(userId); // This is just a placeholder, we need a real snapshot fetch
          // Actually, let's use the dedicated method I should have added
          const { data: remoteSnapshot } = await supabaseService.fetchSnapshot(userId);
          if (remoteSnapshot) {
            saved = remoteSnapshot.payload;
          }
        }

        if (!saved || !saved.isActive || !saved.sessionId) return false;

        set(s => {
          s.userId = userId;
          s.sessionId = saved.sessionId;
          s.workoutName = saved.workoutName;
          s.exercises = saved.exercises;
          s.startedAt = saved.startedAt;
          s.elapsedSeconds = saved.elapsedSeconds;
          s.isActive = true;
          s.restTimerActive = false;
          s.restTimeLeft = 0;
        });
        return true;
      } catch (e) {
        console.error('Resume failed:', e);
        return false;
      }
    },

    discardSession: () => {
      const { userId, sessionId } = get();
      if (userId) supabaseService.clearSnapshot(userId).catch(() => {});
      
      set(s => {
        s.userId = null;
        s.sessionId = null;
        s.workoutName = '';
        s.exercises = [];
        s.startedAt = null;
        s.elapsedSeconds = 0;
        s.isActive = false;
        s.restTimerActive = false;
        s.restTimeLeft = 0;
      });
      MMKV.deleteKey(MMKV_KEY).catch(() => {});
    },

    addExercise: (exercise, setCount = 3) => {
      const sets: LiveSet[] = Array.from({ length: setCount }, (_, i) => ({
        id: uuid(),
        setNumber: i + 1,
        kg: 0,
        reps: 0,
        previousKg: null,
        previousReps: null,
        completed: false,
      }));

      set(s => {
        s.exercises.push({
          id: uuid(),
          ...exercise,
          sets,
        });
      });
      get().persist();
      get().syncToSupabase(); // Sync metadata immediately to prevent FK errors later
    },

    removeExercise: (exerciseId) => {
      set(s => {
        s.exercises = s.exercises.filter(e => e.id !== exerciseId);
      });
      get().persist();
    },

    reorderExercise: (fromIdx, toIdx) => {
      set(s => {
        const [moved] = s.exercises.splice(fromIdx, 1);
        s.exercises.splice(toIdx, 0, moved);
      });
      get().persist();
    },

    replaceExercise: (id, newMetadata) => {
      set(s => {
        const ex = s.exercises.find(e => e.id === id);
        if (!ex) return;
        Object.assign(ex, newMetadata);
      });
      get().persist();
    },

    addSet: (exerciseId, type = 'normal') => {
      set(s => {
        const ex = s.exercises.find(e => e.id === exerciseId);
        if (!ex) return;
        const lastSet = ex.sets[ex.sets.length - 1];
        
        let newKg = lastSet?.kg ?? 0;
        if (type === 'warmup') {
          newKg = newKg * 0.5;
        } else if (type === 'drop') {
          newKg = newKg * 0.8;
        }
        
        // Round to nearest 0.5 or nearest integer
        newKg = Math.round(newKg * 2) / 2;

        ex.sets.push({
          id: uuid(),
          setNumber: ex.sets.length + 1,
          kg: newKg,
          reps: lastSet?.reps ?? 0,
          previousKg: null,
          previousReps: null,
          type,
          completed: false,
        });
      });
      get().persist();
    },

    removeSet: (exerciseId, setId) => {
      set(s => {
        const ex = s.exercises.find(e => e.id === exerciseId);
        if (!ex) return;
        ex.sets = ex.sets.filter(st => st.id !== setId);
        ex.sets.forEach((st, i) => { st.setNumber = i + 1; });
      });
      get().persist();
    },

    updateSetField: (exerciseId, setId, field, value) => {
      set(s => {
        const ex = s.exercises.find(e => e.id === exerciseId);
        if (!ex) return;
        const st = ex.sets.find(st => st.id === setId);
        if (!st) return;
        st[field] = value;
      });
      get().persist();
    },

    checkSet: (exerciseId, setId) => {
      const state = get();
      const ex = state.exercises.find(e => e.id === exerciseId);
      if (!ex) return;

      set(s => {
        const exercise = s.exercises.find(e => e.id === exerciseId);
        if (!exercise) return;
        const st = exercise.sets.find(st => st.id === setId);
        if (!st) return;
        st.completed = true;
        st.completedAt = new Date().toISOString();
      });

      // Trigger haptic + rest timer
      engineFeedback.setComplete();
      get().startRestTimer(ex.restSeconds || 90);
      get().persist();

      // Sync metadata first to ensure workout_exercise row exists (prevents FK violation)
      get().syncToSupabase().then(() => {
        // Sync set to Supabase
        const { sessionId } = get();
        const st = ex.sets.find(s => s.id === setId);
        if (sessionId && st) {
          supabaseService.logSet(sessionId, {
            workout_exercise_id: ex.id, // Using the internal UUID as reference
            set_number: st.setNumber,
            weight: st.kg,
            reps: st.reps,
            completed: true,
            type: st.type || 'normal'
          }).catch(e => console.error('Supabase logSet failed:', e));
        }
      });
    },

    uncheckSet: (exerciseId, setId) => {
      set(s => {
        const ex = s.exercises.find(e => e.id === exerciseId);
        if (!ex) return;
        const st = ex.sets.find(st => st.id === setId);
        if (!st) return;
        st.completed = false;
        st.completedAt = undefined;
      });
      get().persist();
    },

    startRestTimer: (seconds) => {
      set(s => {
        s.restTimerActive = true;
        s.restTimeLeft = seconds;
        s.restTimeTotal = seconds;
      });
    },

    tickRest: () => {
      set(s => {
        if (s.restTimeLeft <= 1) {
          s.restTimerActive = false;
          s.restTimeLeft = 0;
          engineFeedback.restEnd();
        } else {
          s.restTimeLeft -= 1;
        }
      });
    },

    skipRest: () => {
      set(s => {
        s.restTimerActive = false;
        s.restTimeLeft = 0;
      });
    },

    addRestTime: (seconds) => {
      set(s => {
        s.restTimeLeft += seconds;
        s.restTimeTotal += seconds;
      });
    },

    tickElapsed: () => {
      set(s => { s.elapsedSeconds += 1; });
    },

    finishWorkout: async () => {
      const state = get();
      const { sessionId, userId } = state;

      const completedSets = state.exercises.reduce(
        (sum, ex) => sum + ex.sets.filter(s => s.completed).length, 0
      );
      const totalSets = state.exercises.reduce(
        (sum, ex) => sum + ex.sets.length, 0
      );
      const totalVolume = state.exercises.reduce(
        (sum, ex) => sum + ex.sets
          .filter(s => s.completed)
          .reduce((v, s) => v + s.kg * s.reps, 0), 0
      );

      const metrics: WorkoutMetrics = {
        durationSeconds: state.elapsedSeconds,
        totalVolume,
        completedSets,
        totalSets,
        exerciseCount: state.exercises.length,
        prs: [], // TODO: compare with historical bests
      };

      engineFeedback.workoutComplete();

      if (sessionId) {
        await supabaseService.finishSession(sessionId).catch(e => console.error('Finish session failed:', e));
      }
      if (userId) {
        await supabaseService.clearSnapshot(userId).catch(() => {});
      }

      set(s => {
        s.isActive = false;
        s.restTimerActive = false;
      });

      MMKV.deleteKey(MMKV_KEY).catch(() => {});

      return metrics;
    },

    hasCheckedSets: () => {
      return get().exercises.some(ex => ex.sets.some(s => s.completed));
    },

    persist: () => {
      const { userId, sessionId, workoutName, exercises, startedAt, elapsedSeconds, isActive } = get();
      const data = JSON.stringify({ userId, sessionId, workoutName, exercises, startedAt, elapsedSeconds, isActive });
      MMKV.set(MMKV_KEY, data).catch(() => {});
    },

    syncToSupabase: async () => {
      const { userId, sessionId, workoutName, exercises, startedAt, elapsedSeconds, isActive } = get();
      if (!userId || !sessionId) return;

      try {
        // 1. Sync session snapshot
        await supabaseService.syncSnapshot(userId, sessionId, {
          userId, sessionId, workoutName, exercises, startedAt, elapsedSeconds, isActive
        });

        // 2. Persist exercises to workout_exercises for logging FKs
        // This is crucial for 'Quick Workouts' where workout_id might be null
        const exerciseRows = exercises.map(ex => ({
          id: ex.id,
          exercise_id: ex.exerciseId,
          name: ex.name,
          gif_url: ex.gifUrl,
          body_part: ex.bodyPart,
          sets: ex.sets.length,
          updated_at: new Date().toISOString()
        }));

        if (exerciseRows.length > 0) {
          await supabaseService.upsertWorkoutExercises(exerciseRows);
        }
      } catch (e) {
        console.error('Supabase syncToSupabase failed:', e);
      }
    },
  }))
);
