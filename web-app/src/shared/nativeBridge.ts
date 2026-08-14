import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Toast } from '@capacitor/toast';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Network } from '@capacitor/network';
import { App } from '@capacitor/app';

export const isNative = Capacitor.isNativePlatform();

// ── Native Haptics ──
export const triggerHaptic = async (style: 'light' | 'medium' | 'heavy' = 'light') => {
  if (!isNative) return;
  try {
    const impactMap = {
      light: ImpactStyle.Light,
      medium: ImpactStyle.Medium,
      heavy: ImpactStyle.Heavy,
    };
    await Haptics.impact({ style: impactMap[style] });
  } catch (e) {
    console.debug('Haptics not available:', e);
  }
};

export const triggerHapticNotification = async (type: 'success' | 'warning' | 'error' = 'success') => {
  if (!isNative) return;
  try {
    const typeMap = {
      success: NotificationType.Success,
      warning: NotificationType.Warning,
      error: NotificationType.Error,
    };
    await Haptics.notification({ type: typeMap[type] });
  } catch (e) {
    console.debug('Haptics notification not available:', e);
  }
};

// ── Native Toast ──
export const showNativeToast = async (text: string, duration: 'short' | 'long' = 'short') => {
  if (isNative) {
    try {
      await Toast.show({ text, duration });
    } catch {
      console.log(`[Toast] ${text}`);
    }
  }
};

// ── Native Status Bar Theme Styling ──
export const updateNativeStatusBar = async (themeName: string) => {
  if (!isNative) return;
  try {
    if (themeName === 'light') {
      await StatusBar.setStyle({ style: Style.Light });
      await StatusBar.setBackgroundColor({ color: '#FFFFFF' });
    } else if (themeName === 'cyberpunk') {
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: '#12042C' });
    } else if (themeName === 'synthwave') {
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: '#0A0516' });
    } else {
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: '#07050F' });
    }
  } catch (e) {
    console.debug('StatusBar update error:', e);
  }
};

// ── Initialize Native Hardware & Lifecycle Listeners ──
export const initNativeListeners = (onHardwareBack?: () => void, onAppResume?: () => void) => {
  if (!isNative) return;

  // Listen to hardware back button on Android
  App.addListener('backButton', () => {
    if (onHardwareBack) {
      onHardwareBack();
    } else {
      App.minimizeApp();
    }
  });

  // Listen to App Resume / Reopen from background
  App.addListener('appStateChange', (state) => {
    if (state.isActive) {
      onAppResume?.();
    }
  });

  // Listen to network status changes
  Network.addListener('networkStatusChange', status => {
    if (!status.connected) {
      showNativeToast('Offline mode — changes cached locally', 'long');
    } else {
      showNativeToast('Connected to network', 'short');
    }
  });
};
