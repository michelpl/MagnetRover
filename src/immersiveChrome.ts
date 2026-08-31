import { Capacitor, SystemBars, SystemBarsStyle, SystemBarType } from '@capacitor/core';

/** Hide the Android nav buttons; keep drawing edge-to-edge under the status bar / cutout. */
export async function applyImmersiveChrome(): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    await SystemBars.setStyle({ style: SystemBarsStyle.Dark });
    await SystemBars.hide({ bar: SystemBarType.NavigationBar });
  } catch (error) {
    console.warn('System bars immersive mode failed', error);
  }
}
