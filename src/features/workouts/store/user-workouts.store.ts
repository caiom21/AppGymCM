import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { v4 as uuid } from 'uuid';
import * as MMKV from '@/src/shared/lib/mmkv';
import type {
  UserWorkout,
  WorkoutSummary,
  WorkoutExercise,
  ExerciseDefaults,
  SetOverrides,
  SyncStatus,
} from '@/src/shared/types/user-workout.types';
import {
  toSummary,
  createEmptyWorkout,
  createExercise,
  createSets,
} from '../lib/workout-factory';
import { Draft } from 'immer';

const SUMMARY_PAGE_SIZE = 20;
const MAX_LOADED_WORKOUTS = 10;
const MMKV_KEY_SUMMARIES = 'gymos_workout_summaries';
const MMKV_KEY_WORKOUT_PREFIX = 'gymos_workout_';

class WorkoutLRUCache {
  private cache = new Map<string, UserWorkout>();
  private maxSize: number;

  constructor(maxSize: number) {
    this.maxSize = maxSize;
  }

  get(id: string): UserWorkout | undefined {
    const item = this.cache.get(id);
    if (item) {
      this.cache.delete(id);
      this.cache.set(id, item);
    }
    return item;
  }

  set(id: string, workout: UserWorkout): void {
    if (this.cache.has(id)) {
      this.cache.delete(id);
    } else if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value!;
      this.cache.delete(firstKey);
    }
    this.cache.set(id, workout);
  }

  delete(id: string): void {
    this.cache.delete(id);
  }

  has(id: string): boolean {
    return this.cache.has(id);
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }
}

interface UserWorkoutsState {
  summaries: WorkoutSummary[];
  summariesPage: number;
  hasMoreSummaries: boolean;
  isLoadingSummaries: boolean;

  _workoutCache: WorkoutLRUCache;
  loadingWorkoutIds: Set<string>;

  filterArchived: boolean;
  searchQuery: string;

  loadSummaries: (reset?: boolean) => Promise<void>;
  getFilteredSummaries: () => WorkoutSummary[];

  loadWorkout: (id: string) => Promise<UserWorkout | null>;
  getWorkout: (id: string) => UserWorkout | undefined;
  unloadWorkout: (id: string) => void;

  createWorkout: (
    userId: string,
    name: string,
    category?: string,
    goal?: string
  ) => Promise<UserWorkout>;
  updateWorkoutMeta: (
    id: string,
    updates: Partial<Pick<UserWorkout, 'name' | 'category' | 'dayOfWeek' | 'isArchived' | 'order'>>
  ) => void;
  deleteWorkout: (id: string) => Promise<void>;
  duplicateWorkout: (id: string) => Promise<UserWorkout | null>;

  addExercise: (
    workoutId: string,
    exerciseId: string,
    defaults: ExerciseDefaults,
    setCount?: number
  ) => void;
  removeExercise: (workoutId: string, exerciseIdx: number) => void;
  updateExerciseDefaults: (
    workoutId: string,
    exerciseIdx: number,
    defaults: Partial<ExerciseDefaults>
  ) => void;
  reorderExercises: (
    workoutId: string,
    fromIdx: number,
    toIdx: number
  ) => void;

  addSet: (workoutId: string, exerciseIdx: number) => void;
  removeSet: (
    workoutId: string,
    exerciseIdx: number,
    setIdx: number
  ) => void;
  updateSetOverride: (
    workoutId: string,
    exerciseIdx: number,
    setIdx: number,
    overrides: Partial<SetOverrides>
  ) => void;
  clearSetOverride: (
    workoutId: string,
    exerciseIdx: number,
    setIdx: number,
    field: keyof SetOverrides
  ) => void;
  applyDefaultsToAllSets: (
    workoutId: string,
    exerciseIdx: number
  ) => void;

  persistWorkout: (workout: UserWorkout) => void;
  persistSummaries: () => void;
  restoreAll: () => Promise<void>;
  markForSync: (workoutId: string) => void;
  markWorkoutSynced: (workoutId: string) => void;
}

