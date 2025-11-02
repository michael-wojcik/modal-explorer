'use client';

import React, { useEffect, useMemo, useCallback } from 'react';
import { PianoKey } from './PianoKey';
import { useStore } from '@/lib/store';
import { generateScale } from '@/lib/theory-engine';
import { getChromaticScale, createNote } from '@/lib/notes';
import { getMode } from '@/lib/modes';
import { getAudioEngine } from '@/lib/audio-engine';
import { useKeyboardPiano } from '@/hooks/useKeyboardPiano';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useSwipeGesture } from '@/hooks/useSwipeGesture';
import { hapticLight, hapticMedium } from '@/lib/haptics';
import type { Note } from '@/lib/types';

interface PianoKeyboardProps {
  startOctave?: number;
  numOctaves?: number;
}

export function PianoKeyboard({ startOctave = 3, numOctaves = 2 }: PianoKeyboardProps) {
  const {
    currentMode,
    currentRoot,
    currentOctave,
    activeNotes,
    hoveredNote,
    addActiveNote,
    removeActiveNote,
    setHoveredNote,
    setOctave,
    keyboardEnabled,
    keyboardLabelsOnPiano,
    addNoteTrail,
  } = useStore();

  const audioEngine = getAudioEngine();
  const isMobile = useIsMobile();

  // Swipe gesture handlers for octave navigation (mobile only)
  const handleSwipeUp = () => {
    // Swipe up = increase octave (higher pitch)
    if (currentOctave < 6) {
      setOctave(currentOctave + 1);
      hapticMedium();
    }
  };

  const handleSwipeDown = () => {
    // Swipe down = decrease octave (lower pitch)
    if (currentOctave > 2) {
      setOctave(currentOctave - 1);
      hapticMedium();
    }
  };

  const { ref: swipeRef } = useSwipeGesture<HTMLDivElement>({
    onSwipeUp: isMobile ? handleSwipeUp : undefined,
    onSwipeDown: isMobile ? handleSwipeDown : undefined,
    minSwipeDistance: 60,
    preventScroll: false,
  });

  // Center the piano keyboard horizontally on initial load
  useEffect(() => {
    if (swipeRef.current) {
      const container = swipeRef.current;
      const scrollCenter = (container.scrollWidth - container.clientWidth) / 2;
      container.scrollLeft = scrollCenter;
    }
  }, [swipeRef, allNotes.length]); // Re-center when octave/notes change

  // Responsive key dimensions - larger on mobile for better touch targets
  const whiteKeyWidth = isMobile ? 50 : 40;
  const whiteKeyHeight = isMobile ? 180 : 160;
  const blackKeyWidth = isMobile ? 30 : 24;

  // Initialize keyboard controls
  useKeyboardPiano();

  // Initialize audio engine on first user interaction
  useEffect(() => {
    const initAudio = async () => {
      if (!audioEngine.initialized) {
        try {
          await audioEngine.initialize();
        } catch (error) {
          console.error('Failed to initialize audio:', error);
        }
      }
    };

    // Initialize on any click
    document.addEventListener('click', initAudio, { once: true });
    return () => document.removeEventListener('click', initAudio);
  }, [audioEngine]);

  // Get current mode data
  const mode = getMode(currentMode);

  // Use currentOctave from store instead of startOctave prop for swipe navigation
  const displayOctave = currentOctave - 1; // Display one octave below and one above current

  // Generate scale notes for highlighting
  const scaleNotes = useMemo(() => {
    const scales: Note[] = [];
    for (let i = 0; i < numOctaves; i++) {
      const scale = generateScale(currentRoot, currentMode, displayOctave + i);
      scales.push(...scale.notes);
    }
    // Add root note of next octave
    scales.push(createNote(currentRoot, displayOctave + numOctaves));
    return scales;
  }, [currentRoot, currentMode, displayOctave, numOctaves]);

  // Generate all chromatic notes across octaves
  const allNotes = useMemo(() => {
    const notes: Note[] = [];
    for (let octave = displayOctave; octave < displayOctave + numOctaves; octave++) {
      const chromaticScale = getChromaticScale('C', octave);
      notes.push(...chromaticScale);
    }
    // Add final C for completion
    notes.push(createNote('C', displayOctave + numOctaves));
    return notes;
  }, [displayOctave, numOctaves]);

  // Get characteristic notes (scale degrees that define the mode)
  const characteristicMidiNumbers = useMemo(() => {
    const numbers = new Set<number>();
    mode.characteristicNotes.forEach(degree => {
      scaleNotes.forEach(note => {
        const scaleIndex = scaleNotes.findIndex(n => n.midiNumber === note.midiNumber);
        if (scaleIndex % 7 === degree - 1) {
          numbers.add(note.midiNumber);
        }
      });
    });
    return numbers;
  }, [mode, scaleNotes]);

  // Check if a note is black key
  const isBlackKey = (noteName: string) => {
    return noteName.includes('#');
  };

  // Check if note is in current scale
  const isNoteInScale = (note: Note) => {
    return scaleNotes.some(scaleNote =>
      scaleNote.midiNumber % 12 === note.midiNumber % 12
    );
  };

  // Check if note is the root
  const isRootNote = (note: Note) => {
    return note.name === currentRoot && isNoteInScale(note);
  };

  // Check if note is a characteristic note
  const isCharacteristicNote = (note: Note) => {
    return characteristicMidiNumbers.has(note.midiNumber) && isNoteInScale(note);
  };

  // Handle note click (supports both mouse and touch via pointer events)
  const handleNoteClick = useCallback((note: Note, event?: React.PointerEvent) => {
    if (!audioEngine.initialized) return;

    // Haptic feedback for touch interactions
    if (event?.pointerType === 'touch') {
      hapticLight();
    }

    addActiveNote(note.midiNumber);

    // Track pointer position for animation
    const sourcePosition = event
      ? { x: event.clientX, y: event.clientY }
      : undefined;

    addNoteTrail(note.midiNumber, 'mouse', false, sourcePosition);
    audioEngine.playNote(note, '8n');

    // Remove from active after duration
    setTimeout(() => {
      removeActiveNote(note.midiNumber);
    }, 500);
  }, [audioEngine, addActiveNote, removeActiveNote, addNoteTrail]);

  // Get scale degree label for a piano note (if in current scale)
  const getKeyboardLabel = (note: Note): string | null => {
    // Hide keyboard labels to avoid blocking note names
    return null;
  };

  // Calculate keyboard layout
  const { whiteKeys, blackKeys } = useMemo(() => {
    const white: Note[] = [];
    const black: Note[] = [];

    allNotes.forEach(note => {
      if (isBlackKey(note.name)) {
        black.push(note);
      } else {
        white.push(note);
      }
    });

    return { whiteKeys: white, blackKeys: black };
  }, [allNotes]);

  // Calculate black key positions
  const getBlackKeyX = (note: Note): number => {
    // Find the previous white key
    const whiteKeysBefore = whiteKeys.filter(wk => wk.midiNumber < note.midiNumber).length;

    // Offset patterns for black keys relative to white keys
    const blackKeyOffset = whiteKeyWidth - blackKeyWidth / 2;

    return whiteKeysBefore * whiteKeyWidth + blackKeyOffset;
  };

  const totalWidth = whiteKeys.length * whiteKeyWidth;
  const totalHeight = whiteKeyHeight;

  return (
    <div ref={swipeRef} className="relative w-full overflow-x-auto py-8 -mx-4 px-4 scrollbar-hide flex justify-center">
      <svg
        width={totalWidth}
        height={totalHeight + 20}
        className="drop-shadow-lg"
      >
        {/* White keys */}
        <g>
          {whiteKeys.map((note, index) => (
            <g key={note.midiNumber} transform={`translate(${index * whiteKeyWidth}, 0)`}>
              <PianoKey
                note={note}
                isBlack={false}
                isInScale={isNoteInScale(note)}
                isActive={activeNotes.has(note.midiNumber)}
                isHovered={hoveredNote === note.midiNumber}
                isRoot={isRootNote(note)}
                isCharacteristic={isCharacteristicNote(note)}
                scaleColor={mode.color}
                keyboardLabel={getKeyboardLabel(note)}
                onClick={(e: React.PointerEvent) => handleNoteClick(note, e)}
                onMouseEnter={() => setHoveredNote(note.midiNumber)}
                onMouseLeave={() => setHoveredNote(null)}
              />
            </g>
          ))}
        </g>

        {/* Black keys (rendered on top) */}
        <g>
          {blackKeys.map(note => (
            <g key={note.midiNumber} transform={`translate(${getBlackKeyX(note)}, 0)`}>
              <PianoKey
                note={note}
                isBlack={true}
                isInScale={isNoteInScale(note)}
                isActive={activeNotes.has(note.midiNumber)}
                isHovered={hoveredNote === note.midiNumber}
                isRoot={isRootNote(note)}
                isCharacteristic={isCharacteristicNote(note)}
                scaleColor={mode.color}
                keyboardLabel={getKeyboardLabel(note)}
                onClick={(e: React.PointerEvent) => handleNoteClick(note, e)}
                onMouseEnter={() => setHoveredNote(note.midiNumber)}
                onMouseLeave={() => setHoveredNote(null)}
              />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
