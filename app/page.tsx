'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import { ModeSidebar } from '@/components/ModeSidebar';
import { TransportControls } from '@/components/TransportControls';
import { PianoKeyboard } from '@/components/PianoKeyboard';
import { ChordDisplay } from '@/components/ChordDisplay';
import { KeyboardIndicator } from '@/components/KeyboardIndicator';
import { KeyboardOverlay } from '@/components/KeyboardOverlay';
import { KeyboardShortcutsHint } from '@/components/KeyboardShortcutsHint';
import { WelcomeHint } from '@/components/WelcomeHint';
import { OnboardingTour } from '@/components/OnboardingTour';
import { VisualFeedbackOverlay } from '@/components/VisualFeedbackOverlay';
import { NoteTrails } from '@/components/NoteTrails';
import { SustainPedalEffect } from '@/components/SustainPedalEffect';
import { useStore } from '@/lib/store';
import { getMode } from '@/lib/modes';
import { useIsMobile } from '@/hooks/useIsMobile';

export default function Home() {
  const { currentMode, currentRoot } = useStore();
  const mode = getMode(currentMode);
  const [runTour, setRunTour] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      {/* Welcome Hint */}
      <WelcomeHint onStartTour={() => setRunTour(true)} />

      {/* Onboarding Tour */}
      <OnboardingTour run={runTour} onComplete={() => setRunTour(false)} />

      {/* Mobile menu button - only show when sidebar is closed */}
      {isMobile && !sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-50 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg shadow-lg transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      )}

      {/* Backdrop overlay for mobile */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - drawer on mobile, fixed on desktop */}
      <div
        className={`
          mode-sidebar h-full
          fixed md:static inset-y-0 left-0 z-40
          transform md:transform-none transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <ModeSidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header - Responsive layout */}
        <header className="bg-gray-900 border-b border-gray-700 px-4 md:px-8 py-3 md:py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0">
            <div className="text-center md:text-left">
              <h1 className="text-xl md:text-2xl font-bold">Modal Explorer</h1>
              <p className="text-xs md:text-sm text-gray-400 mt-1">
                Interactive music theory tool
              </p>
            </div>
            <div className="text-center md:text-right">
              <div className="text-xs md:text-sm text-gray-400">Current Mode</div>
              <div
                className="text-lg md:text-2xl font-bold px-3 py-1 rounded-lg inline-block"
                style={{
                  backgroundColor: mode.color,
                  color: '#ffffff',
                  textShadow: '0 1px 3px rgba(0, 0, 0, 0.8)'
                }}
              >
                {currentRoot} {mode.displayName}
              </div>
            </div>
          </div>
        </header>

        {/* Transport Controls */}
        <div className="transport-controls">
          <TransportControls />
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-[0.5rem] space-y-2">
            {/* Mode Info Card - Compact on mobile */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-2 md:p-[0.5rem]">
              <div className="grid md:grid-cols-2 gap-3 md:gap-6">
                <div>
                  <h2 className="text-base md:text-lg font-semibold mb-2 md:mb-3 text-white">About This Mode</h2>
                  <p className="text-gray-300 text-xs md:text-sm leading-relaxed mb-2 md:mb-4">
                    {mode.description}
                  </p>
                  <div className="space-y-1 md:space-y-2 text-xs md:text-sm">
                    <div>
                      <span className="text-gray-400">Mood:</span>
                      <span className="text-white ml-2">{mode.mood}</span>
                    </div>
                    <div className="hidden md:block">
                      <span className="text-gray-400">Interval Formula:</span>
                      <span className="text-white ml-2 font-mono">{mode.formula}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Brightness:</span>
                      <span className="text-white ml-2">{mode.brightness}/7</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-base md:text-lg font-semibold mb-2 md:mb-3 text-white">Scale Degrees</h3>
                  <div className="flex flex-wrap gap-1.5 md:gap-2">
                    {mode.intervals.map((interval, idx) => {
                      const degree = idx + 1;
                      const isCharacteristic = mode.characteristicNotes.includes(degree as any);

                      // Calculate scale degree names
                      const degreeNames = ['1', '♭2/2', '♭3/3', '3/4', '♭5/5', '♭6/6', '♭7/7'];
                      let degreeName = '';

                      switch (interval) {
                        case 0: degreeName = '1'; break;
                        case 1: degreeName = '♭2'; break;
                        case 2: degreeName = '2'; break;
                        case 3: degreeName = '♭3'; break;
                        case 4: degreeName = '3'; break;
                        case 5: degreeName = '4'; break;
                        case 6: degreeName = '♭5'; break;
                        case 7: degreeName = '5'; break;
                        case 8: degreeName = '♭6'; break;
                        case 9: degreeName = '6'; break;
                        case 10: degreeName = '♭7'; break;
                        case 11: degreeName = '7'; break;
                      }

                      return (
                        <div
                          key={idx}
                          className={`
                            px-2 md:px-3 py-1.5 md:py-2 rounded-lg border text-center min-w-[50px] md:min-w-[60px]
                            ${isCharacteristic
                              ? 'bg-purple-500/30 border-purple-500 text-purple-200 font-bold'
                              : idx === 0
                              ? 'bg-red-500/30 border-red-500 text-red-200 font-bold'
                              : 'bg-gray-700 border-gray-600 text-gray-300'
                            }
                          `}
                        >
                          <div className="text-xs opacity-75 hidden md:block">
                            {idx === 0 ? 'Root' : `Degree ${degree}`}
                          </div>
                          <div className="text-base md:text-lg font-semibold">{degreeName}</div>
                          <div className="text-xs opacity-75 hidden md:block">
                            {interval === 0 ? 'P1' : `+${interval}`}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {mode.characteristicNotes.length > 0 && (
                    <p className="text-xs text-purple-300 mt-2 md:mt-3 hidden md:block">
                      Purple indicates characteristic notes that define this mode's unique sound
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Piano Keyboard */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-[0.5rem] piano-keyboard">
              <h2 className="text-lg font-semibold mb-4 text-white">Interactive Keyboard</h2>
              <p className="text-sm text-gray-400 mb-4">
                {isMobile ? (
                  <>
                    Tap the keys to hear individual notes. <strong className="text-gray-300">Swipe left/right to see more keys.</strong> Scale notes are highlighted in blue,
                    the root note in red, and characteristic notes in purple.
                  </>
                ) : (
                  <>
                    Click on the keys to hear individual notes. Scale notes are highlighted in blue,
                    the root note in red, and characteristic notes in purple.
                  </>
                )}
              </p>
              <PianoKeyboard startOctave={3} numOctaves={2} />
            </div>

            {/* Chord Display */}
            <ChordDisplay />

            {/* Tips & Tricks - Compact on mobile */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-2 md:p-[0.5rem]">
              <h2 className="text-base md:text-lg font-semibold mb-3 md:mb-4 text-white">How to Use</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 text-xs md:text-sm text-gray-300">
                <div>
                  <h3 className="font-semibold text-white mb-2">Getting Started</h3>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>{isMobile ? 'Tap' : 'Select'} a mode from the {isMobile ? 'menu' : 'left sidebar'}</li>
                    <li>Choose a root note and octave</li>
                    <li>{isMobile ? 'Tap' : 'Click'} "Play Scale" to hear the mode</li>
                    <li>Experiment with different keys and modes</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">Understanding Modes</h3>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Each mode has a unique interval pattern</li>
                    <li>Characteristic notes define the mode's flavor</li>
                    <li>Brightness indicates how "major" or "minor" it sounds</li>
                    <li>Try comparing parallel modes (same root)</li>
                  </ul>
                </div>
                {/* Desktop only - Keyboard Controls */}
                <div className="hidden lg:block">
                  <h3 className="font-semibold text-white mb-2">Keyboard Controls</h3>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Press <kbd className="px-2 py-0.5 bg-gray-700 rounded text-xs">` </kbd> to enable keyboard mode</li>
                    <li>Use keys 1-7 to play scale degrees</li>
                    <li>Hold <kbd className="px-2 py-0.5 bg-gray-700 rounded text-xs">Alt</kbd> for chords</li>
                    <li>Press <kbd className="px-2 py-0.5 bg-gray-700 rounded text-xs">?</kbd> for all shortcuts</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-900 border-t border-gray-700 px-8 py-3">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <p>Modal Explorer - Built with Next.js, Tone.js, and TypeScript</p>
            <p>An interactive music theory learning tool</p>
          </div>
        </footer>
      </div>

      {/* Keyboard Controls - Desktop only (hidden on mobile) */}
      {!isMobile && (
        <>
          <KeyboardIndicator />
          <KeyboardOverlay />
        </>
      )}

      {/* Visual Feedback Overlays */}
      <VisualFeedbackOverlay />
      <SustainPedalEffect />
      <NoteTrails />

      {/* Keyboard Shortcuts Hint - Desktop only */}
      {!isMobile && <KeyboardShortcutsHint />}
    </div>
  );
}
