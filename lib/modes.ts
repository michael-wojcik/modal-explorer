import type { Mode, ModeName, ChordDefinition } from './types';

/**
 * Definitions of all 7 diatonic modes
 * Ordered by brightness (darkest to brightest)
 */
export const MODES: Record<ModeName, Mode> = {
  locrian: {
    name: 'locrian',
    displayName: 'Locrian',
    intervals: [0, 1, 3, 5, 6, 8, 10], // 1, ♭2, ♭3, 4, ♭5, ♭6, ♭7
    formula: 'H-W-W-H-W-W-W',
    characteristicNotes: [2, 5], // ♭2 and ♭5 (diminished 5th)
    description: 'The darkest and most unstable mode, built on the 7th degree of the major scale. Rarely used as a tonal center but creates extreme tension.',
    mood: 'Dark, unsettling, tense, unstable',
    brightness: 1,
    relativeToMajor: 7,
    color: '#1a0033', // deep purple-black
    commonChords: [
      { romanNumeral: 'i°', degree: 1, quality: 'diminished', intervals: [0, 3, 6], name: 'dim', function: 'tonic' },
      { romanNumeral: 'II', degree: 2, quality: 'major', intervals: [0, 4, 7], name: 'Maj', function: 'other' },
      { romanNumeral: 'iii', degree: 3, quality: 'minor', intervals: [0, 3, 7], name: 'min', function: 'other' },
      { romanNumeral: 'iv', degree: 4, quality: 'minor', intervals: [0, 3, 7], name: 'min', function: 'subdominant' },
      { romanNumeral: '♭V', degree: 5, quality: 'major', intervals: [0, 4, 7], name: 'Maj', function: 'other' },
    ],
    avoidNotes: [1], // The root itself can sound unstable due to the diminished triad
  },

  phrygian: {
    name: 'phrygian',
    displayName: 'Phrygian',
    intervals: [0, 1, 3, 5, 7, 8, 10], // 1, ♭2, ♭3, 4, 5, ♭6, ♭7
    formula: 'H-W-W-W-H-W-W',
    characteristicNotes: [2], // ♭2 (minor second)
    description: 'Built on the 3rd degree of the major scale. Features a distinctive Spanish/flamenco sound due to the ♭2 (minor second) interval.',
    mood: 'Exotic, Spanish, dark, mysterious',
    brightness: 2,
    relativeToMajor: 3,
    color: '#330033', // dark magenta
    commonChords: [
      { romanNumeral: 'i', degree: 1, quality: 'minor', intervals: [0, 3, 7], name: 'min', function: 'tonic' },
      { romanNumeral: '♭II', degree: 2, quality: 'major', intervals: [0, 4, 7], name: 'Maj', function: 'other' },
      { romanNumeral: '♭III', degree: 3, quality: 'major', intervals: [0, 4, 7], name: 'Maj', function: 'other' },
      { romanNumeral: 'iv', degree: 4, quality: 'minor', intervals: [0, 3, 7], name: 'min', function: 'subdominant' },
      { romanNumeral: 'v°', degree: 5, quality: 'diminished', intervals: [0, 3, 6], name: 'dim', function: 'dominant' },
      { romanNumeral: '♭VI', degree: 6, quality: 'major', intervals: [0, 4, 7], name: 'Maj', function: 'subdominant' },
      { romanNumeral: '♭vii', degree: 7, quality: 'minor', intervals: [0, 3, 7], name: 'min', function: 'other' },
    ],
  },

  aeolian: {
    name: 'aeolian',
    displayName: 'Aeolian (Natural Minor)',
    intervals: [0, 2, 3, 5, 7, 8, 10], // 1, 2, ♭3, 4, 5, ♭6, ♭7
    formula: 'W-H-W-W-H-W-W',
    characteristicNotes: [6], // ♭6 (distinguishes from Dorian)
    description: 'The natural minor scale, built on the 6th degree of the major scale. The most common minor mode in Western music.',
    mood: 'Sad, melancholic, serious, reflective',
    brightness: 3,
    relativeToMajor: 6,
    color: '#1a4d4d', // dark teal
    commonChords: [
      { romanNumeral: 'i', degree: 1, quality: 'minor', intervals: [0, 3, 7], name: 'min', function: 'tonic' },
      { romanNumeral: 'ii°', degree: 2, quality: 'diminished', intervals: [0, 3, 6], name: 'dim', function: 'other' },
      { romanNumeral: '♭III', degree: 3, quality: 'major', intervals: [0, 4, 7], name: 'Maj', function: 'other' },
      { romanNumeral: 'iv', degree: 4, quality: 'minor', intervals: [0, 3, 7], name: 'min', function: 'subdominant' },
      { romanNumeral: 'v', degree: 5, quality: 'minor', intervals: [0, 3, 7], name: 'min', function: 'dominant' },
      { romanNumeral: '♭VI', degree: 6, quality: 'major', intervals: [0, 4, 7], name: 'Maj', function: 'subdominant' },
      { romanNumeral: '♭VII', degree: 7, quality: 'major', intervals: [0, 4, 7], name: 'Maj', function: 'other' },
    ],
  },

  dorian: {
    name: 'dorian',
    displayName: 'Dorian',
    intervals: [0, 2, 3, 5, 7, 9, 10], // 1, 2, ♭3, 4, 5, 6, ♭7
    formula: 'W-H-W-W-W-H-W',
    characteristicNotes: [6], // Major 6th (distinguishes from Aeolian)
    description: 'Built on the 2nd degree of the major scale. A minor mode with a major 6th, giving it a jazzy, sophisticated sound.',
    mood: 'Cool, jazzy, sophisticated, hopeful minor',
    brightness: 4,
    relativeToMajor: 2,
    color: '#2d5a3d', // forest green
    commonChords: [
      { romanNumeral: 'i', degree: 1, quality: 'minor', intervals: [0, 3, 7], name: 'min', function: 'tonic' },
      { romanNumeral: 'ii', degree: 2, quality: 'minor', intervals: [0, 3, 7], name: 'min', function: 'other' },
      { romanNumeral: '♭III', degree: 3, quality: 'major', intervals: [0, 4, 7], name: 'Maj', function: 'other' },
      { romanNumeral: 'IV', degree: 4, quality: 'major', intervals: [0, 4, 7], name: 'Maj', function: 'subdominant' },
      { romanNumeral: 'v', degree: 5, quality: 'minor', intervals: [0, 3, 7], name: 'min', function: 'dominant' },
      { romanNumeral: 'vi°', degree: 6, quality: 'diminished', intervals: [0, 3, 6], name: 'dim', function: 'other' },
      { romanNumeral: '♭VII', degree: 7, quality: 'major', intervals: [0, 4, 7], name: 'Maj', function: 'other' },
    ],
  },

  mixolydian: {
    name: 'mixolydian',
    displayName: 'Mixolydian',
    intervals: [0, 2, 4, 5, 7, 9, 10], // 1, 2, 3, 4, 5, 6, ♭7
    formula: 'W-W-H-W-W-H-W',
    characteristicNotes: [7], // ♭7 (distinguishes from Ionian)
    description: 'Built on the 5th degree of the major scale. A major mode with a ♭7, giving it a bluesy, rock sound.',
    mood: 'Uplifting, bluesy, rock, optimistic',
    brightness: 5,
    relativeToMajor: 5,
    color: '#b35900', // burnt orange
    commonChords: [
      { romanNumeral: 'I', degree: 1, quality: 'major', intervals: [0, 4, 7], name: 'Maj', function: 'tonic' },
      { romanNumeral: 'ii', degree: 2, quality: 'minor', intervals: [0, 3, 7], name: 'min', function: 'other' },
      { romanNumeral: 'iii°', degree: 3, quality: 'diminished', intervals: [0, 3, 6], name: 'dim', function: 'other' },
      { romanNumeral: 'IV', degree: 4, quality: 'major', intervals: [0, 4, 7], name: 'Maj', function: 'subdominant' },
      { romanNumeral: 'v', degree: 5, quality: 'minor', intervals: [0, 3, 7], name: 'min', function: 'dominant' },
      { romanNumeral: 'vi', degree: 6, quality: 'minor', intervals: [0, 3, 7], name: 'min', function: 'other' },
      { romanNumeral: '♭VII', degree: 7, quality: 'major', intervals: [0, 4, 7], name: 'Maj', function: 'other' },
    ],
  },

  ionian: {
    name: 'ionian',
    displayName: 'Ionian (Major)',
    intervals: [0, 2, 4, 5, 7, 9, 11], // 1, 2, 3, 4, 5, 6, 7
    formula: 'W-W-H-W-W-W-H',
    characteristicNotes: [4, 7], // Perfect 4th and Major 7th
    description: 'The major scale, the foundation of Western music. Built on the 1st degree of itself.',
    mood: 'Happy, bright, stable, resolved',
    brightness: 6,
    relativeToMajor: 1,
    color: '#ffd700', // gold
    commonChords: [
      { romanNumeral: 'I', degree: 1, quality: 'major', intervals: [0, 4, 7], name: 'Maj', function: 'tonic' },
      { romanNumeral: 'ii', degree: 2, quality: 'minor', intervals: [0, 3, 7], name: 'min', function: 'other' },
      { romanNumeral: 'iii', degree: 3, quality: 'minor', intervals: [0, 3, 7], name: 'min', function: 'other' },
      { romanNumeral: 'IV', degree: 4, quality: 'major', intervals: [0, 4, 7], name: 'Maj', function: 'subdominant' },
      { romanNumeral: 'V', degree: 5, quality: 'major', intervals: [0, 4, 7], name: 'Maj', function: 'dominant' },
      { romanNumeral: 'vi', degree: 6, quality: 'minor', intervals: [0, 3, 7], name: 'min', function: 'other' },
      { romanNumeral: 'vii°', degree: 7, quality: 'diminished', intervals: [0, 3, 6], name: 'dim', function: 'other' },
    ],
  },

  lydian: {
    name: 'lydian',
    displayName: 'Lydian',
    intervals: [0, 2, 4, 6, 7, 9, 11], // 1, 2, 3, #4, 5, 6, 7
    formula: 'W-W-W-H-W-W-H',
    characteristicNotes: [4], // #4 (augmented 4th/tritone)
    description: 'Built on the 4th degree of the major scale. Features a #4, creating a dreamy, ethereal quality.',
    mood: 'Dreamy, mystical, bright, floating',
    brightness: 7,
    relativeToMajor: 4,
    color: '#00ffff', // cyan
    commonChords: [
      { romanNumeral: 'I', degree: 1, quality: 'major', intervals: [0, 4, 7], name: 'Maj', function: 'tonic' },
      { romanNumeral: 'II', degree: 2, quality: 'major', intervals: [0, 4, 7], name: 'Maj', function: 'other' },
      { romanNumeral: 'iii', degree: 3, quality: 'minor', intervals: [0, 3, 7], name: 'min', function: 'other' },
      { romanNumeral: '#iv°', degree: 4, quality: 'diminished', intervals: [0, 3, 6], name: 'dim', function: 'subdominant' },
      { romanNumeral: 'V', degree: 5, quality: 'major', intervals: [0, 4, 7], name: 'Maj', function: 'dominant' },
      { romanNumeral: 'vi', degree: 6, quality: 'minor', intervals: [0, 3, 7], name: 'min', function: 'other' },
      { romanNumeral: 'vii', degree: 7, quality: 'minor', intervals: [0, 3, 7], name: 'min', function: 'other' },
    ],
  },
};

