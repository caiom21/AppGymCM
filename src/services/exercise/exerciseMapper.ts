/**
 * Data mapper for normalizing raw ExerciseDB API responses.
 *
 * Handles malformed responses gracefully per SDD v5 spec:
 *   - try/catch per item
 *   - fallback to sensible defaults
 *   - log anomalies (console for now, Sentry later)
 *
 * @module services/exercise/exerciseMapper
 */

import type { ExerciseBase as Exercise } from '@/src/features/exercises/types/exercise.types';

/**
 * Safely normalizes a single raw exercise object from the API.
 *
 * @param raw - The raw JSON object from ExerciseDB
 * @returns A normalized Exercise object with guaranteed field types
 */
export function mapRawToExercise(raw: unknown): Exercise {
  try {
    const obj = raw as Record<string, unknown>;

    return {
      id: String(obj.id ?? ''),
      name: typeof obj.name === 'string' ? obj.name : 'Unknown Exercise',
      bodyPart: typeof obj.bodyPart === 'string' ? obj.bodyPart : 'full body',
      target: typeof obj.target === 'string' ? obj.target : 'general',
      secondaryMuscles: Array.isArray(obj.secondaryMuscles)
        ? obj.secondaryMuscles.map(String)
        : [],
      equipment: typeof obj.equipment === 'string' ? obj.equipment : 'body weight',
      instructions: Array.isArray(obj.instructions)
        ? obj.instructions.map(String)
        : [],
      gifUrl: typeof obj.gifUrl === 'string' ? obj.gifUrl : '',
    };
  } catch (e) {
    console.error('[ExerciseMapper] Failed to map raw exercise:', e, raw);
    return {
      id: String(Math.random()),
      name: 'Unknown Exercise',
      bodyPart: 'full body',
      target: 'general',
      secondaryMuscles: [],
      equipment: 'body weight',
      instructions: [],
      gifUrl: '',
    };
  }
}

/**
 * Maps an array of raw API responses to normalized Exercise objects.
 * Filters out items that fail to produce a valid id.
 */
export function mapRawArray(data: unknown[]): Exercise[] {
  if (!Array.isArray(data)) {
    console.error('[ExerciseMapper] Expected array, received:', typeof data);
    return [];
  }

  return data
    .map(mapRawToExercise)
    .filter(ex => ex.id !== '' && ex.id !== 'NaN');
}
