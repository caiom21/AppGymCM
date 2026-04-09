/**
 * Fallback images for exercises when API images are unavailable.
 * Part of the 4-layer image fallback cascade:
 *   1. Constructed URL with exerciseId + resolution
 *   2. Fallback with lower resolution (720 → 360 → 180)
 *   3. Local bodyPart image (this file)
 *   4. Generic placeholder (GENERIC_PLACEHOLDER)
 *
 * @module constants/exercise/fallbackImages
 */

// ── Body Part → Local Asset Mapping ──
// Note: These assets need to be created in assets/images/bodyparts/
// For now, we map to a generic placeholder until assets are added.
// When adding actual assets, use: require('@/assets/images/bodyparts/back.png')

export const BODY_PART_IMAGES: Record<string, number | null> = {
  back: null,
  cardio: null,
  chest: null,
  'lower arms': null,
  'lower legs': null,
  neck: null,
  shoulders: null,
  'upper arms': null,
  'upper legs': null,
  waist: null,
};

/**
 * Generic placeholder used as the last resort (layer 4).
 * NEVER show empty space — always fall back to this.
 */
export const GENERIC_PLACEHOLDER = require('@/assets/images/icon.png');

/**
 * Returns the local fallback image for a given body part.
 * Falls back to GENERIC_PLACEHOLDER if no matching body part asset exists.
 */
export function getBodyPartFallback(bodyPart: string): number {
  const image = BODY_PART_IMAGES[bodyPart.toLowerCase()];
  return image ?? GENERIC_PLACEHOLDER;
}
