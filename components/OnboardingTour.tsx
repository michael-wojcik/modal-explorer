'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

interface OnboardingTourProps {
  run: boolean;
  onComplete: () => void;
}

interface TourStep {
  title: string;
  content: React.ReactNode;
  target: string;
}

export function OnboardingTour({ run, onComplete }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const steps: TourStep[] = [
    {
      title: 'Explore the Seven Modes',
      content: (
        <p className="text-sm text-gray-300">
          Select different diatonic modes from this sidebar. Each mode has a unique sound and mood.
          Try switching between them to hear the difference!
        </p>
      ),
      target: '.mode-sidebar',
    },
    {
      title: 'Enable Keyboard Mode',
      content: (
        <>
          <p className="text-sm text-gray-300 mb-2">
            Click this button or press the <kbd className="px-2 py-1 bg-gray-700 rounded text-xs mx-1">`</kbd> (backtick) key
            to enable keyboard mode.
          </p>
          <p className="text-sm text-gray-400">
            This lets you play notes using your computer keyboard - keys 1-7 map to scale degrees!
          </p>
        </>
      ),
      target: '.keyboard-toggle-button',
    },
    {
      title: 'Control Playback',
      content: (
        <p className="text-sm text-gray-300">
          Use these controls to play scales and chords, adjust tempo, change the root note, and modify other settings.
        </p>
      ),
      target: '.transport-controls',
    },
    {
      title: 'Interactive Piano',
      content: (
        <>
          <p className="text-sm text-gray-300 mb-2">
            Click on the piano keys to hear individual notes, or use your computer keyboard when keyboard mode is enabled.
          </p>
          <p className="text-sm text-gray-400">
            Blue = scale notes, Red = root note, Purple = characteristic notes
          </p>
        </>
      ),
      target: '.piano-keyboard',
    },
    {
      title: 'Keyboard Shortcuts Reference',
      content: (
        <>
          <p className="text-sm text-gray-300 mb-2">
            Press <kbd className="px-2 py-1 bg-gray-700 rounded text-xs mx-1">?</kbd> or click this button
            to see all available keyboard shortcuts.
          </p>
          <p className="text-sm text-gray-400">
            Learn about playing chords (Alt+key), sustain (Space), and mode switching (Shift+1-7)!
          </p>
        </>
      ),
      target: '.keyboard-shortcuts-button',
    },
  ];

  useEffect(() => {
    if (!run) return;

    const updatePosition = () => {
      const targetEl = document.querySelector(steps[currentStep].target);
      if (targetEl) {
        const rect = targetEl.getBoundingClientRect();
        setPosition({
          top: rect.bottom + 20,
          left: rect.left + rect.width / 2,
        });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [run, currentStep, steps]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      localStorage.setItem('modalExplorer.tourCompleted', 'true');
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('modalExplorer.tourCompleted', 'true');
    onComplete();
  };

  if (!run) return null;

  const step = steps[currentStep];

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {run && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-[9999]"
            onClick={handleSkip}
          />
        )}
      </AnimatePresence>

      {/* Tooltip */}
      <AnimatePresence>
        {run && (
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              position: 'fixed',
              top: position.top,
              left: position.left,
              transform: 'translateX(-50%)',
            }}
            className="z-[10000] bg-gray-800 rounded-xl shadow-2xl border border-purple-600 p-5 max-w-md"
          >
            {/* Close button */}
            <button
              onClick={handleSkip}
              className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
              aria-label="Skip tour"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Content */}
            <div className="pr-6">
              <h3 className="text-lg font-bold text-white mb-3">{step.title}</h3>
              <div className="mb-4">{step.content}</div>

              {/* Progress */}
              <div className="flex items-center gap-2 mb-4">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      index === currentStep ? 'bg-purple-600' : 'bg-gray-700'
                    }`}
                  />
                ))}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={handleSkip}
                  className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-2"
                >
                  Skip Tour
                </button>
                <div className="flex items-center gap-2">
                  {currentStep > 0 && (
                    <button
                      onClick={handlePrev}
                      className="px-5 py-2.5 text-sm text-gray-300 hover:text-white transition-colors flex items-center gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Back
                    </button>
                  )}
                  <button
                    onClick={handleNext}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-base font-semibold transition-colors flex items-center gap-1.5 min-h-[44px]"
                  >
                    {currentStep < steps.length - 1 ? (
                      <>
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </>
                    ) : (
                      'Finish'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
