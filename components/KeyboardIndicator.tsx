'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Keyboard, Circle } from 'lucide-react';
import { useStore } from '@/lib/store';
import { getKeyboardLayout } from '@/lib/keyboard-mappings';
import { getMode } from '@/lib/modes';

export function KeyboardIndicator() {
  const {
    keyboardEnabled,
    keyboardLayout,
    sustainPedal,
    activeComputerKeys,
    currentMode,
    currentRoot,
    keyboardOverlayJustDismissed,
    toggleKeyboardOverlay,
    setKeyboardOverlayJustDismissed,
  } = useStore();

  // Clear the "just dismissed" flag after highlighting
  useEffect(() => {
    if (keyboardOverlayJustDismissed) {
      const timeout = setTimeout(() => {
        setKeyboardOverlayJustDismissed(false);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [keyboardOverlayJustDismissed, setKeyboardOverlayJustDismissed]);

  if (!keyboardEnabled) {
    return null;
  }

  const layout = getKeyboardLayout(keyboardLayout);
  const mode = getMode(currentMode);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity: 1,
          y: 0,
          scale: keyboardOverlayJustDismissed ? [1, 1.05, 1, 1.05, 1] : 1,
        }}
        exit={{ opacity: 0, y: 20 }}
        transition={{
          scale: { duration: 0.6, repeat: keyboardOverlayJustDismissed ? 3 : 0 },
        }}
        onClick={toggleKeyboardOverlay}
        className={`
          fixed bottom-4 right-4 bg-gray-900/95 backdrop-blur-sm border rounded-lg shadow-2xl p-[0.5rem] min-w-[280px] z-50 cursor-pointer
          ${keyboardOverlayJustDismissed
            ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-50'
            : 'border-gray-700 hover:border-gray-600'
          }
          transition-all
        `}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-700">
          <div className="p-2 bg-blue-600 rounded">
            <Keyboard className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-semibold text-white text-sm">Keyboard Mode</div>
            <div className="text-xs text-gray-400">Active</div>
          </div>
          <div className="ml-auto">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Circle className="w-2 h-2 fill-green-500 text-green-500" />
            </motion.div>
          </div>
        </div>

        {/* Status Grid */}
        <div className="space-y-2">
          {/* Current Scale */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Playing In</span>
            <span className="text-sm font-medium text-white bg-gray-800 px-2 py-1 rounded">
              {currentRoot} {mode.displayName}
            </span>
          </div>

          {/* Layout */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Layout</span>
            <span className="text-sm font-medium text-white bg-gray-800 px-2 py-1 rounded">
              {layout.name}
            </span>
          </div>

          {/* Sustain */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Sustain</span>
            <div
              className={`text-xs font-medium px-2 py-1 rounded ${
                sustainPedal
                  ? 'bg-green-500/20 text-green-300'
                  : 'bg-gray-800 text-gray-500'
              }`}
            >
              {sustainPedal ? 'ON' : 'OFF'}
            </div>
          </div>

          {/* Active Keys Count */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-700">
            <span className="text-xs text-gray-400">Active Keys</span>
            <span className="text-sm font-mono font-semibold text-blue-400">
              {activeComputerKeys.size}
            </span>
          </div>
        </div>

        {/* Help hint */}
        <div className="mt-3 pt-3 border-t border-gray-700">
          <div className="text-xs text-gray-500 space-y-1">
            <div className="flex justify-between">
              <span>Toggle:</span>
              <kbd className="px-2 py-0.5 bg-gray-800 rounded text-gray-300">`</kbd>
            </div>
            <div className="flex justify-between">
              <span>Layout Help:</span>
              <span className="text-blue-400 font-medium">Click here</span>
            </div>
            <div className="flex justify-between">
              <span>Keys 1-7:</span>
              <span className="text-gray-400">Scale degrees</span>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
