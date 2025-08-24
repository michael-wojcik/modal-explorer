import type { Note, NoteName, Mode, ModeName, Scale, ChordInstance, ChordQuality, ChordDefinition } from './types';
import { createNote, transposeNote, NOTE_NAMES } from './notes';
import { MODES, getMode } from './modes';

/**
 * Generate a scale from a root note and mode
 */
export function generateScale(root: NoteName, mode: ModeName, octave: number = 4): Scale {
  const modeData = getMode(mode);
  const rootNote = createNote(root, octave);

  const notes = modeData.intervals.map(interval =>
    transposeNote(rootNote, interval)
  );

  return {
    root,
    mode: modeData,
    notes,
    octave,
  };
}

/**
 * Generate multiple octaves of a scale
 */
export function generateScaleMultipleOctaves(
  root: NoteName,
  mode: ModeName,
  startOctave: number = 3,
  numOctaves: number = 2
): Note[] {
  const notes: Note[] = [];

  for (let i = 0; i < numOctaves; i++) {
    const scale = generateScale(root, mode, startOctave + i);
    notes.push(...scale.notes);
  }

  // Add the root note one octave higher to complete the scale
  const finalRoot = createNote(root, startOctave + numOctaves);
  notes.push(finalRoot);

  return notes;
}

/**
 * Build a chord from a root note and quality
 */
export function buildChord(root: Note, quality: ChordQuality): ChordInstance {
  const intervals = getChordIntervals(quality);
  const notes = intervals.map(interval => transposeNote(root, interval));

  return {
    root,
    quality,
    notes,
  };
}

/**
 * Get intervals for a chord quality
 */
export function getChordIntervals(quality: ChordQuality): number[] {
  const intervals: Record<ChordQuality, number[]> = {
    'major': [0, 4, 7],
    'minor': [0, 3, 7],
    'diminished': [0, 3, 6],
    'augmented': [0, 4, 8],
    'dominant7': [0, 4, 7, 10],
    'major7': [0, 4, 7, 11],
    'minor7': [0, 3, 7, 10],
    'halfDiminished7': [0, 3, 6, 10],
    'diminished7': [0, 3, 6, 9],
  };

  return intervals[quality];
}

/**
 * Generate diatonic chords for a scale
 */
export function generateDiatonicChords(root: NoteName, mode: ModeName, octave: number = 4): ChordInstance[] {
  const scale = generateScale(root, mode, octave);
  const modeData = getMode(mode);

  return modeData.commonChords.map(chordDef => {
    // Get the scale degree (1-indexed, so subtract 1)
    const degreeIndex = chordDef.degree - 1;
    const chordRoot = scale.notes[degreeIndex];

    const chord = buildChord(chordRoot, chordDef.quality);

    return {
      ...chord,
      romanNumeral: chordDef.romanNumeral,
      function: chordDef.function,
    };
  });
}

/**
 * Build a specific chord from a scale degree
 */
export function buildChordFromDegree(
  root: NoteName,
  mode: ModeName,
  degree: number,
  octave: number = 4
): ChordInstance | null {
  const scale = generateScale(root, mode, octave);
  const modeData = getMode(mode);

  const chordDef = modeData.commonChords.find(c => c.degree === degree);
  if (!chordDef) return null;

  const chordRoot = scale.notes[degree - 1];
  const chord = buildChord(chordRoot, chordDef.quality);

  return {
    ...chord,
    romanNumeral: chordDef.romanNumeral,
    function: chordDef.function,
  };
}

/**
 * Analyze notes to determine the most likely mode
 * Returns modes sorted by confidence
 */
export function analyzeModeFromNotes(notes: Note[], possibleRoot?: NoteName): ModeName[] {
  const uniqueNotes = Array.from(new Set(notes.map(n => n.midiNumber % 12)));
  const modeScores: { mode: ModeName; score: number }[] = [];

  // Test each mode
  for (const modeName of Object.keys(MODES) as ModeName[]) {
    const mode = MODES[modeName];

    // If a root is specified, test only that root
    // Otherwise, test all possible roots
    const rootsToTest = possibleRoot
      ? [possibleRoot]
      : NOTE_NAMES;

    for (const root of rootsToTest) {
      const scale = generateScale(root, modeName);
      const scaleNotes = scale.notes.map(n => n.midiNumber % 12);

      // Calculate how many of the played notes are in this scale
      const matchingNotes = uniqueNotes.filter(n => scaleNotes.includes(n)).length;
      const score = matchingNotes / uniqueNotes.length;

      // Bonus points if all scale notes are used
      if (score === 1) {
        modeScores.push({ mode: modeName, score: score + 0.1 });
      } else {
        modeScores.push({ mode: modeName, score });
      }
    }
  }

  // Sort by score and return mode names
  return modeScores
    .sort((a, b) => b.score - a.score)
    .map(m => m.mode)
    .filter((mode, index, self) => self.indexOf(mode) === index) // Remove duplicates
    .slice(0, 3); // Return top 3
}

