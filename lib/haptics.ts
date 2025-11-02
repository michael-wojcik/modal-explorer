/**
 * Haptic Feedback Utility
 * Provides tactile feedback on supported mobile devices using the Vibration API
 */

/**
 * Trigger a light haptic tap (for UI interactions)
 */
export function hapticLight() {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(10); // 10ms light tap
  }
}

/**
 * Trigger a medium haptic tap (for note plays)
 */
export function hapticMedium() {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(20); // 20ms medium tap
  }
}

/**
 * Trigger a strong haptic tap (for important actions)
 */
export function hapticStrong() {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(40); // 40ms strong tap
  }
}

/**
 * Trigger a custom vibration pattern
 * @param pattern Array of vibration durations in ms (e.g., [100, 50, 100] = vibrate-pause-vibrate)
 */
export function hapticPattern(pattern: number[]) {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
}

/**
 * Check if haptic feedback is supported
 */
export function isHapticSupported(): boolean {
  return typeof window !== 'undefined' && 'vibrate' in navigator;
}
