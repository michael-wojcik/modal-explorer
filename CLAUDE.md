# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Modal Explorer is an interactive music education app for exploring the seven diatonic modes. It combines music theory, audio synthesis, and an innovative computer keyboard control system to help musicians understand modes through visual and auditory learning.

## Development Commands

```bash
# Development server (uses Turbopack for faster builds)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

The dev server runs on http://localhost:3000 by default.

## Architecture

### Core Systems

The application is built around four interconnected systems:

1. **Music Theory Engine** (`lib/theory-engine.ts`)
2. **Audio Engine** (`lib/audio-engine.ts`)
3. **Keyboard Control System** (`lib/keyboard-mappings.ts`, `hooks/useKeyboardPiano.ts`)
4. **State Management** (`lib/store.ts`)

### Music Theory Engine

The theory engine (`lib/theory-engine.ts`) provides pure functions for musical calculations:

- **Scale generation**: `generateScale(root, mode, octave)` - Creates a scale from intervals
- **Chord building**: `buildChord(root, quality)` and `buildChordFromDegree(root, mode, degree, octave)`
- **Diatonic chord generation**: `generateDiatonicChords(root, mode, octave)` - Creates all seven diatonic chords for a mode

**Key Concept**: All modes are built from interval patterns (semitone distances from root). The engine calculates notes using MIDI numbers (0-127) and frequencies in Hz.

Mode data is defined in `lib/modes.ts` with:
- `intervals`: Array of semitone distances from root (e.g., Ionian: [0, 2, 4, 5, 7, 9, 11])
- `characteristicNotes`: Scale degrees that define the mode's unique sound
- `commonChords`: Diatonic chord definitions with Roman numerals

### Audio Engine

The audio engine (`lib/audio-engine.ts`) is a singleton class wrapping Tone.js:

```typescript
const audioEngine = getAudioEngine();
await audioEngine.initialize(); // Must be called after user interaction
audioEngine.playNote(note, '8n');
audioEngine.playChord(notes, '2n');
```

**Critical Implementation Details**:
- Singleton pattern via `getAudioEngine()` ensures one audio context
- Must call `initialize()` after user interaction (browser requirement)
- Effects chain: Synth → Delay → Reverb → Volume → Destination
- Uses PolySynth for multiple simultaneous notes
- Tone.js notation for durations: '8n' (eighth note), '2n' (half note), '4n' (quarter note)

### Keyboard Control System

The keyboard control system allows playing the piano using computer keys with **scale degree mapping** - a key innovation that makes the controls musically intuitive.

**Scale Degree Mapping** (`lib/keyboard-mappings.ts`):
- Number keys 1-7 play scale degrees of the current mode
- Key '1' always plays the root, '5' always plays the dominant, etc.
- Automatically adapts to any mode and root note
- Q-U row: Upper octave (+8 semitones)
- Z-M row: Lower octave (-8 semitones)
- Alt modifier: Play chord for that scale degree
- Backtick (`): Toggle keyboard mode on/off
- Space: Sustain pedal
- [ / ]: Decrease/increase velocity

**Smart Key Filtering** (`hooks/useKeyboardPiano.ts`):
The keyboard hook implements sophisticated event handling:

```typescript
// ALWAYS allow UI navigation to pass through
if (UI_NAVIGATION_KEYS.has(event.key)) {
  return; // Don't prevent default!
}

// Allow normal typing in input fields
if (isInputElement(document.activeElement)) {
  return;
}
```

This ensures:
- Tab, Enter, arrows, etc. always work for UI navigation
- Typing in inputs/textareas/selects works normally
- Only music keys are captured when keyboard mode is active

