'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/lib/store';

export function SustainPedalEffect() {
  const { sustainPedal } = useStore();

  return (
    <AnimatePresence mode="wait">
      {sustainPedal && (
        <motion.div
          key="sustain-effect"
          className="pointer-events-none fixed inset-0 z-15"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Golden ambient glow at piano location */}
          <motion.div
            className="absolute"
            style={{
              left: '50%',
              top: '55%',
              transform: 'translate(-50%, -50%)',
              width: '80%',
              height: 200,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(245, 158, 11, 0.1), transparent)',
              }}
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
