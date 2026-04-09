import React, { memo } from 'react';
import * as PhosphorIcons from 'phosphor-react-native';
import { EQUIPMENT_ICONS } from '@/src/constants/exercise/equipmentIcons';

interface EquipmentIconProps {
  equipment: string;
  size?: number;
  color?: string;
  className?: string;
}

/**
 * Resolves an equipment string to its corresponding Phosphor Icon
 * and renders it. Falls back to a generic Barbell if unknown.
 */
export const EquipmentIcon = memo<EquipmentIconProps>(({ 
  equipment, 
  size = 16, 
  color = '#888888', // textSecondary default
  className 
}) => {
  const lowerEquip = equipment.toLowerCase();
  const iconName = EQUIPMENT_ICONS[lowerEquip] || EQUIPMENT_ICONS['barbell'];
  
  // @ts-ignore - Indexing PhosphorIcons dynamically
  const IconComponent = PhosphorIcons[iconName] as React.ElementType;

  if (!IconComponent) {
    // Ultimate fallback if library changes
    return <PhosphorIcons.Barbell size={size} color={color} weight="regular" style={className ? {} : undefined} />;
  }

  return <IconComponent size={size} color={color} weight="regular" style={className ? {} : undefined} />;
});

EquipmentIcon.displayName = 'EquipmentIcon';
