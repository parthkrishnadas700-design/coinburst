import { LocalNotifications, type ScheduleOptions } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { triggerHapticNotification, showNativeToast } from './nativeBridge';

export const isNative = Capacitor.isNativePlatform();

// Keep track of web interval timer ID
let webIntervalTimerId: any = null;

// Ensure Android notification channel is registered with custom sound resource
export const initNotificationChannel = async () => {
  if (!isNative) return;
  try {
    // Delete legacy channels so Android OS refreshes channel sound settings
    try {
      await LocalNotifications.deleteChannel({ id: 'coinburst_alerts' });
      await LocalNotifications.deleteChannel({ id: 'coinburst_v2_sound' });
    } catch {}

    await LocalNotifications.createChannel({
      id: 'coinburst_v3_sound',
      name: 'CoinBurst Audio Alerts',
      description: 'Budget alerts, transaction notifications, low money warnings, and recurring summaries',
      importance: 5, // High importance (heads up notification banner)
      visibility: 1,
      sound: 'notification.wav',
      vibration: true,
      lights: true,
      lightColor: '#00FF88',
    });
  } catch (e) {
    console.debug('Notification channel initialization warning:', e);
  }
};

// ── Request Notification Permissions ──
export const requestNotificationPermissions = async (): Promise<boolean> => {
  if (isNative) {
    try {
      const status = await LocalNotifications.requestPermissions();
      if (status.display === 'granted') {
        await initNotificationChannel();
        showNativeToast('Notifications & alert sounds enabled!', 'short');
        return true;
      }
      return false;
    } catch (e) {
      console.error('Error requesting native notification permissions:', e);
      return false;
    }
  } else {
    // Web Browser Notifications API
    if (!('Notification' in window)) {
      console.warn('Web notifications are not supported in this browser.');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }
};

// ── Check Current Permission Status ──
export const checkNotificationPermissions = async (): Promise<boolean> => {
  if (isNative) {
    try {
      const status = await LocalNotifications.checkPermissions();
      return status.display === 'granted';
    } catch {
      return false;
    }
  } else {
    return typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted';
  }
};

// Helper to play web notification sound
const playWebNotificationSound = () => {
  try {
    const audio = new Audio('/sounds/notification.mp3');
    audio.volume = 0.7;
    audio.play().catch(() => {
      const wavAudio = new Audio('/sounds/notification.wav');
      wavAudio.volume = 0.7;
      wavAudio.play().catch(() => {
        const fallbackAudio = new Audio('https://assets.mixkit.co/active_storage/sfx/2017/2017-84.wav');
        fallbackAudio.volume = 0.5;
        fallbackAudio.play().catch(() => {});
      });
    });
  } catch {}
};

// ── Send Immediate Local Notification ──
export interface LocalNotificationOptions {
  id?: number;
  title: string;
  body: string;
  extra?: Record<string, any>;
  smallIcon?: string;
}

export const sendLocalNotification = async ({
  id = Math.floor(Math.random() * 100000),
  title,
  body,
  extra = {},
}: LocalNotificationOptions) => {
  try {
    await triggerHapticNotification('success');
    // Play audio sound chime in parallel for instant feedback!
    playWebNotificationSound();

    if (isNative) {
      const hasPermission = await checkNotificationPermissions();
      if (!hasPermission) {
        const granted = await requestNotificationPermissions();
        if (!granted) {
          showNativeToast(`[Alert] ${title}: ${body}`, 'long');
          return;
        }
      }

      await LocalNotifications.schedule({
        notifications: [
          {
            id,
            title,
            body,
            channelId: 'coinburst_v3_sound',
            schedule: { at: new Date(Date.now() + 100) }, // Trigger immediately (100ms)
            sound: 'notification.wav',
            extra,
            actionTypeId: '',
            largeBody: body,
            summaryText: 'CoinBurst Alert',
          },
        ],
      });
    } else {
      // Web Notification Fallback
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
          body,
          icon: '/assets/coinburst_logo.png',
          badge: '/assets/coinburst_logo.png',
          tag: 'coinburst-alert-' + id,
          data: extra,
        });
      } else {
        // Fallback UI toast
        showNativeToast(`${title} — ${body}`, 'long');
      }
    }
  } catch (err) {
    console.error('Failed to send local notification:', err);
  }
};

// ── Specialized Financial Alert Functions (Currency-Aware) ──

