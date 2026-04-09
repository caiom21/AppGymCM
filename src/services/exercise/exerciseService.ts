/**
 * Exercise Service — high-level facade for exercise data operations.
 *
 * Combines the API client, cache, and mapper layers into a clean interface.
 * Every method follows the pattern:
 *   1. Check cache (if applicable)
 *   2. Call API
 *   3. Map raw response
 *   4. Store in cache with endpoint-specific TTL
 *   5. Return typed data
 *
 * @module services/exercise/exerciseService
 */

import { supabase } from '@/src/shared/lib/supabase';
import { exerciseApi } from './exerciseApi';
import { exerciseCache } from './exerciseCache';
import { mapRawToExercise, mapRawArray } from './exerciseMapper';
import { CacheTTL } from './exerciseTypes';
import type { ExerciseBase as Exercise } from '@/src/features/exercises/types/exercise.types';
import type { ExerciseSearchParams } from './exerciseTypes';

/**
 * Exercise Service — high-level facade for exercise data operations.
 * 
 * SSOT Implementation v4.0:
 *   1. Check Local Cache (MMKV/AsyncStorage)
 *   2. Check Supabase (Global Dictionary)
 *   3. Fetch RapidAPI (Fallback) -> Upsert Supabase -> Save Local
 */

// ── Cache Key Builders ──

const cacheKey = {
  all: (limit: number, offset: number) => `all:${limit}:${offset}`,
  byId: (id: string) => `id:${id}`,
  byBodyPart: (bp: string) => `bodyPart:${bp}`,
  byTarget: (t: string) => `target:${t}`,
  byEquipment: (e: string) => `equipment:${e}`,
  bodyPartList: () => 'list:bodyParts',
  targetList: () => 'list:targets',
  equipmentList: () => 'list:equipment',
};

// ── Service ──

