'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { Note } from '@/lib/types';
import { formatNote } from '@/lib/notes';

interface PianoKeyProps {
  note: Note;
  isBlack: boolean;
  isInScale: boolean;
  isActive: boolean;
  isHovered: boolean;
  isRoot: boolean;
  isCharacteristic: boolean;
  scaleColor: string;
  keyboardLabel?: string | null;
  onClick: (e: React.PointerEvent) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export function PianoKey({
  note,
  isBlack,
  isInScale,
  isActive,
  isHovered,
  isRoot,
  isCharacteristic,
  scaleColor,
  keyboardLabel,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: PianoKeyProps) {
  const getKeyColor = () => {
    if (isActive) {
      return isBlack ? '#fbbf24' : '#fcd34d'; // Amber when active
    }
    if (isRoot) {
      return isBlack ? '#ef4444' : '#f87171'; // Red for root
    }
    if (isCharacteristic) {
      return isBlack ? '#8b5cf6' : '#a78bfa'; // Purple for characteristic notes
    }
    if (isInScale) {
      return isBlack ? '#60a5fa' : '#93c5fd'; // Blue for scale notes
    }
    if (isHovered) {
      return isBlack ? '#4b5563' : '#f3f4f6'; // Lighter on hover
    }
    return isBlack ? '#1f2937' : '#ffffff'; // Default
  };

  const getStrokeColor = () => {
    if (isActive || isRoot) return '#991b1b';
    if (isCharacteristic) return '#5b21b6';
    if (isInScale) return '#1e40af';
    return '#374151';
  };

  // Dimensions
  const whiteKeyWidth = 40;
  const whiteKeyHeight = 160;
  const blackKeyWidth = 24;
  const blackKeyHeight = 100;

  const width = isBlack ? blackKeyWidth : whiteKeyWidth;
  const height = isBlack ? blackKeyHeight : whiteKeyHeight;

  // Touch event handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    onClick(e);
  };

  const handlePointerEnter = (e: React.PointerEvent) => {
    // On touch devices, only trigger if pointer is pressed (dragging)
    if (e.pointerType === 'touch' && e.pressure === 0) {
      return;
    }
    onMouseEnter();
  };

  return (
    <motion.g
      onPointerDown={handlePointerDown}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={onMouseLeave}
      style={{ cursor: 'pointer', touchAction: 'none' }}
      whileHover={{ y: isBlack ? 1 : 2 }}
      whileTap={{ scale: 0.98 }}
      animate={isActive ? { y: [0, -2, 0] } : {}}
      transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
    >
      {/* Glow effect for active notes */}
      {isActive && (
        <motion.rect
          width={width + 8}
          height={height + 8}
          x={-4}
          y={-4}
          rx={isBlack ? 4 : 5}
          fill="none"
          stroke={isRoot ? '#ef4444' : isCharacteristic ? '#8b5cf6' : '#3b82f6'}
          strokeWidth={3}
          opacity={0.6}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{
            opacity: [0.6, 0.3, 0.6],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      <rect
        width={width}
        height={height}
        rx={isBlack ? 2 : 3}
        fill={getKeyColor()}
        stroke={getStrokeColor()}
        strokeWidth={isInScale ? 2.5 : 1.5}
      />

      {/* Note label - only show on white keys or when in scale */}
      {(!isBlack || isInScale) && (
        <text
          x={width / 2}
          y={height - (isBlack ? 15 : 12)}
          textAnchor="middle"
          fontSize={isBlack ? 9 : 11}
          fontWeight={isRoot ? 'bold' : 'normal'}
          fill={isBlack ? '#ffffff' : isActive || isRoot || isCharacteristic ? '#ffffff' : '#1f2937'}
          pointerEvents="none"
        >
          {note.name}
          {!isBlack && <tspan fontSize={8} dy={1}>{note.octave}</tspan>}
        </text>
      )}

      {/* Keyboard key label */}
      {keyboardLabel && (
        <g>
          <rect
            x={width / 2 - 10}
            y={height - (isBlack ? 35 : 32)}
            width={20}
            height={16}
            rx={3}
            fill="#3b82f6"
            opacity={0.9}
          />
          <text
            x={width / 2}
            y={height - (isBlack ? 23 : 20)}
            textAnchor="middle"
            fontSize={10}
            fontWeight="bold"
            fill="#ffffff"
            pointerEvents="none"
          >
            {keyboardLabel}
          </text>
        </g>
      )}

      {/* Root indicator */}
      {isRoot && (
        <circle
          cx={width / 2}
          cy={15}
          r={4}
          fill="#ffffff"
          stroke="#991b1b"
          strokeWidth={1.5}
        />
      )}

      {/* Characteristic note indicator */}
      {isCharacteristic && !isRoot && (
        <circle
          cx={width / 2}
          cy={15}
          r={3}
          fill="#ffffff"
          stroke="#5b21b6"
          strokeWidth={1.5}
        />
      )}
    </motion.g>
  );
}