// 1. Budget Exceeded / Warning Notification (Formatted in user's active currency)
export const notifyBudgetAlert = async (
  categoryName: string,
  spent: number,
  limit: number,
  currencySymbol: string = '$'
) => {
  const percent = Math.round((spent / limit) * 100);
  const formattedSpent = `${currencySymbol}${spent.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  const formattedLimit = `${currencySymbol}${limit.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  if (percent >= 100) {
    await sendLocalNotification({
      id: 88801 + Math.floor(Math.random() * 100),
      title: `🚨 Budget Exceeded: ${categoryName}`,
      body: `You've spent ${formattedSpent} of your ${formattedLimit} budget (${percent}%).`,
      extra: { type: 'budget_exceeded', categoryName },
    });
  } else if (percent >= 80) {
    await sendLocalNotification({
      id: 88802 + Math.floor(Math.random() * 100),
      title: `⚠️ Budget Warning: ${categoryName}`,
      body: `You're at ${percent}% of your ${categoryName} budget (${formattedSpent} / ${formattedLimit}).`,
      extra: { type: 'budget_warning', categoryName },
    });
  }
};

// 2. High Expense / Transaction Notification (Formatted in user's active currency)
export const notifyHighExpense = async (
  title: string,
  amount: number,
  currencySymbol: string = '$'
) => {
  if (amount >= 300) {
    const formattedAmount = `${currencySymbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    await sendLocalNotification({
      id: 77701 + Math.floor(Math.random() * 100),
      title: `💸 Large Expense Logged`,
      body: `${title}: ${formattedAmount} recorded.`,
      extra: { type: 'high_expense', amount },
    });
  }
};

// 3. Low Money / Low Balance Alert Notification (Formatted in user's active currency)
export const notifyLowBalance = async (
  totalBalance: number,
  threshold: number,
  currencySymbol: string = '$'
) => {
  const formattedBalance = `${currencySymbol}${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  const formattedThreshold = `${currencySymbol}${threshold.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  await sendLocalNotification({
    id: 66601 + Math.floor(Math.random() * 100),
    title: `🚨 Low Money Warning!`,
    body: `Your total funds dropped to ${formattedBalance} (below set limit of ${formattedThreshold}).`,
    extra: { type: 'low_balance', totalBalance, threshold },
  });
};

// 4. Default 1-Hour (or Custom Interval) Recurring Notification Scheduler
export const scheduleIntervalFinanceReminder = async (intervalHours: number = 1) => {
  if (isNative) {
    try {
      const hasPermission = await checkNotificationPermissions();
      if (!hasPermission) await requestNotificationPermissions();

      // Cancel existing scheduled interval reminder id 99998
      await LocalNotifications.cancel({ notifications: [{ id: 99998 }] });

      const nextTrigger = new Date(Date.now() + intervalHours * 3600 * 1000);

      const options: ScheduleOptions = {
        notifications: [
          {
            id: 99998,
            title: `⏰ CoinBurst Hourly Check-In`,
            body: `Hourly financial sync active! Review your balances and recent expenses.`,
            channelId: 'coinburst_v3_sound',
            sound: 'notification.wav',
            schedule: {
              at: nextTrigger,
              repeats: true,
              every: 'hour',
            },
          },
        ],
      };

      await LocalNotifications.schedule(options);
      showNativeToast(`Notification timer active: Every ${intervalHours} hour(s)`, 'short');
    } catch (err) {
      console.error('Failed to schedule interval notification:', err);
    }
  } else {
    // Web Fallback Timer
    if (webIntervalTimerId) clearInterval(webIntervalTimerId);
    console.log(`[Web] Recurring notification timer activated: Every ${intervalHours} hour(s)`);

    const intervalMs = intervalHours * 3600 * 1000;
    webIntervalTimerId = setInterval(() => {
      sendLocalNotification({
        id: 99998,
        title: `⏰ CoinBurst Hourly Check-In`,
        body: `Hourly financial sync active! Review your balances and recent expenses.`,
      });
    }, intervalMs);

    showNativeToast(`Notification timer set: Every ${intervalHours} hour(s)`, 'short');
  }
};

// 5. Daily Specific Time Scheduled Reminder (HH:MM)
export const scheduleDailyFinanceReminder = async (hour: number = 20, minute: number = 0) => {
  if (!isNative) {
    console.log(`[Web] Daily reminder set for ${hour}:${minute < 10 ? '0' : ''}${minute}`);
    return;
  }

  try {
    const hasPermission = await checkNotificationPermissions();
    if (!hasPermission) await requestNotificationPermissions();

    // Cancel existing scheduled reminder id 99999
    await LocalNotifications.cancel({ notifications: [{ id: 99999 }] });

    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hour, minute, 0, 0);

    if (scheduledTime.getTime() <= now.getTime()) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const options: ScheduleOptions = {
      notifications: [
        {
          id: 99999,
          title: '📊 Daily Financial Check-In',
          body: 'Take 30 seconds to log today\'s transactions and review your daily balance.',
          channelId: 'coinburst_v3_sound',
          sound: 'notification.wav',
          schedule: {
            at: scheduledTime,
            repeats: true,
            every: 'day',
          },
        },
      ],
    };

    await LocalNotifications.schedule(options);
    showNativeToast(`Daily reminder scheduled for ${hour}:${minute < 10 ? '0' : ''}${minute}`, 'short');
  } catch (err) {
    console.error('Failed to schedule daily reminder:', err);
  }
};

// ── Initialize Native Listeners for Local Notifications ──
export const initLocalNotificationListeners = (onNotificationClick?: (extra: any) => void) => {
  if (!isNative) return;

  try {
    LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
      console.log('Notification tapped:', notification.notification);
      if (onNotificationClick) {
        onNotificationClick(notification.notification.extra);
      }
    });
  } catch (e) {
    console.debug('Could not bind notification action listener:', e);
  }
};
