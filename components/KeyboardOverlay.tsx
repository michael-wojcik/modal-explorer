'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info } from 'lucide-react';
import { useStore } from '@/lib/store';
import { getKeyboardLayout, getScaleDegreeLabel } from '@/lib/keyboard-mappings';
import { getMode } from '@/lib/modes';

export function KeyboardOverlay() {
  const {
    showKeyboardOverlay,
    keyboardLayout,
    activeComputerKeys,
    toggleKeyboardOverlay,
    setKeyboardOverlayJustDismissed,
    currentMode,
    currentRoot,
  } = useStore();

  // Handle Escape key to close overlay
  useEffect(() => {
    if (!showKeyboardOverlay) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        toggleKeyboardOverlay();
      }
    };

    // Auto-dismiss after 5 seconds
    const timeout = setTimeout(() => {
      setKeyboardOverlayJustDismissed(true);
      toggleKeyboardOverlay();
    }, 5000);

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timeout);
    };
  }, [showKeyboardOverlay, toggleKeyboardOverlay, setKeyboardOverlayJustDismissed]);

  if (!showKeyboardOverlay) {
    return null;
  }

  const layout = getKeyboardLayout(keyboardLayout);
  const mode = getMode(currentMode);

  // Group mappings by octave offset for display
  const mainOctave = layout.mappings.filter(m => m.octaveOffset === 0);
  const upperOctave = layout.mappings.filter(m => m.octaveOffset === 1);
  const lowerOctave = layout.mappings.filter(m => m.octaveOffset === -1);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4"
        onClick={toggleKeyboardOverlay}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{
            scale: 0.2,
            opacity: 0,
            x: typeof window !== 'undefined' ? window.innerWidth / 2 - 150 : 0,
            y: typeof window !== 'undefined' ? window.innerHeight / 2 - 80 : 0,
          }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl max-w-4xl w-full p-[0.5rem]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded">
                <Info className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Keyboard Layout: {layout.name}
                </h2>
                <p className="text-sm text-gray-400">{layout.description}</p>
                <p className="text-sm text-blue-300 mt-1">
                  Playing in: {currentRoot} {mode.displayName}
                </p>
              </div>
            </div>
            <button
              onClick={toggleKeyboardOverlay}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Key Mappings by Row */}
          <div className="space-y-6">
            {/* Upper Octave - QWERTY Row */}
            {upperOctave.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-purple-400 mb-3 flex items-center gap-2">
                  <span className="px-3 py-1 bg-purple-600 rounded text-xs text-white">Upper Octave</span>
                  QWERTYUI Row (High) - Scale Degrees 1-7 + Octave
                </h3>
                <div className="flex gap-2 flex-wrap">
                  {upperOctave.map((mapping) => {
                    const isActive = activeComputerKeys.has(mapping.key);
                    return (
                      <motion.div
                        key={mapping.key}
                        className={`
                          relative p-[0.5rem] rounded-lg border text-center min-w-[70px]
                          ${isActive
                            ? 'bg-purple-600 border-purple-500 shadow-lg shadow-purple-500/30'
                            : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                          }
                          transition-all
                        `}
                        animate={isActive ? { scale: [1, 1.05, 1] } : {}}
                      >
                        <div className={`text-lg font-mono font-bold mb-1 ${isActive ? 'text-white' : 'text-gray-300'}`}>
                          {mapping.key.toUpperCase()}
                        </div>
                        <div className={`text-xs ${isActive ? 'text-purple-200' : 'text-purple-400'}`}>
                          Degree {mapping.scaleDegree}
                        </div>
                        {isActive && (
                          <motion.div
                            className="absolute top-1 right-1 w-2 h-2 bg-green-400 rounded-full"
                            animate={{ opacity: [1, 0.5, 1] }}
                            transition={{ repeat: Infinity, duration: 1 }}
                          />
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Main Octave - ASDF Row */}
            <div>
              <h3 className="text-sm font-semibold text-blue-400 mb-3 flex items-center gap-2">
                <span className="px-3 py-1 bg-blue-600 rounded text-xs text-white">Main Octave</span>
                ASDFGHJK Row (Home Row) - Scale Degrees 1-7 + Octave
              </h3>
              <div className="flex gap-2 flex-wrap">
                {mainOctave.map((mapping) => {
                  const isActive = activeComputerKeys.has(mapping.key);
                  return (
                    <motion.div
                      key={mapping.key}
                      className={`
                        relative p-[0.5rem] rounded-lg border text-center min-w-[80px]
                        ${isActive
                          ? 'bg-blue-600 border-blue-500 shadow-lg shadow-blue-500/30'
                          : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                        }
                        transition-all
                      `}
                      animate={isActive ? { scale: [1, 1.05, 1] } : {}}
                      transition={{ duration: 0.2 }}
                    >
                      {/* Computer Key */}
                      <div className={`
                        text-2xl font-mono font-bold mb-2
                        ${isActive ? 'text-white' : 'text-gray-300'}
                      `}>
                        {mapping.key.toUpperCase()}
                      </div>

                      {/* Scale Degree */}
                      <div className={`
                        text-sm font-semibold mb-1
                        ${isActive ? 'text-blue-100' : 'text-blue-400'}
                      `}>
                        Degree {mapping.scaleDegree}
                      </div>

                      {/* Label */}
                      <div className={`
                        text-xs
                        ${isActive ? 'text-blue-200' : 'text-gray-500'}
                      `}>
                        {mapping.label}
                      </div>

                      {/* Active Indicator */}
                      {isActive && (
                        <motion.div
                          className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full"
                          animate={{ opacity: [1, 0.5, 1] }}
                          transition={{ repeat: Infinity, duration: 1 }}
                        />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Lower Octave - ZXCV Row */}
            {lowerOctave.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-green-400 mb-3 flex items-center gap-2">
                  <span className="px-3 py-1 bg-green-600 rounded text-xs text-white">Lower Octave</span>
                  ZXCVBNM, Row (Low) - Scale Degrees 1-7 + Octave
                </h3>
                <div className="flex gap-2 flex-wrap">
                  {lowerOctave.map((mapping) => {
                    const isActive = activeComputerKeys.has(mapping.key);
                    return (
                      <motion.div
                        key={mapping.key}
                        className={`
                          relative p-[0.5rem] rounded-lg border text-center min-w-[70px]
                          ${isActive
                            ? 'bg-green-600 border-green-500 shadow-lg shadow-green-500/30'
                            : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                          }
                          transition-all
                        `}
                        animate={isActive ? { scale: [1, 1.05, 1] } : {}}
                      >
                        <div className={`text-lg font-mono font-bold mb-1 ${isActive ? 'text-white' : 'text-gray-300'}`}>
                          {mapping.key.toUpperCase()}
                        </div>
                        <div className={`text-xs ${isActive ? 'text-green-200' : 'text-green-400'}`}>
                          Degree {mapping.scaleDegree}
                        </div>
                        {isActive && (
                          <motion.div
                            className="absolute top-1 right-1 w-2 h-2 bg-green-400 rounded-full"
                            animate={{ opacity: [1, 0.5, 1] }}
                            transition={{ repeat: Infinity, duration: 1 }}
                          />
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Shortcuts Reference */}
          <div className="mt-6 pt-6 border-t border-gray-700">
            <h3 className="text-sm font-semibold text-gray-400 mb-3">
              Keyboard Shortcuts
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              <div className="flex items-center justify-between bg-gray-800/50 px-4 py-2 rounded">
                <span className="text-gray-300">Toggle Keyboard</span>
                <kbd className="px-2.5 py-1 bg-gray-700 rounded text-gray-200 font-mono text-xs">`</kbd>
              </div>
              <div className="flex items-center justify-between bg-gray-800/50 px-4 py-2 rounded">
                <span className="text-gray-300">Toggle Help</span>
                <kbd className="px-2.5 py-1 bg-gray-700 rounded text-gray-200 font-mono text-xs">Ctrl+/</kbd>
              </div>
              <div className="flex items-center justify-between bg-gray-800/50 px-4 py-2 rounded">
                <span className="text-gray-300">Play Note</span>
                <kbd className="px-2.5 py-1 bg-gray-700 rounded text-gray-200 font-mono text-xs">1-7</kbd>
              </div>
              <div className="flex items-center justify-between bg-gray-800/50 px-4 py-2 rounded">
                <span className="text-gray-300">Play Chord</span>
                <kbd className="px-2.5 py-1 bg-gray-700 rounded text-gray-200 font-mono text-xs">Alt+1-7</kbd>
              </div>
              <div className="flex items-center justify-between bg-gray-800/50 px-4 py-2 rounded">
                <span className="text-gray-300">Sustain Pedal</span>
                <kbd className="px-2.5 py-1 bg-gray-700 rounded text-gray-200 font-mono text-xs">Space</kbd>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="mt-4 p-[0.5rem] bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-300 mb-2">💡 Pro Tips</h4>
            <ul className="text-xs text-gray-300 space-y-1">
              <li>• <strong>Complete octaves:</strong> Each row has 8 keys (degrees 1-7 + octave)</li>
              <li>• <strong>8th notes:</strong> I/K/, keys play the octave (8th note) for each row</li>
              <li>• <strong>Same finger, same degree:</strong> Q/A/Z all play degree 1, I/K/, all play the octave</li>
              <li>• <strong>Hold Alt</strong> while pressing a key to play the chord for that scale degree</li>
              <li>• <strong>Mode-aware:</strong> All keys automatically adapt to current mode and root!</li>
            </ul>
          </div>

          {/* Close Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={toggleKeyboardOverlay}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
            >
              Got it!
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