/**
 * Get all modes ordered by brightness (darkest to brightest)
 */
export function getModesByBrightness(): Mode[] {
  return Object.values(MODES).sort((a, b) => a.brightness - b.brightness);
}

/**
 * Get modes in traditional order (by scale degree)
 * This is the standard music theory order: Ionian, Dorian, Phrygian, Lydian, Mixolydian, Aeolian, Locrian
 * Each mode corresponds to starting from a different degree of the major scale
 */
export function getModesByTraditionalOrder(): Mode[] {
  const traditionalOrder: ModeName[] = [
    'ionian',
    'dorian',
    'phrygian',
    'lydian',
    'mixolydian',
    'aeolian',
    'locrian',
  ];
  return traditionalOrder.map(name => MODES[name]);
}

/**
 * Get modes by the specified sort order
 */
export function getModesBySortOrder(order: 'traditional' | 'brightness'): Mode[] {
  return order === 'traditional' ? getModesByTraditionalOrder() : getModesByBrightness();
}

/**
 * Get mode by name
 */
export function getMode(name: ModeName): Mode {
  return MODES[name];
}

/**
 * Get all mode names
 */
export function getAllModeNames(): ModeName[] {
  return Object.keys(MODES) as ModeName[];
}

/**
 * Get modes that are parallel (same root note)
 */
export function getParallelModes(currentMode: ModeName): Mode[] {
  return Object.values(MODES).filter(mode => mode.name !== currentMode);
}

/**
 * Get the relative mode (modes that share the same notes)
 * For example, C Major (Ionian) and A Minor (Aeolian) are relative
 */
export function getRelativeMode(mode: Mode, targetDegree: number): Mode {
  return Object.values(MODES).find(m => m.relativeToMajor === targetDegree) || mode;
}
