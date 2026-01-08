import { useState, useEffect } from 'react';

/**
 * Hook to detect if a media query matches
 * @param {string} query - CSS media query string (e.g., '(min-width: 768px)')
 * @returns {boolean} - True if media query matches
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    const handleChange = (e) => setMatches(e.matches);

    // Set initial value
    setMatches(mediaQuery.matches);

    // Listen for changes
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
}

/**
 * Hook to detect if viewport is mobile (< 768px)
 */
export function useIsMobile() {
  return useMediaQuery('(max-width: 767px)');
}

/**
 * Hook to detect if viewport is tablet (768px - 1023px)
 */
export function useIsTablet() {
  return useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
}

/**
 * Hook to detect if viewport is desktop (>= 1024px)
 */
export function useIsDesktop() {
  return useMediaQuery('(min-width: 1024px)');
}

/**
 * Hook to get current breakpoint name
 * @returns {'mobile' | 'tablet' | 'desktop'}
 */
export function useBreakpoint() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  if (isMobile) return 'mobile';
  if (isTablet) return 'tablet';
  return 'desktop';
}
