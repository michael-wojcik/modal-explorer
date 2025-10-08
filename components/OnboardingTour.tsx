'use client';

import { useState, useEffect, useCallback } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';

interface OnboardingTourProps {
  run: boolean;
  onComplete: () => void;
}

export function OnboardingTour({ run, onComplete }: OnboardingTourProps) {
  const [steps] = useState<Step[]>([
    {
      target: '.mode-sidebar',
      content: (
        <div>
          <h3 className="text-lg font-bold mb-2">Explore the Seven Modes</h3>
          <p className="text-sm">
            Select different diatonic modes from this sidebar. Each mode has a unique sound and mood.
            Try switching between them to hear the difference!
          </p>
        </div>
      ),
      disableBeacon: true,
      placement: 'right',
    },
    {
      target: '.keyboard-toggle-button',
      content: (
        <div>
          <h3 className="text-lg font-bold mb-2">Enable Keyboard Mode</h3>
          <p className="text-sm mb-2">
            Click this button or press the <kbd className="px-2.5 py-1 bg-gray-700 rounded text-xs mx-1">`</kbd> (backtick) key
            to enable keyboard mode.
          </p>
          <p className="text-sm text-gray-300">
            This lets you play notes using your computer keyboard - keys 1-7 map to scale degrees!
          </p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '.transport-controls',
      content: (
        <div>
          <h3 className="text-lg font-bold mb-2">Control Playback</h3>
          <p className="text-sm">
            Use these controls to play scales and chords, adjust tempo, change the root note, and modify other settings.
          </p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '.piano-keyboard',
      content: (
        <div>
          <h3 className="text-lg font-bold mb-2">Interactive Piano</h3>
          <p className="text-sm mb-2">
            Click on the piano keys to hear individual notes, or use your computer keyboard when keyboard mode is enabled.
          </p>
          <p className="text-sm text-gray-300">
            Blue = scale notes, Red = root note, Purple = characteristic notes
          </p>
        </div>
      ),
      placement: 'top',
    },
    {
      target: '.keyboard-shortcuts-button',
      content: (
        <div>
          <h3 className="text-lg font-bold mb-2">Keyboard Shortcuts Reference</h3>
          <p className="text-sm mb-2">
            Press <kbd className="px-2.5 py-1 bg-gray-700 rounded text-xs mx-1">?</kbd> or click this button
            to see all available keyboard shortcuts.
          </p>
          <p className="text-sm text-gray-300">
            Learn about playing chords (Alt+key), sustain (Space), and mode switching (Shift+1-7)!
          </p>
        </div>
      ),
      placement: 'right',
    },
  ]);

  const handleJoyrideCallback = useCallback((data: CallBackProps) => {
    const { status } = data;

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      // Mark tour as completed
      localStorage.setItem('modalExplorer.tourCompleted', 'true');
      onComplete();
    }
  }, [onComplete]);

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      scrollToFirstStep
      scrollOffset={100}
      disableScrolling={false}
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: '#7c3aed', // purple-600
          backgroundColor: '#1f2937', // gray-800
          textColor: '#f3f4f6', // gray-100
          arrowColor: '#1f2937',
          overlayColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: 12,
          padding: 20,
        },
        tooltipContainer: {
          textAlign: 'left',
        },
        tooltipContent: {
          padding: '10px 0',
        },
        buttonNext: {
          backgroundColor: '#7c3aed',
          borderRadius: 8,
          padding: '12px 24px',
          fontSize: 16,
          fontWeight: 600,
          minHeight: '44px',
        },
        buttonBack: {
          color: '#9ca3af',
          marginRight: 12,
          padding: '12px 20px',
          fontSize: 16,
        },
        buttonSkip: {
          color: '#9ca3af',
          padding: '12px 20px',
          fontSize: 16,
        },
      }}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Finish',
        next: 'Next',
        skip: 'Skip Tour',
      }}
    />
  );
}
