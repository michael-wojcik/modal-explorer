import { create } from 'zustand';
import type { NoteName, ModeName, Note, ChordInstance, InstrumentSettings } from './types';
import type { KeyboardLayoutType } from './keyboard-mappings';

interface AppState {
  // Mode and scale state
  currentMode: ModeName;
  currentRoot: NoteName;
  currentOctave: number;

  // Playback state
  isPlaying: boolean;
  tempo: number;
  volume: number;

  // UI state
  activeNotes: Set<number>; // MIDI numbers of currently playing notes
  hoveredNote: number | null;
  selectedChords: ChordInstance[];
  noteTrails: Array<{
    id: string;
    midiNumber: number;
    timestamp: number;
    sourceType: 'keyboard' | 'mouse' | 'chord';
    isChord: boolean;
    sourcePosition?: { x: number; y: number };
  }>;

  // Instrument settings
  instrumentSettings: InstrumentSettings;

  // View state
  showChords: boolean;
  showStaffNotation: boolean;
  showGuitarFretboard: boolean;
  modeSortOrder: 'traditional' | 'brightness';

  // Keyboard control state
  keyboardEnabled: boolean;
  keyboardLayout: KeyboardLayoutType;
  keyboardOctaveOffset: number; // -2 to +2
  keyboardVelocity: number; // 0-127
  sustainPedal: boolean;
  activeComputerKeys: Set<string>; // Currently pressed computer keys
  showKeyboardOverlay: boolean;
  keyboardLabelsOnPiano: boolean;
  keyboardOverlayJustDismissed: boolean;
  welcomeHintJustDismissed: boolean;
  modeJustChanged: boolean;
  playingProgressionIndex: number | null;
  settingJustChanged: { type: 'octave' | 'root' | 'tempo' | null; timestamp: number };

