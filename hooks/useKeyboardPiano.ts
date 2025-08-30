import { useEffect, useCallback, useRef } from 'react';
import { useStore } from '@/lib/store';
import {
  getKeyboardLayout,
  findScaleDegreeMapping,
  getMusicKeys,
  UI_NAVIGATION_KEYS,
  isInputElement,
} from '@/lib/keyboard-mappings';
import { getAudioEngine } from '@/lib/audio-engine';
import { generateScale, buildChordFromDegree } from '@/lib/theory-engine';
import type { Note, ModeName } from '@/lib/types';

/**
 * Custom hook for handling computer keyboard input for piano playing
 * - Uses scale degree mapping (1-7) which is musical and intuitive
 * - Smart key filtering (only captures music keys, not UI navigation)
 * - Alt modifier for chord playing
 * - Respects input fields and allows normal typing
 */
export function useKeyboardPiano() {
  const {
    keyboardEnabled,
    keyboardLayout,
    keyboardOctaveOffset,
    keyboardVelocity,
    sustainPedal,
    currentOctave,
    currentMode,
    currentRoot,
    addActiveNote,
    removeActiveNote,
    addActiveComputerKey,
    removeActiveComputerKey,
    clearActiveComputerKeys,
    toggleKeyboard,
    toggleKeyboardOverlay,
    setSustainPedal,
    setMode,
    addNoteTrail,
  } = useStore();

  const audioEngine = getAudioEngine();

  // Track which keys are currently pressed to prevent repeat
  const pressedKeys = useRef<Set<string>>(new Set());

  // Track which MIDI notes are sustained by pedal (with note objects for release)
  const sustainedNotes = useRef<Map<number, Note>>(new Map());

  // Track which MIDI notes are held by key press (with note objects for release)
  const heldNotes = useRef<Map<number, Note>>(new Map());

  // Track which notes were played by each key (for proper cleanup on release)
  // Maps computer key -> Set of MIDI numbers it triggered
  const keyToNotes = useRef<Map<string, Set<number>>>(new Map());

  /**
   * Play a note from a scale degree
   * Returns the Set of MIDI numbers that were played
   */
  const playScaleDegree = useCallback(
    (scaleDegree: number, octaveOffset: number, isChord: boolean = false, computerKey?: string): Set<number> => {
      const playedNotes = new Set<number>();

      if (!audioEngine.initialized) return playedNotes;

      const targetOctave = currentOctave + octaveOffset;

      if (isChord) {
        // Play chord for this scale degree
        const chord = buildChordFromDegree(currentRoot, currentMode, scaleDegree, targetOctave);
        if (chord) {
          // Add all chord notes to active notes
          chord.notes.forEach(note => {
            playedNotes.add(note.midiNumber);

            if (sustainPedal) {
              // With sustain pedal, allow re-triggering for natural piano resonance
              // Each strike adds to the sustained sound, just like a real piano
              audioEngine.attackNote(note);
              sustainedNotes.current.set(note.midiNumber, note);
              addNoteTrail(note.midiNumber, 'keyboard', true);
            } else {
              // Natural sustain - hold note until key release
              if (!heldNotes.current.has(note.midiNumber)) {
                audioEngine.attackNote(note);
                heldNotes.current.set(note.midiNumber, note);
              }
              addNoteTrail(note.midiNumber, 'keyboard', true); // Always trail in non-sustain mode
            }
            addActiveNote(note.midiNumber);
          });
        }
      } else {
        // Play single note
        const scale = generateScale(currentRoot, currentMode, targetOctave);
        const noteIndex = scaleDegree - 1; // Convert to 0-indexed

        if (noteIndex >= 0 && noteIndex < scale.notes.length) {
          const note = scale.notes[noteIndex];
          const velocity = keyboardVelocity / 127;

          playedNotes.add(note.midiNumber);

          if (sustainPedal) {
            // With sustain pedal, allow re-triggering for natural piano resonance
            // Each strike adds to the sustained sound, just like a real piano
            audioEngine.attackNote(note);
            sustainedNotes.current.set(note.midiNumber, note);
            addNoteTrail(note.midiNumber, 'keyboard', false);
          } else {
            // Natural sustain - hold note until key release
            if (!heldNotes.current.has(note.midiNumber)) {
              audioEngine.attackNote(note);
              heldNotes.current.set(note.midiNumber, note);
            }
            addNoteTrail(note.midiNumber, 'keyboard', false); // Always trail in non-sustain mode
          }

          addActiveNote(note.midiNumber);
        }
      }

      // Track which notes this computer key triggered
      if (computerKey && playedNotes.size > 0) {
        keyToNotes.current.set(computerKey, playedNotes);
      }

      return playedNotes;
    },
    [
      audioEngine,
      currentOctave,
      currentMode,
      currentRoot,
      keyboardVelocity,
      sustainPedal,
      addActiveNote,
      removeActiveNote,
      addNoteTrail,
    ]
  );

  /**
   * Stop notes for a scale degree
   * Now properly handles all notes played by a key (single note or chord)
   */
  const stopScaleDegree = useCallback(
    (scaleDegree: number, octaveOffset: number, computerKey?: string) => {
      // If we have tracking for this key, use it to release all associated notes
      if (computerKey && keyToNotes.current.has(computerKey)) {
        const notesToRelease = keyToNotes.current.get(computerKey)!;
        let anySustained = false;

        notesToRelease.forEach(midiNumber => {
          // If note is sustained by pedal, don't release it yet
          if (sustainedNotes.current.has(midiNumber)) {
            // Keep in active notes but don't release sound
            anySustained = true;
            return;
          }

          // Release held notes
          if (heldNotes.current.has(midiNumber)) {
            const note = heldNotes.current.get(midiNumber)!;
            audioEngine.releaseNote(note);
            heldNotes.current.delete(midiNumber);
          }

          // Remove visual feedback
          removeActiveNote(midiNumber);
        });

        // Only clean up the tracking if NO notes are sustained
        // This prevents orphaned notes when the same key is pressed multiple times
        if (!anySustained) {
          keyToNotes.current.delete(computerKey);
        }
        return;
      }

      // Fallback to old behavior if no tracking available
      const targetOctave = currentOctave + octaveOffset;
      const scale = generateScale(currentRoot, currentMode, targetOctave);
      const noteIndex = scaleDegree - 1;

      if (noteIndex >= 0 && noteIndex < scale.notes.length) {
        const note = scale.notes[noteIndex];

        // If note is sustained by pedal, don't release it yet
        if (sustainedNotes.current.has(note.midiNumber)) {
          // Keep in active notes but don't release sound
          return;
        }

        // Release held note
        if (heldNotes.current.has(note.midiNumber)) {
          audioEngine.releaseNote(note);
          heldNotes.current.delete(note.midiNumber);
        }

        // Remove visual feedback
        removeActiveNote(note.midiNumber);
      }
    },
    [currentOctave, currentMode, currentRoot, removeActiveNote, audioEngine]
  );

  /**
   * Helper to convert event.code to a letter key (handles Alt/Shift modifiers)
   * e.g., 'KeyA' -> 'a', 'Digit1' -> '1'
   */
  const codeToKey = (code: string): string | null => {
    // Handle letter keys (KeyA -> a)
    if (code.startsWith('Key')) {
      return code.slice(3).toLowerCase();
    }
    // Handle digit keys (Digit1 -> 1)
    if (code.startsWith('Digit')) {
      return code.slice(5);
    }
    // Handle special keys
    if (code === 'Comma') return ',';
    if (code === 'Space') return ' ';
    return null;
  };

  /**
   * Handle key down event
   */
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();

      // ALWAYS allow UI navigation keys to pass through
      if (UI_NAVIGATION_KEYS.has(event.key)) {
        return; // Don't prevent default!
      }

      // Check if focus is in an input field - allow normal typing
      if (isInputElement(document.activeElement)) {
        return; // Let them type!
      }

      const layout = getKeyboardLayout(keyboardLayout);

      // Handle global toggle (backtick) - works even when disabled
      if (key === layout.toggleKey) {
        event.preventDefault();

        // If enabling keyboard mode, initialize audio engine
        if (!keyboardEnabled && !audioEngine.initialized) {
          audioEngine.initialize().catch(err => {
            console.error('Failed to initialize audio:', err);
          });
        }

        toggleKeyboard();
        return;
      }

      // Handle help overlay with Ctrl/Cmd + /
      if ((event.ctrlKey || event.metaKey) && key === layout.helpKey) {
        event.preventDefault();
        toggleKeyboardOverlay();
        return;
      }

      // Handle mode switching with Shift+number (works even when keyboard disabled)
      // Use event.code to handle Shift modifier correctly (Shift+1 produces '!' in event.key)
      if (event.shiftKey && event.code.startsWith('Digit')) {
        const digit = event.code.slice(5); // Extract '1' from 'Digit1'
        if (digit >= '1' && digit <= '7') {
          event.preventDefault();
          const modeIndex = parseInt(digit) - 1;
          const modes: ModeName[] = ['ionian', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'aeolian', 'locrian'];
          setMode(modes[modeIndex]);
          return;
        }
      }

      // Only process music keys when keyboard mode is enabled
      if (!keyboardEnabled) {
        return;
      }

      // Prevent key repeat
      if (pressedKeys.current.has(key)) {
        return;
      }

      // Handle sustain pedal
      if (key === layout.sustainKey) {
        event.preventDefault();
        audioEngine.enableSustain();
        setSustainPedal(true);
        return;
      }

      // Try to find a scale degree mapping for this key
      // Use event.code when Alt is pressed to handle special characters on Mac
      const lookupKey = event.altKey ? codeToKey(event.code) || key : key;
      const mapping = findScaleDegreeMapping(lookupKey, layout);

      if (mapping) {
        event.preventDefault();

        // Mark key as pressed (use the actual key from mapping)
        pressedKeys.current.add(mapping.key);
        addActiveComputerKey(mapping.key);

        // Check if Alt is held for chord playing
        const isChord = event.altKey;

        // Play the scale degree and track the notes
        playScaleDegree(mapping.scaleDegree, mapping.octaveOffset, isChord, mapping.key);
      }
    },
    [
      keyboardEnabled,
      keyboardLayout,
      keyboardVelocity,
      playScaleDegree,
      toggleKeyboard,
      toggleKeyboardOverlay,
      setSustainPedal,
      addActiveComputerKey,
      setMode,
      audioEngine,
    ]
  );

  /**
   * Handle key up event
   */
  const handleKeyUp = useCallback(
    (event: KeyboardEvent) => {
      if (!keyboardEnabled) return;

      const key = event.key.toLowerCase();
      const layout = getKeyboardLayout(keyboardLayout);

      // Handle sustain pedal release
      if (key === layout.sustainKey) {
        event.preventDefault();
        audioEngine.disableSustain();
        setSustainPedal(false);

        // Release all sustained notes
        sustainedNotes.current.forEach((note, midiNumber) => {
          audioEngine.releaseNote(note);
          removeActiveNote(midiNumber);
        });
        sustainedNotes.current.clear();

        // Note: We don't clear keyToNotes here because individual keys
        // will be released when the user releases them, and that cleanup
        // happens in stopScaleDegree
        return;
      }

      // Try to find a mapping
      // Use event.code when Alt was pressed to handle special characters on Mac
      const lookupKey = event.altKey ? codeToKey(event.code) || key : key;
      const mapping = findScaleDegreeMapping(lookupKey, layout);

      if (mapping) {
        event.preventDefault();

        // Remove from pressed keys (use the actual key from mapping)
        pressedKeys.current.delete(mapping.key);
        removeActiveComputerKey(mapping.key);

        // Stop the note(s) - pass the key for proper cleanup
        stopScaleDegree(mapping.scaleDegree, mapping.octaveOffset, mapping.key);
      }
    },
    [
      keyboardEnabled,
      keyboardLayout,
      stopScaleDegree,
      setSustainPedal,
      removeActiveNote,
      removeActiveComputerKey,
      audioEngine,
    ]
  );

  /**
   * Handle window blur (release all keys)
   */
  const handleBlur = useCallback(() => {
    if (!keyboardEnabled) return;

    // Restore normal envelope
    audioEngine.disableSustain();

    // Release all sustained notes properly
    sustainedNotes.current.forEach((note, midiNumber) => {
      audioEngine.releaseNote(note);
      removeActiveNote(midiNumber);
    });

    // Release all held notes properly
    heldNotes.current.forEach((note, midiNumber) => {
      audioEngine.releaseNote(note);
      removeActiveNote(midiNumber);
    });

    // Release all pressed keys
    pressedKeys.current.clear();
    sustainedNotes.current.clear();
    heldNotes.current.clear();
    keyToNotes.current.clear();
    clearActiveComputerKeys();
  }, [keyboardEnabled, clearActiveComputerKeys, audioEngine, removeActiveNote]);

  /**
   * Set up event listeners
   */
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [handleKeyDown, handleKeyUp, handleBlur]);

  /**
   * Clean up when keyboard is disabled
   */
  useEffect(() => {
    if (!keyboardEnabled) {
      // Restore normal envelope
      audioEngine.disableSustain();

      // Release all sustained notes properly
      sustainedNotes.current.forEach((note) => {
        audioEngine.releaseNote(note);
      });

      // Release all held notes properly
      heldNotes.current.forEach((note) => {
        audioEngine.releaseNote(note);
      });

      pressedKeys.current.clear();
      sustainedNotes.current.clear();
      heldNotes.current.clear();
      keyToNotes.current.clear();
      clearActiveComputerKeys();
    }
  }, [keyboardEnabled, clearActiveComputerKeys, audioEngine]);

  return {
    keyboardEnabled,
    pressedKeys: pressedKeys.current,
  };
}
