/**
 * Exercise Media Resolver — constructs image URLs for ExerciseDB exercises.
 *
 * The ExerciseDB API does NOT return image URLs in the JSON responses.
 * URLs must be constructed in-app using the exercise ID and desired resolution.
 *
 * Fallback cascade (4 layers):
 *   1. Constructed URL (exerciseId + resolution)
 *   2. Lower resolution fallback (720 → 360 → 180)
 *   3. Local body part image
 *   4. Generic placeholder (never empty)
 *
 * @module services/exercise/exerciseMediaResolver
 */

import { getBodyPartFallback } from '@/src/constants/exercise/fallbackImages';
import type { ImageResolution, ImageSize } from './exerciseTypes';
import { SIZE_CONFIG } from './exerciseTypes';

// ── Config ──

const API_HOST = process.env.EXPO_PUBLIC_RAPIDAPI_HOST || 'exercisedb.p.rapidapi.com';
const API_KEY = process.env.EXPO_PUBLIC_RAPIDAPI_KEY || '';
const IMAGE_BASE_URL = `https://${API_HOST}/image`;

// ── Auth Headers ──

/**
 * Required headers for image requests to ExerciseDB.
 * Pass these into FastImage's `source.headers`.
 */
export const EXERCISE_IMAGE_HEADERS = {
  'x-rapidapi-key': API_KEY,
  'x-rapidapi-host': API_HOST,
};

// ── URL Builder ──

/**
 * Pads an exercise ID to 4 digits with leading zeros.
 * ExerciseDB expects IDs like "0001", "0042", "1234".
 */
function padExerciseId(id: string | number): string {
  return String(id).padStart(4, '0');
}

/**
 * Constructs the full image URL for an exercise at a given resolution.
 *
 * @param exerciseId - The exercise ID (will be zero-padded to 4 digits)
 * @param resolution - Image resolution: 180, 360, or 720
 * @returns The full URL for the exercise image
 *
 * @example
 * buildExerciseImageUrl('42', 360)
 * // → 'https://exercisedb.p.rapidapi.com/image?exerciseId=0042&resolution=360'
 */
export function buildExerciseImageUrl(
  exerciseId: string | number,
  resolution: ImageResolution = 360,
): string {
  const paddedId = padExerciseId(exerciseId);
  return `${IMAGE_BASE_URL}?exerciseId=${paddedId}&resolution=${resolution}`;
}

// ── Resolution Resolver ──

/**
 * Maps a component size to the appropriate image resolution.
 */
export function getResolutionForSize(size: ImageSize): ImageResolution {
  return SIZE_CONFIG[size].resolution;
}

/**
 * Returns the next lower resolution for fallback.
 * Used in layer 2 of the fallback cascade.
 *
 * @returns Lower resolution, or null if already at minimum
 */
export function getLowerResolution(current: ImageResolution): ImageResolution | null {
  if (current === 720) return 360;
  if (current === 360) return 180;
  return null;
}

// ── Fallback Resolver ──

/**
 * Returns a local fallback image for a given body part (layer 3).
 * If no body part match, returns the generic placeholder (layer 4).
 */
export function getFallbackImage(bodyPart?: string): number {
  return getBodyPartFallback(bodyPart || '');
}

/**
 * Builds the complete list of fallback URLs for an exercise,
 * in order of priority (highest to lowest quality).
 *
 * Used by ExerciseImage component to try each URL before falling back to local.
 */
export function buildFallbackChain(
  exerciseId: string | number,
  startResolution: ImageResolution = 720,
): string[] {
  const urls: string[] = [];
  let resolution: ImageResolution | null = startResolution;

  while (resolution !== null) {
    urls.push(buildExerciseImageUrl(exerciseId, resolution));
    resolution = getLowerResolution(resolution);
  }

  return urls;
}
