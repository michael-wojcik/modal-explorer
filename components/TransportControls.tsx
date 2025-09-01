'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Music2, Volume2, Keyboard } from 'lucide-react';
import { useStore } from '@/lib/store';
import { NOTE_NAMES } from '@/lib/notes';
import { generateScale, generateDiatonicChords } from '@/lib/theory-engine';
import { getAudioEngine } from '@/lib/audio-engine';

export function TransportControls() {
  const {
    currentMode,
    currentRoot,
    currentOctave,
    tempo,
    volume,
    isPlaying,
    keyboardEnabled,
    setRoot,
    setOctave,
    setTempo,
    setVolume,
    setIsPlaying,
    toggleKeyboard,
    setPlayingProgressionIndex,
  } = useStore();

  const [playDirection, setPlayDirection] = useState<'ascending' | 'descending' | 'both'>('ascending');
  const audioEngine = getAudioEngine();

  const handlePlayScale = async () => {
    if (!audioEngine.initialized) {
      await audioEngine.initialize();
    }

    setIsPlaying(true);

    try {
      const scale = generateScale(currentRoot, currentMode, currentOctave);
      // Add root note one octave higher
      const scaleWithOctave = [...scale.notes, { ...scale.notes[0], octave: currentOctave + 1, midiNumber: scale.notes[0].midiNumber + 12, frequency: scale.notes[0].frequency * 2 }];

      await audioEngine.playScale(scaleWithOctave, tempo, playDirection);
    } catch (error) {
      console.error('Error playing scale:', error);
    } finally {
      setIsPlaying(false);
    }
  };

  const handlePlayChords = async () => {
    if (!audioEngine.initialized) {
      await audioEngine.initialize();
    }

    setIsPlaying(true);

    try {
      const chords = generateDiatonicChords(currentRoot, currentMode, currentOctave);
      const progressionChords = chords.slice(0, 4);

      // Animate the playhead through the progression
      const beatDuration = (60 / tempo) * 1000; // Convert to milliseconds
      progressionChords.forEach((_, index) => {
        setTimeout(() => {
          setPlayingProgressionIndex(index);
        }, index * beatDuration);
      });

      // Clear the playhead after progression finishes
      setTimeout(() => {
        setPlayingProgressionIndex(null);
      }, progressionChords.length * beatDuration);

      await audioEngine.playProgression(progressionChords, tempo);
    } catch (error) {
      console.error('Error playing chords:', error);
    } finally {
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    audioEngine.stopAll();
    setIsPlaying(false);
    setPlayingProgressionIndex(null);
  };

  return (
    <div className="bg-gray-800 border-b border-gray-700 p-[0.5rem]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center gap-4">
          {/* Playback Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={isPlaying ? handleStop : handlePlayScale}
              className="flex items-center gap-2.5 pl-[0.75rem] pr-[1rem] py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base min-h-[48px]"
              disabled={!audioEngine.initialized && !isPlaying}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-5 h-5" />
                  Stop
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Play Scale
                </>
              )}
            </button>

            <button
              onClick={handlePlayChords}
              className="flex items-center gap-2.5 pl-[0.75rem] pr-[1rem] py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base min-h-[48px]"
              disabled={isPlaying || !audioEngine.initialized}
            >
              <Music2 className="w-5 h-5" />
              Play Chords
            </button>

            <motion.button
              onClick={toggleKeyboard}
              className={`keyboard-toggle-button flex items-center gap-2.5 pl-[0.5rem] pr-[0.75rem] py-2.5 rounded-lg transition-colors relative text-sm min-h-[44px] ${
                keyboardEnabled
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }`}
              title={keyboardEnabled ? 'Disable Keyboard (`)' : 'Enable Keyboard (`)'}
              animate={!keyboardEnabled ? {
                boxShadow: [
                  '0 0 0 0 rgba(147, 51, 234, 0)',
                  '0 0 0 4px rgba(147, 51, 234, 0.3)',
                  '0 0 0 0 rgba(147, 51, 234, 0)',
                ],
              } : {}}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Keyboard className="w-5 h-5" />
              {keyboardEnabled ? 'Keyboard (`)'  : 'Keyboard (`)'}
            </motion.button>
          </div>

          {/* Direction Selector */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-400">Direction:</label>
            <select
              value={playDirection}
              onChange={(e) => setPlayDirection(e.target.value as any)}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none text-sm"
            >
              <option value="ascending">Ascending</option>
              <option value="descending">Descending</option>
              <option value="both">Both</option>
            </select>
          </div>

          {/* Key Selector */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-400">Key:</label>
            <select
              value={currentRoot}
              onChange={(e) => setRoot(e.target.value as any)}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none text-sm"
            >
              {NOTE_NAMES.map(note => (
                <option key={note} value={note}>{note}</option>
              ))}
            </select>
          </div>

          {/* Octave Selector */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-400">Octave:</label>
            <select
              value={currentOctave}
              onChange={(e) => setOctave(parseInt(e.target.value))}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none text-sm"
            >
              {[2, 3, 4, 5, 6].map(oct => (
                <option key={oct} value={oct}>{oct}</option>
              ))}
            </select>
          </div>

          {/* Tempo Slider */}
          <div className="flex items-center gap-2 min-w-[200px]">
            <RotateCcw className="w-4 h-4 text-gray-400" />
            <label className="text-sm text-gray-400">BPM:</label>
            <input
              type="range"
              min="40"
              max="200"
              value={tempo}
              onChange={(e) => setTempo(parseInt(e.target.value))}
              className="flex-1 accent-blue-600"
            />
            <span className="text-sm text-white w-12 text-right">{tempo}</span>
          </div>

          {/* Volume Slider */}
          <div className="flex items-center gap-2 min-w-[150px]">
            <Volume2 className="w-4 h-4 text-gray-400" />
            <input
              type="range"
              min="-40"
              max="0"
              value={volume}
              onChange={(e) => {
                const newVolume = parseInt(e.target.value);
                setVolume(newVolume);
                audioEngine.updateSettings({ volume: newVolume });
              }}
              className="flex-1 accent-blue-600"
            />
            <span className="text-sm text-white w-12 text-right">{volume}db</span>
          </div>
        </div>
      </div>
    </div>
  );
}
