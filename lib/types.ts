// Core musical types and interfaces

export type NoteName = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B';

export type ModeName = 'ionian' | 'dorian' | 'phrygian' | 'lydian' | 'mixolydian' | 'aeolian' | 'locrian';

export type ChordQuality = 'major' | 'minor' | 'diminished' | 'augmented' | 'dominant7' | 'major7' | 'minor7' | 'halfDiminished7' | 'diminished7';

export type ScaleDegree = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface Note {
  name: NoteName;
  octave: number;
  frequency: number;
  midiNumber: number;
}

export interface Interval {
  semitones: number;
  name: string;
  degree: ScaleDegree;
}

export interface Mode {
  name: ModeName;
  displayName: string;
  intervals: number[]; // semitones from root [0, 2, 4, 5, 7, 9, 11] for major
  formula: string; // "W-W-H-W-W-W-H" for major
  characteristicNotes: ScaleDegree[]; // scale degrees that define the mode
  description: string;
  mood: string;
  brightness: number; // 1-7, 1 being darkest (Locrian), 7 being brightest (Lydian)
  relativeToMajor: number; // which degree of major scale this mode starts on
  commonChords: ChordDefinition[];
  avoidNotes?: ScaleDegree[];
  color: string; // hex color for visualization
}

export interface ChordDefinition {
  romanNumeral: string;
  degree: ScaleDegree;
  quality: ChordQuality;
  intervals: number[]; // intervals from root
  name: string; // e.g., "Dm7"
  function: 'tonic' | 'subdominant' | 'dominant' | 'other';
}

export interface Scale {
  root: NoteName;
  mode: Mode;
  notes: Note[];
  octave: number;
}

export interface ChordInstance {
  root: Note;
  quality: ChordQuality;
  notes: Note[];
  romanNumeral?: string;
  function?: 'tonic' | 'subdominant' | 'dominant' | 'other';
}

export interface ModeAnalysis {
  detectedMode: ModeName;
  confidence: number;
  alternativeModes: { mode: ModeName; confidence: number }[];
  suggestedChords: ChordInstance[];
  melodicTendencies: Note[];
}

export interface InstrumentSettings {
  type: 'piano' | 'synth' | 'guitar' | 'bass' | 'strings';
  volume: number;
  reverb: number;
  delay: number;
  attack: number;
  release: number;
}

export interface TransportSettings {
  tempo: number;
  isPlaying: boolean;
  loop: boolean;
  currentBeat: number;
}

export interface ChordProgression {
  id: string;
  name: string;
  chords: ChordDefinition[];
  mode: ModeName;
  timeSignature: string;
}
