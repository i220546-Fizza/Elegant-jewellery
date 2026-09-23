import { useMemo } from 'react';
import type { Quality } from '../three/PerfumeBottle';

/**
 * Chooses the 3D rendering tier. Phones, low-core devices and data-saver users
 * get the lighter path (no transmission pass, lower resolution shadows).
 */
export const useDeviceQuality = (): Quality =>
  useMemo(() => {
    if (typeof window === 'undefined') return 'low';
    const params = new URLSearchParams(window.location.search);
    if (params.get('quality') === 'high' || params.get('quality') === 'low') return params.get('quality') as Quality;
    const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
    const small = window.matchMedia('(max-width: 767px)').matches;
    const cores = navigator.hardwareConcurrency || 4;
    if (nav.connection?.saveData) return 'low';
    if (small && cores < 8) return 'low';
    if (cores <= 2 || (nav.deviceMemory && nav.deviceMemory <= 2)) return 'low';
    return 'high';
  }, []);
