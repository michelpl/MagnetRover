/**
 * Light haptics via Capacitor on native builds; navigator.vibrate on web (US-036).
 */
export const Haptics = {
  vibrate(durationMs = 12): void {
    void Haptics.vibrateAsync(durationMs);
  },

  async vibrateAsync(durationMs = 12): Promise<void> {
    try {
      const cap = (globalThis as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
      if (cap?.isNativePlatform?.()) {
        const { Haptics: CapHaptics, ImpactStyle } = await import('@capacitor/haptics');
        await CapHaptics.impact({ style: ImpactStyle.Light });
        return;
      }
      const nav = globalThis.navigator as Navigator & {
        vibrate?: (pattern: number | number[]) => boolean;
      };
      if (typeof nav.vibrate === 'function') {
        nav.vibrate(durationMs);
      }
    } catch {
      // Haptics unavailable — ignore.
    }
  },
};
