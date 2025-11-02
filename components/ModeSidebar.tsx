'use client';

import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import { getModesBySortOrder } from '@/lib/modes';
import { Music, Lightbulb, Hash, Sparkles, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/useIsMobile';
import type { ModeName } from '@/lib/types';

interface ModeSidebarProps {
  onClose?: () => void;
}

export function ModeSidebar({ onClose }: ModeSidebarProps) {
  const { currentMode, setMode, modeSortOrder, setModeSortOrder } = useStore();
  const modes = getModesBySortOrder(modeSortOrder);
  const isMobile = useIsMobile();

  const handleModeSelect = (mode: ModeName) => {
    setMode(mode);
    // Close drawer on mobile after selection
    if (isMobile && onClose) {
      onClose();
    }
  };

  // Map mode names to their keyboard shortcuts (Shift+1-7)
  const modeToShortcut: Record<ModeName, number> = {
    ionian: 1,
    dorian: 2,
    phrygian: 3,
    lydian: 4,
    mixolydian: 5,
    aeolian: 6,
    locrian: 7,
  };

  return (
    <div className="w-80 h-full bg-gray-900 border-r border-gray-700 flex flex-col relative">
      {/* Close button - Mobile only, top-right of drawer */}
      {isMobile && onClose && (
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-10 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Header */}
      <div className={`p-3 border-b border-gray-700 flex-shrink-0 ${isMobile ? 'pr-12' : ''}`}>
        <div className="flex items-center gap-3 mb-2">
          <Music className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl font-bold text-white">Diatonic Modes</h2>
        </div>
        <p className="text-sm text-gray-400">
          Explore the seven modes of the major scale
        </p>
      </div>

      {/* Sort Order Toggle */}
      <div className="p-[0.5rem] border-b border-gray-700 bg-gray-800/30 flex-shrink-0">
        <div className="flex items-center gap-2 rounded-lg bg-gray-800 p-1.5">
          <button
            onClick={() => setModeSortOrder('traditional')}
            className={`
              flex-1 flex items-center justify-center gap-2 px-[0.5rem] py-2.5 rounded-md text-sm font-medium transition-all min-h-[40px]
              ${modeSortOrder === 'traditional'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/50'
              }
            `}
            title="Order by scale degree (matches keyboard shortcuts)"
          >
            <Hash className="w-4 h-4" />
            Traditional
          </button>
          <button
            onClick={() => setModeSortOrder('brightness')}
            className={`
              flex-1 flex items-center justify-center gap-2 px-[0.5rem] py-2.5 rounded-md text-sm font-medium transition-all min-h-[40px]
              ${modeSortOrder === 'brightness'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/50'
              }
            `}
            title="Order from darkest to brightest sound"
          >
            <Sparkles className="w-4 h-4" />
            Brightness
          </button>
        </div>
      </div>

      {/* Brightness Scale */}
      <div className="p-[0.5rem] border-b border-gray-700 bg-gray-800/50 flex-shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="w-4 h-4 text-yellow-400" />
          <span className="text-xs font-medium text-gray-300">Brightness Scale</span>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Dark</span>
          <span>Bright</span>
        </div>
        <div className="h-2 bg-gradient-to-r from-purple-900 via-gray-600 to-cyan-400 rounded-full mt-1" />
      </div>

      {/* Mode List - Scrollable */}
      <div className="flex-1 overflow-y-auto p-[0.5rem] space-y-2">
        {modes.map((mode, index) => {
          const isSelected = currentMode === mode.name;

          return (
            <motion.button
              key={mode.name}
              onClick={() => handleModeSelect(mode.name as ModeName)}
              className={`
                w-full text-left p-[0.5rem] rounded-lg border transition-all
                ${isSelected
                  ? 'bg-blue-600 border-blue-500 shadow-lg shadow-blue-500/20'
                  : 'bg-gray-800 border-gray-700 hover:bg-gray-750 hover:border-gray-600'
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              {/* Mode Name and Keyboard Shortcut */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-white">
                    {mode.displayName}
                  </h3>
                  <kbd className="px-2.5 py-0.5 bg-gray-700 border border-gray-600 rounded text-xs font-mono text-gray-300">
                    ⇧{modeToShortcut[mode.name]}
                  </kbd>
                </div>
                <div className="flex items-center gap-1">
                  {/* Brightness indicator */}
                  {[...Array(7)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full ${
                        i < mode.brightness
                          ? 'bg-yellow-400'
                          : 'bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Intervals */}
              <div className="flex items-center gap-1 mb-2 flex-wrap">
                {mode.intervals.map((interval, idx) => {
                  const isCharacteristic = mode.characteristicNotes.includes((idx + 1) as any);
                  return (
                    <span
                      key={idx}
                      className={`
                        text-xs px-2.5 py-0.5 rounded
                        ${isCharacteristic
                          ? 'bg-purple-500/30 text-purple-200 font-semibold'
                          : 'bg-gray-700 text-gray-300'
                        }
                      `}
                    >
                      {interval === 0 ? 'R' : interval}
                    </span>
                  );
                })}
              </div>

              {/* Mood */}
              <p className="text-xs text-gray-400 mb-1">
                <span className="font-medium">Mood:</span> {mode.mood}
              </p>

              {/* Description (only show when selected) */}
              {isSelected && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="text-xs text-gray-300 mt-2 pt-2 border-t border-blue-500/30"
                >
                  {mode.description}
                </motion.p>
              )}

              {/* Formula */}
              <div className="text-xs text-gray-500 mt-1">
                {mode.formula}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="p-[0.5rem] border-t border-gray-700 bg-gray-800/50 flex-shrink-0">
        <h4 className="text-xs font-medium text-gray-400 mb-2">Legend</h4>
        <div className="space-y-1 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>Root note</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <span>Characteristic notes</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-400" />
            <span>Scale notes</span>
          </div>
        </div>
      </div>
    </div>
  );
}
