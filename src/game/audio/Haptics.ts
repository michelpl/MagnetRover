import { Capacitor } from '@capacitor/core';
import { Save } from '../save/Save';

/**
 * Light haptics via Capacitor on native builds. Web skips vibration.
 */
export const Haptics = {
  vibrate(durationMs = 12): void {
    if (!Capacitor.isNativePlatform() || !Save.load().hapticsEnabled) {
      return;
    }
    void Haptics.vibrateAsync(durationMs);
  },

  async vibrateAsync(_durationMs = 12): Promise<void> {
    try {
      const { Haptics: CapHaptics, ImpactStyle } = await import('@capacitor/haptics');
      await CapHaptics.impact({ style: ImpactStyle.Light });
    } catch {
      // Haptics unavailable — ignore.
    }
  },
};