**Why Backtick for Toggle?**
The backtick (`) was chosen to avoid conflicts - it's:
- Easily accessible
- Not used in normal typing
- Not needed for UI navigation
- Not part of the musical keyboard layout

### State Management

The Zustand store (`lib/store.ts`) is the single source of truth connecting all systems:

**Music State**:
- `currentMode`, `currentRoot`, `currentOctave`: Define the current musical context
- `activeNotes`: Set of MIDI numbers currently playing
- `tempo`, `volume`, `instrumentSettings`: Playback parameters

**Keyboard State**:
- `keyboardEnabled`: Master toggle for keyboard mode
- `keyboardLayout`: 'scaleDegree' or 'chromatic'
- `keyboardVelocity`: MIDI velocity (0-127)
- `sustainPedal`: Whether sustain pedal is active
- `activeComputerKeys`: Set of currently pressed computer keys
- `showKeyboardOverlay`: Help overlay visibility

**Important Pattern**: The store uses `Set` objects for tracking active items. When updating Sets:
```typescript
addActiveNote: (midiNumber) =>
  set((state) => ({
    activeNotes: new Set(state.activeNotes).add(midiNumber),
  }))
```
Always create a new Set to trigger re-renders.

### Component Architecture

**Interactive Piano Keyboard** (`components/PianoKeyboard.tsx`):
- Renders SVG piano keyboard spanning multiple octaves
- Highlights scale notes, root notes, and characteristic notes
- Shows keyboard labels (1-7) when keyboard mode is active
- Handles both mouse clicks and computer keyboard input

**Transport Controls** (`components/TransportControls.tsx`):
- Playback controls (play scale, play chords)
- Musical settings (key, octave, tempo, volume)
- Keyboard mode toggle button

**Mode Sidebar** (`components/ModeSidebar.tsx`):
- Mode selection with descriptions
- Displays mode intervals and brightness
- Color-coded mode cards

**Keyboard Overlay** (`components/KeyboardOverlay.tsx`):
- Full-screen help overlay showing keyboard mappings
- Organized by octave (main, upper, lower)
- Real-time highlighting of pressed keys
- Displays current mode and shortcuts

## Key Concepts and Patterns

### Musical Theory

**Scale Degrees vs. Chromatic Notes**:
The app uses scale degrees (1-7) rather than chromatic note names (C, D♭, D, etc.) for keyboard mapping. This makes the controls:
- Musically meaningful (1 = root, 5 = dominant)
- Mode-agnostic (adapts to current mode automatically)
- Easy to remember (1-7 for scale degrees)

**Diatonic Modes**:
All seven modes are rotations of the major scale with different interval patterns:
- Ionian (Major): Bright, stable
- Dorian: Minor with raised 6th
- Phrygian: Dark, exotic
- Lydian: Bright, ethereal
- Mixolydian: Major with ♭7
- Aeolian (Natural Minor): Sad, introspective
- Locrian: Unstable, diminished

**Characteristic Notes**:
Each mode has 1-2 notes that distinguish it from other modes. These are highlighted in purple on the piano keyboard and are critical for the mode's unique sound.

### Technical Patterns

**Singleton Audio Engine**:
Only one AudioEngine instance exists throughout the app lifecycle to avoid multiple audio contexts:
```typescript
let audioEngineInstance: AudioEngine | null = null;

export function getAudioEngine(): AudioEngine {
  if (!audioEngineInstance) {
    audioEngineInstance = new AudioEngine();
  }
  return audioEngineInstance;
}
```

**Web Audio Initialization**:
Browsers require user interaction before starting audio. The app initializes on first click:
```typescript
useEffect(() => {
  const initAudio = async () => {
    if (!audioEngine.initialized) {
      await audioEngine.initialize();
    }
  };
  document.addEventListener('click', initAudio, { once: true });
}, []);
```

**MIDI Number System**:
Notes are represented internally as MIDI numbers (0-127) where:
- C4 (middle C) = 60
- Each semitone = +1
- Octaves = 12 semitones

Conversion functions in `lib/notes.ts`:
- `noteNameToMidiNumber(name, octave)`: Convert note name to MIDI
- `midiNumberToFrequency(midiNumber)`: Convert to Hz
- `toToneNotation(note)`: Convert to Tone.js format (e.g., "C4")

### TypeScript Types

Core types are defined in `lib/types.ts`:

```typescript
interface Note {
  name: NoteName;
  octave: number;
  midiNumber: number;
  frequency: number;
}

interface Mode {
  name: ModeName;
  intervals: number[]; // Semitone distances
  characteristicNotes: ScaleDegree[];
  commonChords: ChordDefinition[];
  // ...
}
```

These types ensure type safety throughout the musical calculations.

## Common Tasks

### Adding a New Mode Feature

1. Update `lib/modes.ts` with mode data (intervals, characteristic notes, common chords)
2. Theory engine will automatically support it
3. UI components will automatically display it

### Modifying Keyboard Layout

1. Edit `SCALE_DEGREE_LAYOUT` in `lib/keyboard-mappings.ts`
2. Update `KeyboardOverlay.tsx` to display new mappings
3. No changes needed to `useKeyboardPiano.ts` hook

### Adjusting Audio Synthesis

1. Modify `AudioEngine` constructor in `lib/audio-engine.ts`
2. Change oscillator type, envelope settings, or effects parameters
3. Use `updateSettings()` method for runtime changes

### Adding New Instrument Presets

1. Define preset in `lib/types.ts` InstrumentSettings interface
2. Create preset in store or separate presets file
3. Apply via `audioEngine.updateSettings(preset)`

## Important Constraints

### Web Audio Limitations

- Audio context must be initialized after user interaction (browser security)
- Only one audio context should exist per page
- Tone.js Transport is global - use carefully with concurrent playback

### Keyboard Event Handling

- Never capture Tab, Enter, arrows (UI navigation keys)
- Always check for input focus before preventing default
- Use lowercase for key comparisons (event.key.toLowerCase())
- Prevent key repeat with Set tracking

### Performance Considerations

- Piano keyboard uses SVG for scalability but memoize calculations
- Use `useMemo` for expensive scale/chord generation
- Avoid recreating Sets unnecessarily in store updates
- Tone.js sequences must be disposed to prevent memory leaks

## Project Structure

```
modal-explorer/
├── app/
│   ├── page.tsx              # Main app page (client component)
│   ├── layout.tsx            # Root layout with metadata
│   └── globals.css           # Global styles and Tailwind
├── components/
│   ├── PianoKeyboard.tsx     # Interactive SVG piano
│   ├── PianoKey.tsx          # Individual key component
│   ├── ModeSidebar.tsx       # Mode selection UI
│   ├── TransportControls.tsx # Playback controls
│   ├── ChordDisplay.tsx      # Chord cards
│   ├── KeyboardOverlay.tsx   # Help overlay
│   └── KeyboardIndicator.tsx # Floating keyboard status
├── lib/
│   ├── types.ts              # TypeScript definitions
│   ├── notes.ts              # Note utilities & conversions
│   ├── modes.ts              # Mode data definitions
│   ├── theory-engine.ts      # Music theory algorithms
│   ├── audio-engine.ts       # Tone.js wrapper
│   ├── keyboard-mappings.ts  # Keyboard layout definitions
│   └── store.ts              # Zustand state management
└── hooks/
    └── useKeyboardPiano.ts   # Keyboard event handler hook
```

## Tech Stack

- **Framework**: Next.js 15.5+ with App Router
- **Language**: TypeScript 5+ (strict mode)
- **Audio**: Tone.js 15+ (Web Audio API wrapper)
- **State**: Zustand 5+ (lightweight state management)
- **Animation**: Framer Motion 12+
- **Styling**: Tailwind CSS 4+
- **Icons**: Lucide React

## Path Aliases

The project uses `@/` as an alias for the root directory:
```typescript
import { useStore } from '@/lib/store';
import { PianoKeyboard } from '@/components/PianoKeyboard';
```
