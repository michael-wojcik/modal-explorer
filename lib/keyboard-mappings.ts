import type { NoteName } from './types';

export type KeyboardLayoutType = 'scaleDegree' | 'chromatic';

export interface ScaleDegreeMapping {
  key: string;
  scaleDegree: number; // 1-7 for scale degrees
  octaveOffset: number; // -1, 0, or +1
  label: string;
}

export interface KeyboardLayout {
  name: string;
  type: KeyboardLayoutType;
  description: string;
  mappings: ScaleDegreeMapping[];
  toggleKey: string;
  sustainKey: string;
  helpKey: string;
}

/**
 * Scale Degree Layout - Maps keys to scale degrees of current mode
 * Three-row piano-like layout: Each row represents a complete octave
 * Q row (top) = Upper octave, A row (middle/home) = Main octave, Z row (bottom) = Lower octave
 */
export const SCALE_DEGREE_LAYOUT: KeyboardLayout = {
  name: 'Scale Degree',
  type: 'scaleDegree',
  description: 'Three-row layout: QWERTYUI (upper), ASDFGHJK (main), ZXCVBNM, (lower)',
  mappings: [
    // Upper Octave - QWERTY row (High notes)
    { key: 'q', scaleDegree: 1, octaveOffset: 1, label: 'Root (High)' },
    { key: 'w', scaleDegree: 2, octaveOffset: 1, label: '2nd (High)' },
    { key: 'e', scaleDegree: 3, octaveOffset: 1, label: '3rd (High)' },
    { key: 'r', scaleDegree: 4, octaveOffset: 1, label: '4th (High)' },
    { key: 't', scaleDegree: 5, octaveOffset: 1, label: '5th (High)' },
    { key: 'y', scaleDegree: 6, octaveOffset: 1, label: '6th (High)' },
    { key: 'u', scaleDegree: 7, octaveOffset: 1, label: '7th (High)' },
    { key: 'i', scaleDegree: 1, octaveOffset: 2, label: 'Octave (High)' },

    // Main Octave - ASDF row (Middle notes - Home row)
    { key: 'a', scaleDegree: 1, octaveOffset: 0, label: 'Root (Main)' },
    { key: 's', scaleDegree: 2, octaveOffset: 0, label: '2nd (Main)' },
    { key: 'd', scaleDegree: 3, octaveOffset: 0, label: '3rd (Main)' },
    { key: 'f', scaleDegree: 4, octaveOffset: 0, label: '4th (Main)' },
    { key: 'g', scaleDegree: 5, octaveOffset: 0, label: '5th (Main)' },
    { key: 'h', scaleDegree: 6, octaveOffset: 0, label: '6th (Main)' },
    { key: 'j', scaleDegree: 7, octaveOffset: 0, label: '7th (Main)' },
    { key: 'k', scaleDegree: 1, octaveOffset: 1, label: 'Octave (Main)' },

    // Lower Octave - ZXCV row (Low notes)
    { key: 'z', scaleDegree: 1, octaveOffset: -1, label: 'Root (Low)' },
    { key: 'x', scaleDegree: 2, octaveOffset: -1, label: '2nd (Low)' },
    { key: 'c', scaleDegree: 3, octaveOffset: -1, label: '3rd (Low)' },
    { key: 'v', scaleDegree: 4, octaveOffset: -1, label: '4th (Low)' },
    { key: 'b', scaleDegree: 5, octaveOffset: -1, label: '5th (Low)' },
    { key: 'n', scaleDegree: 6, octaveOffset: -1, label: '6th (Low)' },
    { key: 'm', scaleDegree: 7, octaveOffset: -1, label: '7th (Low)' },
    { key: ',', scaleDegree: 1, octaveOffset: 0, label: 'Octave (Low)' },
  ],
  toggleKey: '`', // Backtick - doesn't conflict!
  sustainKey: ' ',
  helpKey: '/',
};

/**
 * Chromatic Layout - For advanced users who want full chromatic control
 * Maps to absolute chromatic notes (like a piano)
 */
export const CHROMATIC_LAYOUT: KeyboardLayout = {
  name: 'Chromatic',
  type: 'chromatic',
  description: 'Play chromatic notes like a piano keyboard',
  mappings: [
    // This would map to absolute MIDI notes, not scale degrees
    // Keeping the old chromatic system as an option
  ],
  toggleKey: '`',
  sustainKey: ' ',
  helpKey: '/',
};

/**
 * All available keyboard layouts
 */
export const KEYBOARD_LAYOUTS: Record<KeyboardLayoutType, KeyboardLayout> = {
  scaleDegree: SCALE_DEGREE_LAYOUT,
  chromatic: CHROMATIC_LAYOUT,
};

/**
 * Get keyboard layout by type
 */
export function getKeyboardLayout(type: KeyboardLayoutType): KeyboardLayout {
  return KEYBOARD_LAYOUTS[type];
}

/**
 * Find scale degree mapping for a key
 */
export function findScaleDegreeMapping(
  key: string,
  layout: KeyboardLayout
): ScaleDegreeMapping | undefined {
  return layout.mappings.find(m => m.key === key.toLowerCase());
}

/**
 * Get all keys that should be captured for music (not UI navigation)
 */
export function getMusicKeys(layout: KeyboardLayout): Set<string> {
  const keys = new Set<string>();
  layout.mappings.forEach(m => keys.add(m.key));
  return keys;
}

/**
 * Keys that should NEVER be captured (always pass through for UI)
 */
export const UI_NAVIGATION_KEYS = new Set([
  'Tab',
  'Enter',
  'Escape',
  'ArrowLeft',
  'ArrowRight',
  'Home',
  'End',
  'PageUp',
  'PageDown',
]);

/**
 * Check if an element is an input field where typing should work
 */
export function isInputElement(element: Element | null): boolean {
  if (!element) return false;
  const tagName = element.tagName.toUpperCase();
  return tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT';
}

/**
 * Get visual key representation for display
 */
export function getKeyDisplay(key: string): string {
  const specialKeys: Record<string, string> = {
    ' ': 'Space',
    '`': '`',
    '/': '/',
    'ArrowUp': '↑',
    'ArrowDown': '↓',
  };

  return specialKeys[key] || key.toUpperCase();
}

/**
 * Get scale degree label with musical notation
 */
export function getScaleDegreeLabel(degree: number): string {
  const labels: Record<number, string> = {
    1: '1 (Root)',
    2: '2',
    3: '3',
    4: '4',
    5: '5',
    6: '6',
    7: '7',
  };
  return labels[degree] || degree.toString();
}

/**
 * Get function name for scale degrees
 */
export function getScaleDegreeFunction(degree: number): string {
  const functions: Record<number, string> = {
    1: 'Tonic',
    2: 'Supertonic',
    3: 'Mediant',
    4: 'Subdominant',
    5: 'Dominant',
    6: 'Submediant',
    7: 'Leading Tone',
  };
  return functions[degree] || '';
}
