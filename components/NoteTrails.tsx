'use client';

import { useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/lib/store';

export function NoteTrails() {
  const { noteTrails, clearOldTrails, sustainPedal } = useStore();

  // Periodically clean up old trails
  useEffect(() => {
    const interval = setInterval(clearOldTrails, 100);
    return () => clearInterval(interval);
  }, [clearOldTrails]);

  // Calculate piano key position based on MIDI number
  const getPianoKeyPosition = (midiNumber: number) => {
    // Piano keyboard starts at MIDI 48 (C3), spans 2 octaves (14 white keys)
    // White keys are 40px wide
    const startMidiNumber = 48; // C3
    const whiteKeyWidth = 40;
    const numOctaves = 2;
    const totalWhiteKeys = numOctaves * 7; // 14 white keys
    const totalKeyboardWidth = totalWhiteKeys * whiteKeyWidth; // 560px

    // Calculate which white key this is (C, D, E, F, G, A, B pattern)
    const relativeNote = (midiNumber - startMidiNumber) % 12;
    const octaveOffset = Math.floor((midiNumber - startMidiNumber) / 12);

    // Count white keys before this note
    const whiteKeysPerOctave = 7;
    const whiteKeyPositions = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6]; // Position of each chromatic note
    const whiteKeyIndex = whiteKeyPositions[relativeNote] + (octaveOffset * whiteKeysPerOctave);

    // Center the piano keyboard in the viewport
    const keyboardCenterOffset = totalKeyboardWidth / 2; // Half of total width
    const x = window.innerWidth / 2 + (whiteKeyIndex * whiteKeyWidth) - keyboardCenterOffset + (whiteKeyWidth / 2);
    const y = window.innerHeight * 0.55; // Approximate piano position

    return { x, y };
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-20">
      <AnimatePresence>
        {noteTrails.map((trail) => {
          const targetPosition = getPianoKeyPosition(trail.midiNumber);

          // Get the actual piano keyboard container position
          const pianoContainer = document.querySelector('.piano-keyboard');
          let belowPianoSource = {
            x: window.innerWidth / 2,
            y: window.innerHeight * 0.70,
          };

          if (pianoContainer) {
            const rect = pianoContainer.getBoundingClientRect();
            belowPianoSource = {
              x: rect.left + rect.width / 2,  // Center of the container
              y: rect.bottom - 40,             // Near bottom of the container
            };
          }

          const sourcePosition = trail.sourcePosition || belowPianoSource;

          // Color based on sustain and trail type
          // Yellow-based color scheme for high visibility
          const baseColor = sustainPedal
            ? '#84cc16' // Bright lime-green for sustained notes
            : trail.isChord
              ? '#f97316' // Bright orange for chords
              : '#fbbf24'; // Bright yellow for single notes

          return (
            <motion.div
              key={trail.id}
              className="absolute"
              style={{
                left: sourcePosition.x,
                top: sourcePosition.y,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Animated beam/trail from source to target */}
              <motion.svg
                className="absolute"
                width={Math.abs(targetPosition.x - sourcePosition.x) + 100}
                height={Math.abs(targetPosition.y - sourcePosition.y) + 100}
                style={{
                  left: -50,
                  top: -50,
                }}
              >
                <motion.line
                  x1="50"
                  y1="50"
                  x2={targetPosition.x - sourcePosition.x + 50}
                  y2={targetPosition.y - sourcePosition.y + 50}
                  stroke={baseColor}
                  strokeWidth={trail.isChord ? "4" : "2"}
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0.8 }}
                  animate={{ pathLength: 1, opacity: 0 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
              </motion.svg>

              {/* Particle that travels from source to target */}
              <motion.div
                className="absolute w-3 h-3 rounded-full"
                style={{
                  backgroundColor: baseColor,
                  boxShadow: `0 0 ${trail.isChord ? 20 : 10}px ${baseColor}`,
                }}
                animate={{
                  x: targetPosition.x - sourcePosition.x,
                  y: targetPosition.y - sourcePosition.y,
                  scale: trail.isChord ? [1, 1.5, 0.5] : [1, 1.2, 0.3],
                }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />

              {/* Burst at target location */}
              <motion.div
                className="absolute"
                style={{
                  left: targetPosition.x - sourcePosition.x,
                  top: targetPosition.y - sourcePosition.y,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                {/* Expanding ring */}
                <motion.div
                  className="absolute rounded-full"
                  style={{
                    width: trail.isChord ? 80 : 60,
                    height: trail.isChord ? 80 : 60,
                    left: trail.isChord ? -40 : -30,
                    top: trail.isChord ? -40 : -30,
                    border: `${trail.isChord ? 3 : 2}px solid ${baseColor}`,
                  }}
                  animate={{
                    scale: [0.5, 2],
                    opacity: [0.8, 0],
                  }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />

                {/* Particle burst - more for chords */}
                {[...Array(trail.isChord ? 12 : 6)].map((_, i) => {
                  const angle = (i / (trail.isChord ? 12 : 6)) * Math.PI * 2;
                  const distance = trail.isChord ? 80 : 60;
                  const x = Math.cos(angle) * distance;
                  const y = Math.sin(angle) * distance;

                  return (
                    <motion.div
                      key={i}
                      className="absolute rounded-full"
                      style={{
                        width: trail.isChord ? 4 : 2,
                        height: trail.isChord ? 4 : 2,
                        left: -2,
                        top: -2,
                        backgroundColor: baseColor,
                      }}
                      animate={{
                        x: [0, x],
                        y: [0, y],
                        opacity: [0.8, 0],
                        scale: [1, 0.3],
                      }}
                      transition={{
                        duration: 0.5,
                        delay: i * 0.02,
                        ease: 'easeOut',
                      }}
                    />
                  );
                })}

                {/* Center glow */}
                <motion.div
                  className="absolute rounded-full"
                  style={{
                    width: trail.isChord ? 40 : 30,
                    height: trail.isChord ? 40 : 30,
                    left: trail.isChord ? -20 : -15,
                    top: trail.isChord ? -20 : -15,
                    backgroundColor: baseColor,
                    filter: 'blur(15px)',
                  }}
                  animate={{
                    scale: [1, 2.5],
                    opacity: [0.7, 0],
                  }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
              </motion.div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