  // Actions
  setMode: (mode: ModeName) => void;
  setRoot: (root: NoteName) => void;
  setOctave: (octave: number) => void;
  setTempo: (tempo: number) => void;
  setVolume: (volume: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  addActiveNote: (midiNumber: number) => void;
  removeActiveNote: (midiNumber: number) => void;
  clearActiveNotes: () => void;
  setHoveredNote: (midiNumber: number | null) => void;
  setSelectedChords: (chords: ChordInstance[]) => void;
  addNoteTrail: (
    midiNumber: number,
    sourceType?: 'keyboard' | 'mouse' | 'chord',
    isChord?: boolean,
    sourcePosition?: { x: number; y: number }
  ) => void;
  clearOldTrails: () => void;
  updateInstrumentSettings: (settings: Partial<InstrumentSettings>) => void;
  toggleChords: () => void;
  toggleStaffNotation: () => void;
  toggleGuitarFretboard: () => void;
  setModeSortOrder: (order: 'traditional' | 'brightness') => void;

  // Keyboard control actions
  toggleKeyboard: () => void;
  setKeyboardEnabled: (enabled: boolean) => void;
  setKeyboardLayout: (layout: KeyboardLayoutType) => void;
  cycleKeyboardLayout: () => void;
  shiftOctave: (direction: 'up' | 'down') => void;
  resetOctave: () => void;
  setKeyboardVelocity: (velocity: number) => void;
  setSustainPedal: (active: boolean) => void;
  addActiveComputerKey: (key: string) => void;
  removeActiveComputerKey: (key: string) => void;
  clearActiveComputerKeys: () => void;
  toggleKeyboardOverlay: () => void;
  toggleKeyboardLabels: () => void;
  setKeyboardOverlayJustDismissed: (dismissed: boolean) => void;
  setWelcomeHintJustDismissed: (dismissed: boolean) => void;
  setModeJustChanged: (changed: boolean) => void;
  setPlayingProgressionIndex: (index: number | null) => void;
  setSettingJustChanged: (type: 'octave' | 'root' | 'tempo' | null) => void;
}

export const useStore = create<AppState>((set) => ({
  // Initial state
  currentMode: 'ionian',
  currentRoot: 'C',
  currentOctave: 4,
  isPlaying: false,
  tempo: 120,
  volume: -6,
  activeNotes: new Set(),
  hoveredNote: null,
  selectedChords: [],
  noteTrails: [],
  instrumentSettings: {
    type: 'piano',
    volume: -6,
    reverb: 0.3,
    delay: 0,
    attack: 0.005,
    release: 0.8,
  },
  showChords: true,
  showStaffNotation: false,
  showGuitarFretboard: false,
  modeSortOrder: 'traditional',

  // Keyboard control initial state
  keyboardEnabled: false,
  keyboardLayout: 'scaleDegree',
  keyboardOctaveOffset: 0,
  keyboardVelocity: 80,
  sustainPedal: false,
  activeComputerKeys: new Set(),
  showKeyboardOverlay: false,
  keyboardLabelsOnPiano: true,
  keyboardOverlayJustDismissed: false,
  welcomeHintJustDismissed: false,
  modeJustChanged: false,
  playingProgressionIndex: null,
  settingJustChanged: { type: null, timestamp: 0 },

  // Actions
  setMode: (mode) => set({ currentMode: mode, modeJustChanged: true }),
  setRoot: (root) =>
    set({ currentRoot: root, settingJustChanged: { type: 'root', timestamp: Date.now() } }),
  setOctave: (octave) =>
    set({ currentOctave: octave, settingJustChanged: { type: 'octave', timestamp: Date.now() } }),
  setTempo: (tempo) =>
    set({ tempo, settingJustChanged: { type: 'tempo', timestamp: Date.now() } }),
  setVolume: (volume) => set({ volume }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),

  addActiveNote: (midiNumber) =>
    set((state) => ({
      activeNotes: new Set(state.activeNotes).add(midiNumber),
    })),

  removeActiveNote: (midiNumber) =>
    set((state) => {
      const newActiveNotes = new Set(state.activeNotes);
      newActiveNotes.delete(midiNumber);
      return { activeNotes: newActiveNotes };
    }),

  clearActiveNotes: () => set({ activeNotes: new Set() }),

  setHoveredNote: (midiNumber) => set({ hoveredNote: midiNumber }),

  setSelectedChords: (chords) => set({ selectedChords: chords }),

  addNoteTrail: (midiNumber, sourceType = 'keyboard', isChord = false, sourcePosition) =>
    set((state) => ({
      noteTrails: [
        ...state.noteTrails,
        {
          id: `${Date.now()}-${Math.random()}-${midiNumber}`,
          midiNumber,
          timestamp: Date.now(),
          sourceType,
          isChord,
          sourcePosition,
        },
      ],
    })),

  clearOldTrails: () =>
    set((state) => ({
      noteTrails: state.noteTrails.filter(
        (trail) => Date.now() - trail.timestamp < 1000
      ),
    })),

  updateInstrumentSettings: (settings) =>
    set((state) => ({
      instrumentSettings: { ...state.instrumentSettings, ...settings },
    })),

  toggleChords: () => set((state) => ({ showChords: !state.showChords })),
  toggleStaffNotation: () => set((state) => ({ showStaffNotation: !state.showStaffNotation })),
  toggleGuitarFretboard: () => set((state) => ({ showGuitarFretboard: !state.showGuitarFretboard })),
  setModeSortOrder: (order) => set({ modeSortOrder: order }),

  // Keyboard control actions
  toggleKeyboard: () =>
    set((state) => ({
      keyboardEnabled: !state.keyboardEnabled,
      showKeyboardOverlay: !state.keyboardEnabled ? true : state.showKeyboardOverlay,
    })),

  setKeyboardEnabled: (enabled) => set({ keyboardEnabled: enabled }),

  setKeyboardLayout: (layout) => set({ keyboardLayout: layout }),

  cycleKeyboardLayout: () =>
    set((state) => {
      const layouts: KeyboardLayoutType[] = ['scaleDegree', 'chromatic'];
      const currentIndex = layouts.indexOf(state.keyboardLayout);
      const nextIndex = (currentIndex + 1) % layouts.length;
      return { keyboardLayout: layouts[nextIndex] };
    }),

  shiftOctave: (direction) =>
    set((state) => {
      const newOffset = direction === 'up'
        ? Math.min(2, state.keyboardOctaveOffset + 1)
        : Math.max(-2, state.keyboardOctaveOffset - 1);
      return { keyboardOctaveOffset: newOffset };
    }),

  resetOctave: () => set({ keyboardOctaveOffset: 0 }),

  setKeyboardVelocity: (velocity) =>
    set({ keyboardVelocity: Math.max(0, Math.min(127, velocity)) }),

  setSustainPedal: (active) => set({ sustainPedal: active }),

  addActiveComputerKey: (key) =>
    set((state) => ({
      activeComputerKeys: new Set(state.activeComputerKeys).add(key.toLowerCase()),
    })),

  removeActiveComputerKey: (key) =>
    set((state) => {
      const newKeys = new Set(state.activeComputerKeys);
      newKeys.delete(key.toLowerCase());
      return { activeComputerKeys: newKeys };
    }),

  clearActiveComputerKeys: () => set({ activeComputerKeys: new Set() }),

  toggleKeyboardOverlay: () =>
    set((state) => ({ showKeyboardOverlay: !state.showKeyboardOverlay })),

  toggleKeyboardLabels: () =>
    set((state) => ({ keyboardLabelsOnPiano: !state.keyboardLabelsOnPiano })),

  setKeyboardOverlayJustDismissed: (dismissed) =>
    set({ keyboardOverlayJustDismissed: dismissed }),

  setWelcomeHintJustDismissed: (dismissed) =>
    set({ welcomeHintJustDismissed: dismissed }),

  setModeJustChanged: (changed) =>
    set({ modeJustChanged: changed }),

  setPlayingProgressionIndex: (index) =>
    set({ playingProgressionIndex: index }),

  setSettingJustChanged: (type) =>
    set({ settingJustChanged: { type, timestamp: type ? Date.now() : 0 } }),
}));
