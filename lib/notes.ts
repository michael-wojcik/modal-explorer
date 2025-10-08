import type { NoteName, Note } from './types';

// All note names in chromatic order
export const NOTE_NAMES: NoteName[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Alternative enharmonic spellings (for display purposes)
export const ENHARMONIC_MAP: Record<NoteName, string> = {
  'C': 'C',
  'C#': 'C♯/D♭',
  'D': 'D',
  'D#': 'D♯/E♭',
  'E': 'E',
  'F': 'F',
  'F#': 'F♯/G♭',
  'G': 'G',
  'G#': 'G♯/A♭',
  'A': 'A',
  'A#': 'A♯/B♭',
  'B': 'B',
};

/**
 * Convert MIDI note number to frequency in Hz
 * A4 (MIDI 69) = 440 Hz
 */
export function midiToFrequency(midiNumber: number): number {
  return 440 * Math.pow(2, (midiNumber - 69) / 12);
}

/**
 * Convert frequency to MIDI note number
 */
export function frequencyToMidi(frequency: number): number {
  return Math.round(69 + 12 * Math.log2(frequency / 440));
}

/**
 * Get MIDI number for a note name and octave
 * C4 = 60 (middle C)
 */
export function getNoteNumber(noteName: NoteName, octave: number): number {
  const noteIndex = NOTE_NAMES.indexOf(noteName);
  return (octave + 1) * 12 + noteIndex;
}

/**
 * Get note name from MIDI number
 */
export function getNoteName(midiNumber: number): NoteName {
  const noteIndex = midiNumber % 12;
  return NOTE_NAMES[noteIndex];
}

/**
 * Get octave from MIDI number
 */
export function getOctave(midiNumber: number): number {
  return Math.floor(midiNumber / 12) - 1;
}

/**
 * Create a Note object from name and octave
 */
export function createNote(noteName: NoteName, octave: number): Note {
  const midiNumber = getNoteNumber(noteName, octave);
  return {
    name: noteName,
    octave,
    frequency: midiToFrequency(midiNumber),
    midiNumber,
  };
}

/**
 * Transpose a note by semitones
 */
export function transposeNote(note: Note, semitones: number): Note {
  const newMidiNumber = note.midiNumber + semitones;
  const newNoteName = getNoteName(newMidiNumber);
  const newOctave = getOctave(newMidiNumber);
  return createNote(newNoteName, newOctave);
}

/**
 * Get the interval in semitones between two notes
 */
export function getInterval(note1: Note, note2: Note): number {
  return note2.midiNumber - note1.midiNumber;
}

/**
 * Format note for display (e.g., "C4", "F#5")
 */
export function formatNote(note: Note): string {
  return `${note.name}${note.octave}`;
}

/**
 * Parse note string (e.g., "C4") into NoteName and octave
 */
export function parseNoteString(noteString: string): { name: NoteName; octave: number } | null {
  const match = noteString.match(/^([A-G]#?)(\d+)$/);
  if (!match) return null;

  const name = match[1] as NoteName;
  const octave = parseInt(match[2]);

  if (!NOTE_NAMES.includes(name)) return null;

  return { name, octave };
}

/**
 * Get all notes in an octave starting from a root note
 */
export function getChromaticScale(root: NoteName, octave: number): Note[] {
  const startIndex = NOTE_NAMES.indexOf(root);
  const notes: Note[] = [];

  for (let i = 0; i < 12; i++) {
    const noteIndex = (startIndex + i) % 12;
    const noteName = NOTE_NAMES[noteIndex];
    const noteOctave = octave + Math.floor((startIndex + i) / 12);
    notes.push(createNote(noteName, noteOctave));
  }

  return notes;
}

/**
 * Convert note name to scientific pitch notation
 */
export function toScientificNotation(note: Note): string {
  return formatNote(note);
}

/**
 * Get Tone.js compatible note string
 */
export function toToneNotation(note: Note): string {
  return formatNote(note);
}
