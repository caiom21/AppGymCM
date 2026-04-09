/**
 * Maps body part strings (from ExerciseDB API) to Phosphor icon names.
 * Used by MuscleChip component and body part filters.
 *
 * @module constants/exercise/bodyPartIcons
 */

export const BODY_PART_ICONS: Record<string, string> = {
  back: 'ArrowsOutCardinal',
  cardio: 'Heartbeat',
  chest: 'ShieldChevron',
  'lower arms': 'HandGrabbing',
  'lower legs': 'Boot',
  neck: 'User',
  shoulders: 'ArrowsOutLineHorizontal',
  'upper arms': 'Biceps',
  'upper legs': 'PersonSimpleRun',
  waist: 'CircleNotch',
};

/** Default icon when body part is not mapped */
export const DEFAULT_BODY_PART_ICON = 'Barbell';

/**
 * Returns the Phosphor icon name for a given body part string.
 * Falls back to DEFAULT_BODY_PART_ICON if not mapped.
 */
export function getBodyPartIcon(bodyPart: string): string {
  return BODY_PART_ICONS[bodyPart.toLowerCase()] ?? DEFAULT_BODY_PART_ICON;
}
