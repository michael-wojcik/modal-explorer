'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music2 } from 'lucide-react';
import { useStore } from '@/lib/store';

export function ChordRecognition() {
  const { activeNotes } = useStore();

  // Recognize chord from active notes
  const chordInfo = useMemo(() => {
    if (activeNotes.size === 0) return null;

    const midiNumbers = Array.from(activeNotes).sort((a, b) => a - b);
    if (midiNumbers.length < 2) return null;

    // Get note names (0-11 for C-B)
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const chromas = midiNumbers.map(midi => midi % 12);
    const uniqueChromas = [...new Set(chromas)].sort((a, b) => a - b);

    if (uniqueChromas.length < 2) return null;

    // Calculate intervals from root
    const root = uniqueChromas[0];
    const intervals = uniqueChromas.map(chroma => (chroma - root + 12) % 12);

    // Simple chord recognition
    const intervalsStr = intervals.join(',');
    let quality = '';
    let symbol = '';

    // Common triads and seventh chords
    const chordPatterns: Record<string, { quality: string; symbol: string }> = {
      '0,4,7': { quality: 'Major', symbol: '' },
      '0,3,7': { quality: 'Minor', symbol: 'm' },
      '0,3,6': { quality: 'Diminished', symbol: '°' },
      '0,4,8': { quality: 'Augmented', symbol: '+' },
      '0,4,7,10': { quality: 'Dominant 7th', symbol: '7' },
      '0,4,7,11': { quality: 'Major 7th', symbol: 'maj7' },
      '0,3,7,10': { quality: 'Minor 7th', symbol: 'm7' },
      '0,3,6,10': { quality: 'Half-Diminished 7th', symbol: 'ø7' },
      '0,3,6,9': { quality: 'Diminished 7th', symbol: '°7' },
      '0,4,7,9': { quality: 'Major 6th', symbol: '6' },
      '0,3,7,9': { quality: 'Minor 6th', symbol: 'm6' },
      '0,2,7': { quality: 'Suspended 2nd', symbol: 'sus2' },
      '0,5,7': { quality: 'Suspended 4th', symbol: 'sus4' },
    };

    const match = chordPatterns[intervalsStr];
    if (match) {
      quality = match.quality;
      symbol = match.symbol;
    } else {
      // Generic description
      quality = `${uniqueChromas.length}-note chord`;
      symbol = '';
    }

    const rootName = noteNames[root];
    const chordSymbol = `${rootName}${symbol}`;

    return {
      symbol: chordSymbol,
      quality,
      noteCount: uniqueChromas.length,
      root: rootName,
    };
  }, [activeNotes]);

  return (
    <AnimatePresence>
      {chordInfo && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-40"
        >
          <div className="bg-gradient-to-br from-purple-600 to-blue-600 text-white px-8 py-4 rounded-2xl shadow-2xl border border-purple-300/30 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <Music2 className="w-6 h-6" />
              </motion.div>

              <div>
                <div className="text-3xl font-bold tracking-wide">
                  {chordInfo.symbol}
                </div>
                <div className="text-xs text-purple-200 mt-1">
                  {chordInfo.quality}
                </div>
              </div>

              {/* Pulse effect */}
              <motion.div
                className="absolute inset-0 rounded-2xl border-2 border-purple-300"
                animate={{
                  opacity: [0.5, 0, 0.5],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
