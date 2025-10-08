'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Keyboard, X, Sparkles } from 'lucide-react';
import { useStore } from '@/lib/store';

interface WelcomeHintProps {
  onStartTour: () => void;
}

export function WelcomeHint({ onStartTour }: WelcomeHintProps) {
  const [isVisible, setIsVisible] = useState(false);
  const { setWelcomeHintJustDismissed } = useStore();

  const handleDismiss = useCallback(() => {
    localStorage.setItem('modalExplorer.welcomeDismissed', 'true');
    setIsVisible(false);
  }, []);

  useEffect(() => {
    // Check if user has already dismissed the welcome hint
    const dismissed = localStorage.getItem('modalExplorer.welcomeDismissed');
    if (!dismissed) {
      setIsVisible(true);

      // Auto-dismiss after 5 seconds
      const timeout = setTimeout(() => {
        setWelcomeHintJustDismissed(true);
        handleDismiss();
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [handleDismiss, setWelcomeHintJustDismissed]);

  useEffect(() => {
    if (!isVisible) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleDismiss();
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isVisible, handleDismiss]);

  const handleTakeATour = () => {
    handleDismiss();
    onStartTour();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{
            scale: 0.2,
            opacity: 0,
            x: typeof window !== 'undefined' ? -window.innerWidth / 2 + 100 : 0,
            y: typeof window !== 'undefined' ? window.innerHeight / 2 - 100 : 0,
          }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-2xl w-full mx-4"
        >
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-2xl p-1">
            <div className="bg-gray-900 rounded-lg p-[0.5rem] relative">
              {/* Close button */}
              <button
                onClick={handleDismiss}
                className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
                aria-label="Dismiss welcome hint"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Content */}
              <div className="flex items-start gap-4 pr-8">
                <div className="p-3 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex-shrink-0">
                  <Keyboard className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                    Welcome to Modal Explorer!
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                  </h3>
                  <p className="text-sm text-gray-300 mb-4">
                    Press <kbd className="px-2.5 py-1 bg-gray-800 border border-gray-700 rounded text-white font-mono text-xs mx-1">` </kbd> (backtick)
                    to enable keyboard mode and play with your computer keyboard. Use keys 1-7 for scale degrees, hold Alt for chords!
                  </p>

                  {/* Action buttons */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <button
                      onClick={handleTakeATour}
                      className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium text-base transition-all shadow-lg hover:shadow-purple-500/50 flex items-center gap-2.5 min-h-[48px] min-w-[140px]"
                    >
                      <Sparkles className="w-5 h-5" />
                      Take a Tour
                    </button>
                    <button
                      onClick={handleDismiss}
                      className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg font-medium text-base transition-colors min-h-[44px] min-w-[100px]"
                    >
                      Got it!
                    </button>
                    <span className="text-xs text-gray-500 ml-auto">
                      Press <kbd className="px-2.5 py-1 bg-gray-800 rounded text-gray-400">Esc</kbd> to dismiss
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
