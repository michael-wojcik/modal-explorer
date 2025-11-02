'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play } from 'lucide-react';
import { useStore } from '@/lib/store';
import { generateDiatonicChords, formatChordName } from '@/lib/theory-engine';
import { getAudioEngine } from '@/lib/audio-engine';
import type { ChordInstance } from '@/lib/types';

export function ChordDisplay() {
  const { currentMode, currentRoot, currentOctave, playingProgressionIndex } = useStore();
  const [playingChordIndex, setPlayingChordIndex] = useState<number | null>(null);
  const audioEngine = getAudioEngine();

  const chords = useMemo(() => {
    return generateDiatonicChords(currentRoot, currentMode, currentOctave);
  }, [currentRoot, currentMode, currentOctave]);

  const handlePlayChord = async (chord: ChordInstance, index: number) => {
    if (!audioEngine.initialized) {
      await audioEngine.initialize();
    }

    setPlayingChordIndex(index);
    audioEngine.playChord(chord.notes, '2n');

    setTimeout(() => {
      setPlayingChordIndex(null);
    }, 1500);
  };

  const getFunctionColor = (func?: string) => {
    switch (func) {
      case 'tonic':
        return 'bg-green-500/20 border-green-500/50 text-green-300';
      case 'subdominant':
        return 'bg-blue-500/20 border-blue-500/50 text-blue-300';
      case 'dominant':
        return 'bg-red-500/20 border-red-500/50 text-red-300';
      default:
        return 'bg-gray-500/20 border-gray-500/50 text-gray-300';
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-3 md:p-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <h3 className="text-lg font-semibold text-white">Diatonic Chords</h3>
        <div className="flex flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-green-500/50" />
            <span className="text-gray-400">Tonic</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-blue-500/50" />
            <span className="text-gray-400">Subdominant</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-red-500/50" />
            <span className="text-gray-400">Dominant</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 relative">
        <AnimatePresence mode="popLayout">
          {chords.map((chord, index) => {
            const chordName = formatChordName(chord.root.name, chord.quality);
            const isPlaying = playingChordIndex === index;
            const isInProgression = playingProgressionIndex === index;

            return (
              <motion.button
                key={`${chord.root.name}-${index}`}
                onClick={() => handlePlayChord(chord, index)}
                className={`
                  relative p-4 rounded-lg border transition-all min-h-[120px]
                  ${getFunctionColor(chord.function)}
                  ${(isPlaying || isInProgression) ? 'ring-2 ring-white scale-105' : 'hover:scale-102'}
                `}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: (isPlaying || isInProgression) ? 1.05 : 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Roman Numeral */}
                <div className="text-2xl font-bold mb-1">
                  {chord.romanNumeral}
                </div>

                {/* Chord Name */}
                <div className="text-sm font-medium mb-2">
                  {chordName}
                </div>

                {/* Function */}
                {chord.function && (
                  <div className="text-xs opacity-75 capitalize">
                    {chord.function}
                  </div>
                )}

                {/* Play Icon */}
                <div className="absolute top-2 right-2">
                  {isPlaying ? (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 0.6 }}
                    >
                      <Play className="w-4 h-4 fill-current" />
                    </motion.div>
                  ) : (
                    <Play className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>

                {/* Notes */}
                <div className="text-xs opacity-60 mt-2">
                  {chord.notes.map(n => n.name).join(' - ')}
                </div>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Info */}
      <div className="mt-4 p-[0.5rem] bg-gray-900/50 rounded border border-gray-700">
        <p className="text-xs text-gray-400">
          Click any chord to hear it. These are the naturally occurring chords when you harmonize
          the <span className="text-white font-medium">{currentMode}</span> mode in{' '}
          <span className="text-white font-medium">{currentRoot}</span>.
        </p>
      </div>
    </div>
  );
}
