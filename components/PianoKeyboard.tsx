'use client';

import React, { useEffect, useMemo } from 'react';
import { PianoKey } from './PianoKey';
import { useStore } from '@/lib/store';
import { generateScale } from '@/lib/theory-engine';
import { getChromaticScale, createNote } from '@/lib/notes';
import { getMode } from '@/lib/modes';
import { getAudioEngine } from '@/lib/audio-engine';
import { useKeyboardPiano } from '@/hooks/useKeyboardPiano';
import type { Note } from '@/lib/types';

interface PianoKeyboardProps {
  startOctave?: number;
  numOctaves?: number;
}

export function PianoKeyboard({ startOctave = 3, numOctaves = 2 }: PianoKeyboardProps) {
  const {
    currentMode,
    currentRoot,
    activeNotes,
    hoveredNote,
    addActiveNote,
    removeActiveNote,
    setHoveredNote,
    keyboardEnabled,
    keyboardLabelsOnPiano,
    addNoteTrail,
  } = useStore();

  const audioEngine = getAudioEngine();

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

  // Generate scale notes for highlighting
  const scaleNotes = useMemo(() => {
    const scales: Note[] = [];
    for (let i = 0; i < numOctaves; i++) {
      const scale = generateScale(currentRoot, currentMode, startOctave + i);
      scales.push(...scale.notes);
    }
    // Add root note of next octave
    scales.push(createNote(currentRoot, startOctave + numOctaves));
    return scales;
  }, [currentRoot, currentMode, startOctave, numOctaves]);

  // Generate all chromatic notes across octaves
  const allNotes = useMemo(() => {
    const notes: Note[] = [];
    for (let octave = startOctave; octave < startOctave + numOctaves; octave++) {
      const chromaticScale = getChromaticScale('C', octave);
      notes.push(...chromaticScale);
    }
    // Add final C for completion
    notes.push(createNote('C', startOctave + numOctaves));
    return notes;
  }, [startOctave, numOctaves]);

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

  // Handle note click
  const handleNoteClick = (note: Note, event?: React.MouseEvent) => {
    if (!audioEngine.initialized) return;

    addActiveNote(note.midiNumber);

    // Track mouse position for animation
    const sourcePosition = event
      ? { x: event.clientX, y: event.clientY }
      : undefined;

    addNoteTrail(note.midiNumber, 'mouse', false, sourcePosition);
    audioEngine.playNote(note, '8n');

    // Remove from active after duration
    setTimeout(() => {
      removeActiveNote(note.midiNumber);
    }, 500);
  };

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
    const whiteKeyWidth = 40;
    const blackKeyWidth = 24;

    // Find the previous white key
    const whiteKeysBefore = whiteKeys.filter(wk => wk.midiNumber < note.midiNumber).length;

    // Offset patterns for black keys relative to white keys
    const blackKeyOffset = whiteKeyWidth - blackKeyWidth / 2;

    return whiteKeysBefore * whiteKeyWidth + blackKeyOffset;
  };

  const totalWidth = whiteKeys.length * 40;
  const totalHeight = 160;

  return (
    <div className="relative w-full flex justify-center py-8">
      <svg
        width={totalWidth}
        height={totalHeight + 20}
        className="drop-shadow-lg"
        style={{ maxWidth: '100%' }}
      >
        {/* White keys */}
        <g>
          {whiteKeys.map((note, index) => (
            <g key={note.midiNumber} transform={`translate(${index * 40}, 0)`}>
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
                onClick={(e: React.MouseEvent) => handleNoteClick(note, e)}
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
                onClick={(e: React.MouseEvent) => handleNoteClick(note, e)}
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