export const useUserWorkoutsStore = create<UserWorkoutsState>()(
  immer((set, get) => {
    const lruCache = new WorkoutLRUCache(MAX_LOADED_WORKOUTS);

    function mutateWorkout(
      state: Draft<UserWorkoutsState>,
      workoutId: string,
      mutator: (w: Draft<UserWorkout>) => void
    ): Draft<UserWorkout> | undefined {
      const workout = state._workoutCache.get(workoutId);
      if (!workout) return undefined;

      mutator(workout);
      workout.localUpdatedAt = new Date().toISOString();
      workout.syncStatus = 'pending';

      const summaryIdx = state.summaries.findIndex(s => s.id === workoutId);
      if (summaryIdx !== -1) {
        const updated = toSummary(workout as unknown as UserWorkout);
        state.summaries[summaryIdx] = updated;
      }

      return workout;
    }

    return {
      summaries: [],
      summariesPage: 0,
      hasMoreSummaries: true,
      isLoadingSummaries: false,
      _workoutCache: lruCache,
      loadingWorkoutIds: new Set(),
      filterArchived: false,
      searchQuery: '',

      loadSummaries: async (reset = false) => {
        const state = get();
        if (state.isLoadingSummaries) return;

        set(s => { s.isLoadingSummaries = true; });

        try {
          const page = reset ? 0 : state.summariesPage;
          let loaded: WorkoutSummary[] = [];

          const cached = await MMKV.getString(MMKV_KEY_SUMMARIES);
          if (cached) {
            const all = JSON.parse(cached) as WorkoutSummary[];
            const start = page * SUMMARY_PAGE_SIZE;
            loaded = all.slice(start, start + SUMMARY_PAGE_SIZE);
          }

          set(s => {
            if (reset) {
              s.summaries = loaded;
              s.summariesPage = 1;
            } else {
              s.summaries.push(...loaded);
              s.summariesPage = page + 1;
            }
            s.hasMoreSummaries = loaded.length === SUMMARY_PAGE_SIZE;
            s.isLoadingSummaries = false;
          });
        } catch {
          set(s => { s.isLoadingSummaries = false; });
        }
      },

      getFilteredSummaries: () => {
        const { summaries, filterArchived, searchQuery } = get();
        return summaries.filter(s => {
          if (!filterArchived && s.isArchived) return false;
          if (searchQuery) {
            const q = searchQuery.toLowerCase();
            return s.name.toLowerCase().includes(q);
          }
          return true;
        });
      },

      loadWorkout: async (id: string) => {
        const state = get();

        if (state._workoutCache.has(id)) {
          return state._workoutCache.get(id)!;
        }

        set(s => { s.loadingWorkoutIds.add(id); });

        try {
          const raw = await MMKV.getString(`${MMKV_KEY_WORKOUT_PREFIX}${id}`);
          let workout: UserWorkout | null = null;

          if (raw) {
            workout = JSON.parse(raw);
          }

          if (workout) {
            set(s => {
              s._workoutCache.set(id, workout!);
              s.loadingWorkoutIds.delete(id);
            });
            return workout;
          }

          set(s => { s.loadingWorkoutIds.delete(id); });
          return null;
        } catch {
          set(s => { s.loadingWorkoutIds.delete(id); });
          return null;
        }
      },

      getWorkout: (id: string) => {
        return get()._workoutCache.get(id);
      },

      unloadWorkout: (id: string) => {
        set(s => { s._workoutCache.delete(id); });
      },

      createWorkout: async (userId, name, category, goal) => {
        const workout = createEmptyWorkout(userId, name, category, goal);
        const summary = toSummary(workout);

        set(s => {
          s.summaries.unshift(summary);
          s._workoutCache.set(workout.id, workout);
        });

        get().persistWorkout(workout);
        get().persistSummaries();

        return workout;
      },

      updateWorkoutMeta: (id, updates) => {
        set(s => {
          mutateWorkout(s, id, w => {
            Object.assign(w, updates);
          });
        });
        const workout = get()._workoutCache.get(id);
        if (workout) get().persistWorkout(workout);
        get().persistSummaries();
      },

      deleteWorkout: async (id) => {
        set(s => {
          s.summaries = s.summaries.filter(s => s.id !== id);
          s._workoutCache.delete(id);
        });
        await MMKV.deleteKey(`${MMKV_KEY_WORKOUT_PREFIX}${id}`);
        get().persistSummaries();
      },

      duplicateWorkout: async (id) => {
        const original = await get().loadWorkout(id);
        if (!original) return null;

        const now = new Date().toISOString();
        const clone: UserWorkout = {
          ...JSON.parse(JSON.stringify(original)),
          id: uuid(),
          name: `${original.name} (cópia)`,
          syncStatus: 'local_only',
          localUpdatedAt: now,
          createdAt: now,
          updatedAt: now,
        };

        clone.exercises = clone.exercises.map(ex => ({
          ...ex,
          id: uuid(),
          sets: ex.sets.map(s => ({ ...s, id: uuid() })),
        }));

        const summary = toSummary(clone);

        set(s => {
          s.summaries.unshift(summary);
          s._workoutCache.set(clone.id, clone);
        });

        get().persistWorkout(clone);
        get().persistSummaries();
        return clone;
      },

      addExercise: (workoutId, exerciseId, defaults, setCount = 3) => {
        const workout = get().getWorkout(workoutId);
        if (!workout) return;

        const newExercise = createExercise(
          exerciseId,
          workout.exercises.length,
          defaults,
          setCount
        );

        set(s => {
          mutateWorkout(s, workoutId, w => {
            w.exercises.push(newExercise);
          });
        });

        get().persistWorkout(get().getWorkout(workoutId)!);
        get().persistSummaries();
      },

      removeExercise: (workoutId, exerciseIdx) => {
        set(s => {
          mutateWorkout(s, workoutId, w => {
            w.exercises.splice(exerciseIdx, 1);
            w.exercises.forEach((ex, i) => { ex.order = i; });
          });
        });

        const workout = get().getWorkout(workoutId);
        if (workout) {
          get().persistWorkout(workout);
          get().persistSummaries();
        }
      },

      updateExerciseDefaults: (workoutId, exerciseIdx, defaults) => {
        set(s => {
          mutateWorkout(s, workoutId, w => {
            Object.assign(w.exercises[exerciseIdx].defaults, defaults);
          });
        });

        const workout = get().getWorkout(workoutId);
        if (workout) get().persistWorkout(workout);
      },

      reorderExercises: (workoutId, fromIdx, toIdx) => {
        set(s => {
          mutateWorkout(s, workoutId, w => {
            const [moved] = w.exercises.splice(fromIdx, 1);
            w.exercises.splice(toIdx, 0, moved);
            w.exercises.forEach((ex, i) => { ex.order = i; });
          });
        });

        const workout = get().getWorkout(workoutId);
        if (workout) get().persistWorkout(workout);
      },

      addSet: (workoutId, exerciseIdx) => {
        set(s => {
          mutateWorkout(s, workoutId, w => {
            const exercise = w.exercises[exerciseIdx];
            const newSetNumber = exercise.sets.length + 1;
            exercise.sets.push({
              id: uuid(),
              setNumber: newSetNumber,
              overrides: {},
            });
          });
        });

        const workout = get().getWorkout(workoutId);
        if (workout) {
          get().persistWorkout(workout);
          get().persistSummaries(); 
        }
      },

      removeSet: (workoutId, exerciseIdx, setIdx) => {
        set(s => {
          mutateWorkout(s, workoutId, w => {
            const exercise = w.exercises[exerciseIdx];
            exercise.sets.splice(setIdx, 1);
            exercise.sets.forEach((s, i) => { s.setNumber = i + 1; });
          });
        });

        const workout = get().getWorkout(workoutId);
        if (workout) {
          get().persistWorkout(workout);
          get().persistSummaries();
        }
      },

      updateSetOverride: (workoutId, exerciseIdx, setIdx, overrides) => {
        set(s => {
          mutateWorkout(s, workoutId, w => {
            const set = w.exercises[exerciseIdx].sets[setIdx];
            Object.assign(set.overrides, overrides);
          });
        });

        const workout = get().getWorkout(workoutId);
        if (workout) get().persistWorkout(workout);
      },

      clearSetOverride: (workoutId, exerciseIdx, setIdx, field) => {
        set(s => {
          mutateWorkout(s, workoutId, w => {
            const set = w.exercises[exerciseIdx].sets[setIdx];
            delete set.overrides[field];
          });
        });

        const workout = get().getWorkout(workoutId);
        if (workout) get().persistWorkout(workout);
      },

      applyDefaultsToAllSets: (workoutId, exerciseIdx) => {
        set(s => {
          mutateWorkout(s, workoutId, w => {
            const exercise = w.exercises[exerciseIdx];
            // @ts-ignore Set ignores in strictly typed drafts if needed
            exercise.sets.forEach(set => {
              set.overrides = {}; 
            });
          });
        });

        const workout = get().getWorkout(workoutId);
        if (workout) get().persistWorkout(workout);
      },

      persistWorkout: (workout) => {
        const key = `${MMKV_KEY_WORKOUT_PREFIX}${workout.id}`;
        MMKV.set(key, JSON.stringify(workout)).catch(console.error);
      },

      persistSummaries: () => {
        const { summaries } = get();
        MMKV.set(MMKV_KEY_SUMMARIES, JSON.stringify(summaries)).catch(console.error);
      },

      restoreAll: async () => {
        const cachedSummaries = await MMKV.getString(MMKV_KEY_SUMMARIES);
        if (cachedSummaries) {
          set(s => {
            s.summaries = JSON.parse(cachedSummaries);
            s.summariesPage = Math.ceil(s.summaries.length / SUMMARY_PAGE_SIZE);
            s.hasMoreSummaries = false;
          });
        }
        set(s => { s._workoutCache.clear(); });
      },

      markForSync: (workoutId) => {
        set(s => {
          mutateWorkout(s, workoutId, w => {
            w.syncStatus = 'pending';
          });
        });
        get().persistSummaries();
      },

      markWorkoutSynced: (workoutId) => {
        set(s => {
          const workout = s._workoutCache.get(workoutId);
          if (workout) {
             workout.syncStatus = 'synced';
          }
          const sumIdx = s.summaries.findIndex(sum => sum.id === workoutId);
          if (sumIdx !== -1) {
             s.summaries[sumIdx].syncStatus = 'synced';
          }
        });
        const workout = get().getWorkout(workoutId);
        if (workout) get().persistWorkout(workout);
        get().persistSummaries();
      },
    };
  })
);