/**
 * Get chord progression templates for a mode
 */
export function getCommonProgressions(mode: ModeName): { name: string; degrees: number[] }[] {
  const progressions: Record<ModeName, { name: string; degrees: number[] }[]> = {
    ionian: [
      { name: 'I-IV-V-I (Classic)', degrees: [1, 4, 5, 1] },
      { name: 'I-vi-IV-V (50s progression)', degrees: [1, 6, 4, 5] },
      { name: 'I-V-vi-IV (Pop)', degrees: [1, 5, 6, 4] },
      { name: 'ii-V-I (Jazz)', degrees: [2, 5, 1] },
    ],
    dorian: [
      { name: 'i-IV (Dorian vamp)', degrees: [1, 4] },
      { name: 'i-ii-i (Modal)', degrees: [1, 2, 1] },
      { name: 'i-IV-♭VII-i', degrees: [1, 4, 7, 1] },
    ],
    phrygian: [
      { name: 'i-♭II (Phrygian cadence)', degrees: [1, 2] },
      { name: 'i-♭VII-♭VI-♭II', degrees: [1, 7, 6, 2] },
      { name: 'i-♭II-i (Spanish)', degrees: [1, 2, 1] },
    ],
    lydian: [
      { name: 'I-II (Lydian signature)', degrees: [1, 2] },
      { name: 'I-II-I-V', degrees: [1, 2, 1, 5] },
      { name: 'I-II-iii-II', degrees: [1, 2, 3, 2] },
    ],
    mixolydian: [
      { name: 'I-♭VII (Rock)', degrees: [1, 7] },
      { name: 'I-♭VII-IV-I', degrees: [1, 7, 4, 1] },
      { name: 'I-ii-♭VII-I', degrees: [1, 2, 7, 1] },
    ],
    aeolian: [
      { name: 'i-♭VI-♭VII-i', degrees: [1, 6, 7, 1] },
      { name: 'i-iv-v-i', degrees: [1, 4, 5, 1] },
      { name: 'i-♭VII-♭VI-V (Andalusian)', degrees: [1, 7, 6, 5] },
    ],
    locrian: [
      { name: 'i°-♭II (Unstable)', degrees: [1, 2] },
      { name: 'i°-iv-i°', degrees: [1, 4, 1] },
    ],
  };

  return progressions[mode];
}

/**
 * Transpose a mode to a different root
 */
export function transposeMode(currentRoot: NoteName, newRoot: NoteName, mode: ModeName): Scale {
  return generateScale(newRoot, mode);
}

/**
 * Get the interval difference between two notes (in semitones)
 */
export function getIntervalBetweenNotes(note1: NoteName, note2: NoteName): number {
  const index1 = NOTE_NAMES.indexOf(note1);
  const index2 = NOTE_NAMES.indexOf(note2);
  return (index2 - index1 + 12) % 12;
}

/**
 * Find enharmonic equivalent
 */
export function getEnharmonic(note: NoteName): NoteName | null {
  const enharmonics: Record<string, NoteName> = {
    'C#': 'C#',  // Db
    'D#': 'D#',  // Eb
    'F#': 'F#',  // Gb
    'G#': 'G#',  // Ab
    'A#': 'A#',  // Bb
  };

  return enharmonics[note] || null;
}

/**
 * Format chord name with root and quality
 */
export function formatChordName(root: NoteName, quality: ChordQuality): string {
  const qualitySymbols: Record<ChordQuality, string> = {
    'major': '',
    'minor': 'm',
    'diminished': '°',
    'augmented': '+',
    'dominant7': '7',
    'major7': 'maj7',
    'minor7': 'm7',
    'halfDiminished7': 'ø7',
    'diminished7': '°7',
  };

  return `${root}${qualitySymbols[quality]}`;
}
