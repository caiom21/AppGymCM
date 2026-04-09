/**
 * Maps equipment type strings (from ExerciseDB API) to Phosphor icon names.
 * Used by EquipmentIcon component.
 *
 * @module constants/exercise/equipmentIcons
 */

export const EQUIPMENT_ICONS: Record<string, string> = {
  barbell: 'Barbell',
  dumbbell: 'Barbell',
  'cable': 'LinkSimple',
  'body weight': 'Person',
  'leverage machine': 'Gear',
  'smith machine': 'Columns',
  'band': 'WaveSine',
  'ez barbell': 'Barbell',
  'olympic barbell': 'Barbell',
  'kettlebell': 'CircleHalf',
  'rope': 'Anchor',
  'stability ball': 'Circle',
  'medicine ball': 'SoccerBall',
  'bosu ball': 'CircleHalfTilt',
  'roller': 'Cylinder',
  'resistance band': 'WaveSine',
  'sled machine': 'ArrowSquareRight',
  'upper body ergometer': 'BicycleIcon',
  'assisted': 'HandGrabbing',
  'weighted': 'Plus',
  'trap bar': 'Barbell',
  'tire': 'Circle',
  'hammer': 'Hammer',
  'stepmill machine': 'Stairs',
  'elliptical machine': 'Infinity',
  'stationary bike': 'Bicycle',
  'wheel roller': 'Circle',
};

/** Default icon when equipment type is not mapped */
export const DEFAULT_EQUIPMENT_ICON = 'Barbell';

/**
 * Returns the Phosphor icon name for a given equipment string.
 * Falls back to DEFAULT_EQUIPMENT_ICON if not mapped.
 */
export function getEquipmentIcon(equipment: string): string {
  return EQUIPMENT_ICONS[equipment.toLowerCase()] ?? DEFAULT_EQUIPMENT_ICON;
}
