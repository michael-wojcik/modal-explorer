'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/lib/store';

type FeedbackType = 'scale-play' | 'chord-play' | 'mode-change' | 'setting-change' | null;

export function VisualFeedbackOverlay() {
  const { isPlaying, modeJustChanged, setModeJustChanged, settingJustChanged, setSettingJustChanged } = useStore();
  const [feedbackType, setFeedbackType] = useState<FeedbackType>(null);
  const [settingType, setSettingType] = useState<'octave' | 'root' | 'tempo' | null>(null);

  // Handle setting changes
  useEffect(() => {
    if (settingJustChanged.type) {
      setFeedbackType('setting-change');
      setSettingType(settingJustChanged.type);
      const timeout = setTimeout(() => {
        setFeedbackType(null);
        setSettingType(null);
        setSettingJustChanged(null);
      }, 800);
      return () => clearTimeout(timeout);
    }
  }, [settingJustChanged, setSettingJustChanged]);

  // Handle mode changes
  useEffect(() => {
    if (modeJustChanged) {
      setFeedbackType('mode-change');
      const timeout = setTimeout(() => {
        setFeedbackType(null);
        setModeJustChanged(false);
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [modeJustChanged, setModeJustChanged]);

  // Handle playback
  useEffect(() => {
    if (isPlaying && !modeJustChanged) {
      setFeedbackType('scale-play');
    } else if (!isPlaying) {
      // Delay clearing to let animation finish
      const timeout = setTimeout(() => {
        if (!modeJustChanged) setFeedbackType(null);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [isPlaying, modeJustChanged]);

  const getSettingColor = () => {
    switch (settingType) {
      case 'octave': return '#60a5fa'; // Blue
      case 'root': return '#f59e0b'; // Amber
      case 'tempo': return '#10b981'; // Green
      default: return '#8b5cf6'; // Purple
    }
  };

  return (
    <AnimatePresence>
      {feedbackType && (
        <div className="pointer-events-none fixed inset-0 z-30">
          {/* Setting change ripple effect */}
          {feedbackType === 'setting-change' && (
            <>
              {/* Vertical ripple for octave */}
              {settingType === 'octave' && (
                <motion.div
                  className="absolute top-0 left-0 right-0 h-full"
                  style={{
                    background: `linear-gradient(to bottom, transparent, ${getSettingColor()}20, transparent)`,
                  }}
                  initial={{ y: '-100%', opacity: 0 }}
                  animate={{ y: '100%', opacity: [0, 0.8, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              )}

              {/* Horizontal ripple for root note */}
              {settingType === 'root' && (
                <motion.div
                  className="absolute left-0 top-0 bottom-0 w-full"
                  style={{
                    background: `linear-gradient(to right, transparent, ${getSettingColor()}20, transparent)`,
                  }}
                  initial={{ x: '-100%', opacity: 0 }}
                  animate={{ x: '100%', opacity: [0, 0.8, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              )}

              {/* Pulse for tempo */}
              {settingType === 'tempo' && (
                <motion.div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full"
                  style={{
                    background: `radial-gradient(circle, ${getSettingColor()}40, transparent)`,
                  }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0, 8], opacity: [0.8, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              )}
            </>
          )}

          {/* Mode change ripple effect */}
          {feedbackType === 'mode-change' && (
            <motion.div
              className="absolute left-0 top-0 bottom-0 w-full bg-gradient-to-r from-transparent via-purple-500/20 to-transparent"
              initial={{ x: '-100%', opacity: 0 }}
              animate={{ x: '100%', opacity: [0, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
            />
          )}

          {/* Wave effect from transport controls to piano */}
          {feedbackType === 'scale-play' && (
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            {/* Animated gradient wave */}
            <defs>
              <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.8">
                  <animate
                    attributeName="stop-opacity"
                    values="0.8;0.3;0.8"
                    dur="1.5s"
                    repeatCount="indefinite"
                  />
                </stop>
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.3">
                  <animate
                    attributeName="stop-opacity"
                    values="0.3;0.1;0.3"
                    dur="1.5s"
                    repeatCount="indefinite"
                  />
                </stop>
              </linearGradient>
            </defs>

            {/* Animated path from top to middle */}
            <motion.path
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: [0, 0.6, 0.3] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              d="M 50% 10% Q 50% 30%, 50% 50%"
              stroke="url(#waveGradient)"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />

            {/* Expanding circle at piano keyboard location */}
            <motion.circle
              cx="50%"
              cy="55%"
              r="20"
              fill="none"
              stroke="#60a5fa"
              strokeWidth="3"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0, 1.5, 2],
                opacity: [0.8, 0.4, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeOut',
              }}
            />

            {/* Pulsing glow */}
            <motion.circle
              cx="50%"
              cy="55%"
              r="40"
              fill="#60a5fa"
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 0.2, 0],
                scale: [0.8, 1.2, 1.4],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeOut',
              }}
            />
          </svg>
          )}
        </div>
      )}
    </AnimatePresence>
  );
}
