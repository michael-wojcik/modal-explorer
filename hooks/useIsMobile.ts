'use client';

import { useMediaQuery } from './useMediaQuery';

/**
 * Convenience hook to detect if the device is mobile
 * Uses Tailwind's 'md' breakpoint (768px) as the threshold
 *
 * @returns boolean - true if screen width is less than 768px
 *
 * @example
 * const isMobile = useIsMobile();
 *
 * return (
 *   <div>
 *     {isMobile ? <MobileNav /> : <DesktopNav />}
 *   </div>
 * );
 */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)');
}

/**
 * Hook to detect if the device is tablet-sized
 * Matches screens between 768px and 1024px
 *
 * @returns boolean - true if screen width is between 768px and 1024px
 */
export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
}

/**
 * Hook to detect if the device is desktop-sized
 * Matches screens 1024px and larger
 *
 * @returns boolean - true if screen width is 1024px or larger
 */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)');
}