export const exerciseService = {
  /**
   * Fetches all exercises with pagination.
   * Cached for 24 hours.
   */
  async getAll(limit = 50, offset = 0): Promise<Exercise[]> {
    const key = cacheKey.all(limit, offset);

    const cached = await exerciseCache.get<Exercise[]>(key);
    if (cached) return cached;

    const raw = await exerciseApi.getAll(limit, offset);
    const exercises = mapRawArray(raw);

    await exerciseCache.set(key, exercises, CacheTTL.EXERCISES_ALL);
    return exercises;
  },

  /**
   * Fetches a single exercise by ID.
   * SSOT: Supabase -> RapidAPI -> Upsert
   */
  async getById(id: string): Promise<Exercise | null> {
    const key = cacheKey.byId(id);

    // 1. Local Cache
    const cached = await exerciseCache.get<Exercise>(key);
    if (cached) return cached;

    // 2. Supabase Cache
    const { data: dbData } = await supabase
      .from('exercises')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (dbData) {
      const exercise: Exercise = {
        id: dbData.id,
        name: dbData.name,
        gifUrl: dbData.gif_url,
        bodyPart: dbData.body_part,
        target: dbData.target,
        equipment: dbData.equipment || '',
        secondaryMuscles: dbData.secondary_muscles || [],
        instructions: dbData.instructions || [],
      };
      await exerciseCache.set(key, exercise, CacheTTL.EXERCISE_BY_ID);
      return exercise;
    }

    // 3. RapidAPI Fallback
    const raw = await exerciseApi.getById(id);
    if (!raw) return null;

    const exercise = mapRawToExercise(raw);

    // Upsert to Supabase for future consumers
    await this.saveToSupabase([exercise]);

    await exerciseCache.set(key, exercise, CacheTTL.EXERCISE_BY_ID);
    return exercise;
  },

  /**
   * Helper to persist exercises to Supabase global dictionary
   */
  async saveToSupabase(exercises: Exercise[]) {
    if (!exercises.length) return;
    
    const rows = exercises.map(ex => ({
      id: ex.id,
      name: ex.name,
      gif_url: ex.gifUrl,
      body_part: ex.bodyPart,
      target: ex.target,
      equipment: (ex as any).equipment || '',
      secondary_muscles: ex.secondaryMuscles,
      instructions: ex.instructions,
      updated_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('exercises')
      .upsert(rows, { onConflict: 'id' });
    
    if (error) console.error('[ExerciseService] Supabase upsert failed:', error);
  },

  /**
   * Searches exercises by name.
   * Hits API -> Upserts Supabase.
   */
  async searchByName(name: string, limit = 20): Promise<Exercise[]> {
    const raw = await exerciseApi.searchByName(name, limit);
    const exercises = mapRawArray(raw);
    
    if (exercises.length > 0) {
      this.saveToSupabase(exercises); // Fire and forget
    }
    
    return exercises;
  },

  /**
   * Filters exercises by body part.
   * Cached for 12 hours.
   */
  async getByBodyPart(bodyPart: string, limit = 50): Promise<Exercise[]> {
    const key = cacheKey.byBodyPart(bodyPart.toLowerCase());

    const cached = await exerciseCache.get<Exercise[]>(key);
    if (cached) return cached;

    const raw = await exerciseApi.getByBodyPart(bodyPart, limit);
    const exercises = mapRawArray(raw);

    await exerciseCache.set(key, exercises, CacheTTL.EXERCISES_BY_BODY_PART);
    return exercises;
  },

  /**
   * Filters exercises by target muscle.
   * Cached for 12 hours.
   */
  async getByTarget(target: string, limit = 50): Promise<Exercise[]> {
    const key = cacheKey.byTarget(target.toLowerCase());

    const cached = await exerciseCache.get<Exercise[]>(key);
    if (cached) return cached;

    const raw = await exerciseApi.getByTarget(target, limit);
    const exercises = mapRawArray(raw);

    await exerciseCache.set(key, exercises, CacheTTL.EXERCISES_BY_TARGET);
    return exercises;
  },

  /**
   * Filters exercises by equipment type.
   * Cached for 12 hours.
   */
  async getByEquipment(equipment: string, limit = 50): Promise<Exercise[]> {
    const key = cacheKey.byEquipment(equipment.toLowerCase());

    const cached = await exerciseCache.get<Exercise[]>(key);
    if (cached) return cached;

    const raw = await exerciseApi.getByEquipment(equipment, limit);
    const exercises = mapRawArray(raw);

    await exerciseCache.set(key, exercises, CacheTTL.EXERCISES_BY_EQUIPMENT);
    return exercises;
  },

  /**
   * Gets the list of all body parts.
   * Cached for 30 days.
   */
  async getBodyPartList(): Promise<string[]> {
    const key = cacheKey.bodyPartList();

    const cached = await exerciseCache.get<string[]>(key);
    if (cached) return cached;

    const list = await exerciseApi.getBodyPartList();

    await exerciseCache.set(key, list, CacheTTL.BODY_PART_LIST);
    return list;
  },

  /**
   * Gets the list of all target muscles.
   * Cached for 30 days.
   */
  async getTargetList(): Promise<string[]> {
    const key = cacheKey.targetList();

    const cached = await exerciseCache.get<string[]>(key);
    if (cached) return cached;

    const list = await exerciseApi.getTargetList();

    await exerciseCache.set(key, list, CacheTTL.TARGET_LIST);
    return list;
  },

  /**
   * Gets the list of all equipment types.
   * Cached for 30 days.
   */
  async getEquipmentList(): Promise<string[]> {
    const key = cacheKey.equipmentList();

    const cached = await exerciseCache.get<string[]>(key);
    if (cached) return cached;

    const list = await exerciseApi.getEquipmentList();

    await exerciseCache.set(key, list, CacheTTL.EQUIPMENT_LIST);
    return list;
  },

  /**
   * Advanced search combining text query with filters.
   * Used by ExerciseSearchSheet.
   *
   * Strategy:
   *   - If both query and bodyPart: fetch by bodyPart (cached), filter by name locally
   *   - If only query: search by name (uncached)
   *   - If only bodyPart: fetch by bodyPart (cached)
   *   - If filters but no query/bodyPart: combine through target/equipment
   */
  async searchAdvanced(params: ExerciseSearchParams): Promise<Exercise[]> {
    const { query, bodyPart, target, equipment, limit = 50 } = params;

    let results: Exercise[] = [];

    if (bodyPart) {
      results = await this.getByBodyPart(bodyPart, limit);
    } else if (target) {
      results = await this.getByTarget(target, limit);
    } else if (equipment) {
      results = await this.getByEquipment(equipment, limit);
    } else if (query) {
      results = await this.searchByName(query, limit);
      return results; // name search is already filtered
    } else {
      results = await this.getAll(limit);
    }

    // Apply local text filter if query is also provided
    if (query && results.length > 0) {
      const lower = query.toLowerCase();
      results = results.filter(
        ex =>
          ex.name.toLowerCase().includes(lower) ||
          ex.target.toLowerCase().includes(lower),
      );
    }

    return results;
  },

  /**
   * Prefetches exercises for today's workout plan.
   * Called during app launch timeline (fire-and-forget).
   *
   * 1. Fetches each exercise by ID (populates cache for 7 days)
   * 2. Runs in parallel for speed
   */
  async prefetchTodayExercises(exerciseIds: string[]): Promise<void> {
    if (!exerciseIds.length) return;

    const promises = exerciseIds.map(id =>
      this.getById(id).catch(e => {
        console.warn(`[ExerciseService] Prefetch failed for ${id}:`, e);
        return null;
      }),
    );

    await Promise.allSettled(promises);
  },
};
