/**
 * Light haptics. No-ops on desktop / when Capacitor is absent.
 */
export const Haptics = {
  vibrate(durationMs = 12): void {
    try {
      const nav = globalThis.navigator as Navigator & {
        vibrate?: (pattern: number | number[]) => boolean;
      };
      if (typeof nav.vibrate === 'function') {
        nav.vibrate(durationMs);
      }
    } catch {
      // Capacitor / browser vibration unavailable — ignore.
    }
  },
};
