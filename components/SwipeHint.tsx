'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, MoveHorizontal } from 'lucide-react';
import { useIsMobile } from '@/hooks/useIsMobile';

/**
 * Visual hint that appears on mobile to teach users about swipe gestures
 * Dismisses after a few seconds or on first interaction
 */
export function SwipeHint() {
  const isMobile = useIsMobile();
  const [isVisible, setIsVisible] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    // Only show on mobile
    if (!isMobile) return;

    // Check if user has seen the hint before
    const hasSeenHint = localStorage.getItem('modal-explorer-swipe-hint-seen');
    if (hasSeenHint) return;

    // Show hint after a short delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [isMobile]);

  useEffect(() => {
    if (!isVisible || hasInteracted) return;

    // Auto-dismiss after 8 seconds
    const timer = setTimeout(() => {
      handleDismiss();
    }, 8000);

    // Dismiss on any touch interaction
    const handleTouch = () => {
      if (!hasInteracted) {
        setHasInteracted(true);
        handleDismiss();
      }
    };

    document.addEventListener('touchstart', handleTouch, { once: true });

    return () => {
      clearTimeout(timer);
      document.removeEventListener('touchstart', handleTouch);
    };
  }, [isVisible, hasInteracted]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('modal-explorer-swipe-hint-seen', 'true');
  };

  if (!isMobile) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
        >
          <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-2xl px-6 py-4 shadow-2xl max-w-sm">
            <div className="flex items-start gap-4">
              {/* Swipe Up/Down Icon */}
              <div className="flex flex-col items-center gap-1 text-blue-400">
                <ChevronUp className="w-5 h-5 animate-bounce" />
                <div className="text-xs font-medium">Swipe</div>
                <ChevronDown className="w-5 h-5 animate-bounce" style={{ animationDelay: '0.5s' }} />
              </div>

              {/* Instructions */}
              <div className="flex-1">
                <p className="text-sm text-white font-medium mb-1">
                  Piano Keyboard Gestures
                </p>
                <ul className="text-xs text-gray-300 space-y-1">
                  <li className="flex items-center gap-2">
                    <ChevronUp className="w-3 h-3 text-green-400" />
                    <span>Swipe <strong>up</strong> = higher octave</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronDown className="w-3 h-3 text-purple-400" />
                    <span>Swipe <strong>down</strong> = lower octave</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <MoveHorizontal className="w-3 h-3 text-blue-400" />
                    <span>Scroll left/right = view keys</span>
                  </li>
                </ul>
              </div>

              {/* Dismiss button */}
              <button
                onClick={handleDismiss}
                className="text-gray-500 hover:text-gray-300 transition-colors pointer-events-auto"
                aria-label="Dismiss hint"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
