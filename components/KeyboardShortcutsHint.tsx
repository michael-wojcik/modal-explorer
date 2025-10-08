'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Keyboard, Zap } from 'lucide-react';
import { useStore } from '@/lib/store';

export function KeyboardShortcutsHint() {
  const [showHints, setShowHints] = useState(false);
  const [isShiftHeld, setIsShiftHeld] = useState(false);
  const { welcomeHintJustDismissed, setWelcomeHintJustDismissed } = useStore();

  // Clear the "just dismissed" flag after highlighting
  useEffect(() => {
    if (welcomeHintJustDismissed) {
      const timeout = setTimeout(() => {
        setWelcomeHintJustDismissed(false);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [welcomeHintJustDismissed, setWelcomeHintJustDismissed]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setIsShiftHeld(true);
      }
      // Toggle hints with ? key
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setShowHints(prev => !prev);
      }
      // Close hints with Escape key
      if (e.key === 'Escape' && showHints) {
        e.preventDefault();
        setShowHints(false);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setIsShiftHeld(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [showHints]);

  const shortcuts = [
    {
      category: 'Playing Notes',
      items: [
        { keys: ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I'], description: 'Upper octave (degrees 1-7 + octave)' },
        { keys: ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K'], description: 'Main octave (degrees 1-7 + octave)' },
        { keys: ['Z', 'X', 'C', 'V', 'B', 'N', 'M', ','], description: 'Lower octave (degrees 1-7 + octave)' },
        { keys: ['Alt', '+', 'key'], description: 'Play chord for scale degree' },
        { keys: ['Space'], description: 'Sustain pedal' },
      ],
    },
    {
      category: 'Controls',
      items: [
        { keys: ['`'], description: 'Toggle keyboard mode' },
        { keys: ['Ctrl', '/', '?'], description: 'Show/hide keyboard help' },
      ],
    },
    {
      category: 'Mode Switching',
      items: [
        { keys: ['Shift', '+', '1'], description: 'Ionian (Major)' },
        { keys: ['Shift', '+', '2'], description: 'Dorian' },
        { keys: ['Shift', '+', '3'], description: 'Phrygian' },
        { keys: ['Shift', '+', '4'], description: 'Lydian' },
        { keys: ['Shift', '+', '5'], description: 'Mixolydian' },
        { keys: ['Shift', '+', '6'], description: 'Aeolian (Minor)' },
        { keys: ['Shift', '+', '7'], description: 'Locrian' },
      ],
    },
    {
      category: 'Tips',
      items: [
        { keys: ['💡'], description: 'Each row is a complete octave (QWERTY/ASDF/ZXCV)' },
        { keys: ['🎹'], description: 'Same finger = same scale degree across octaves' },
        { keys: ['🎵'], description: 'All keys adapt to current mode & root' },
        { keys: ['✨'], description: 'Hold Alt for instant chords' },
      ],
    },
  ];

  return (
    <>
      {/* Floating hint button */}
      <AnimatePresence>
        {!showHints && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: 1,
              scale: welcomeHintJustDismissed ? [1, 1.05, 1, 1.05, 1] : 1,
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{
              scale: { duration: 0.6, repeat: welcomeHintJustDismissed ? 3 : 0 },
            }}
            onClick={() => setShowHints(true)}
            className={`
              keyboard-shortcuts-button fixed bottom-4 left-4 z-50 flex items-center gap-3 px-6 py-3.5 bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-full shadow-2xl transition-all group min-h-[52px]
              ${welcomeHintJustDismissed
                ? 'ring-2 ring-yellow-400 ring-opacity-50 shadow-yellow-500/50'
                : 'hover:shadow-purple-500/50'
              }
            `}
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Keyboard className="w-6 h-6" />
            </motion.div>
            <span className="text-base font-medium hidden sm:inline">
              Shortcuts
            </span>
            <motion.div
              className="w-2 h-2 rounded-full bg-yellow-400"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg">
                Press <kbd className="px-2 py-0.5 bg-gray-700 rounded text-xs">?</kbd> for all shortcuts
              </div>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Shortcuts panel */}
      <AnimatePresence>
        {showHints && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowHints(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl shadow-2xl max-w-3xl w-full p-[0.5rem] max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl">
                    <Keyboard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Keyboard Shortcuts</h2>
                    <p className="text-sm text-gray-400">Master the controls</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowHints(false)}
                  className="text-gray-400 hover:text-white transition-colors text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Shortcuts grid */}
              <div className="space-y-6">
                {shortcuts.map((section, idx) => (
                  <motion.div
                    key={section.category}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <h3 className="text-lg font-semibold text-purple-400 mb-3">
                      {section.category}
                    </h3>
                    <div className="space-y-2">
                      {section.items.map((item, itemIdx) => (
                        <motion.div
                          key={itemIdx}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: idx * 0.1 + itemIdx * 0.05 }}
                          className="flex items-center justify-between p-[0.5rem] bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
                        >
                          <div className="flex items-center gap-2 flex-wrap">
                            {item.keys.map((key, keyIdx) => (
                              <span key={keyIdx} className="flex items-center gap-1">
                                <kbd className="px-3 py-1.5 bg-gray-700 text-gray-200 rounded-md font-mono text-sm font-semibold shadow-md border border-gray-600">
                                  {key}
                                </kbd>
                                {keyIdx < item.keys.length - 1 && key !== '+' && (
                                  <span className="text-gray-500 text-sm">+</span>
                                )}
                              </span>
                            ))}
                          </div>
                          <span className="text-gray-300 text-sm ml-4">
                            {item.description}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Footer tip */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-6 p-[0.5rem] bg-blue-500/10 border border-blue-500/30 rounded-lg"
              >
                <p className="text-sm text-blue-300">
                  <strong>Pro Tip:</strong> All keyboard shortcuts work while keyboard mode is active.
                  UI elements like dropdowns and buttons remain fully accessible!
                </p>
              </motion.div>

              {/* Close hint */}
              <div className="mt-4 text-center text-gray-500 text-sm">
                Press <kbd className="px-2.5 py-1 bg-gray-700 rounded text-gray-300">?</kbd> or{' '}
                <kbd className="px-2.5 py-1 bg-gray-700 rounded text-gray-300">Esc</kbd> to close
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
