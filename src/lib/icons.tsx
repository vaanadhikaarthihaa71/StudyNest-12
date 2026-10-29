import React from 'react';
import {
  Atom,
  FlaskConical,
  Dna,
  Calculator,
  Terminal,
  BookOpen,
  Compass,
  Cpu,
  Microscope,
  FileText,
  LucideIcon,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  Atom,
  FlaskConical,
  Dna,
  Calculator,
  Terminal,
  BookOpen,
  Compass,
  Cpu,
  Microscope,
  FileText,
};

export function getSubjectIcon(iconName: string, className = 'w-6 h-6'): React.ReactNode {
  const IconComponent = ICON_MAP[iconName] || BookOpen;
  return <IconComponent className={className} />;
}

export const AVAILABLE_ICONS = [
  { name: 'Atom', label: 'Atom (Physics)' },
  { name: 'FlaskConical', label: 'Flask (Chemistry)' },
  { name: 'Dna', label: 'DNA (Biology)' },
  { name: 'Calculator', label: 'Calculator (Mathematics)' },
  { name: 'Terminal', label: 'Terminal (Computer Science)' },
  { name: 'Cpu', label: 'CPU (Tech/Electronics)' },
  { name: 'Microscope', label: 'Microscope (Science)' },
  { name: 'BookOpen', label: 'Book (Literature/General)' },
];
