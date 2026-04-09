/**
 * Difficulty level color mappings using semantic theme tokens.
 * Used by DifficultyBadge component.
 *
 * Colors reference the Tailwind tokens defined in tailwind.config.js.
 * For runtime use (StyleSheet), use the hex values.
 * For NativeWind use, reference the Tailwind class names.
 *
 * @module constants/exercise/difficultyColors
 */

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface DifficultyStyle {
  /** Hex color for runtime StyleSheet usage */
  color: string;
  /** Background with opacity for badge */
  bgColor: string;
  /** Tailwind class for text color */
  twText: string;
  /** Tailwind class for badge background */
  twBg: string;
  /** Human-readable label in PT-BR */
  label: string;
}

export const DIFFICULTY_COLORS: Record<DifficultyLevel, DifficultyStyle> = {
  beginner: {
    color: '#22C55E',
    bgColor: 'rgba(34, 197, 94, 0.15)',
    twText: 'text-success',
    twBg: 'bg-success/15',
    label: 'Iniciante',
  },
  intermediate: {
    color: '#F59E0B',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    twText: 'text-warning',
    twBg: 'bg-warning/15',
    label: 'Intermediário',
  },
  advanced: {
    color: '#EF4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    twText: 'text-error',
    twBg: 'bg-error/15',
    label: 'Avançado',
  },
};

/**
 * Returns the difficulty style for a given level.
 * Defaults to 'beginner' for unknown values.
 */
export function getDifficultyStyle(level: string): DifficultyStyle {
  const normalized = level.toLowerCase() as DifficultyLevel;
  return DIFFICULTY_COLORS[normalized] ?? DIFFICULTY_COLORS.beginner;
}
