import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from './supabase';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  if (!Device.isDevice) {
    console.log('Must use physical device for Push Notifications');
    return undefined;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification!');
    return undefined;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF9966',
    });
  }

  return token;
}

export async function savePushToken(userId: string, token: string) {
  try {
    const { error } = await supabase
      .from('user_devices')
      .upsert({
        user_id: userId,
        expo_push_token: token,
        platform: Platform.OS as 'ios' | 'android' | 'web',
        last_seen_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error saving push token:', error);
    }
  } catch (err) {
    console.error('Exception saving push token:', err);
  }
}

export function setupNotificationListeners(
  handleNotification: (notification: Notifications.Notification) => void,
  handleResponse: (response: Notifications.NotificationResponse) => void
) {
  const notificationListener = Notifications.addNotificationReceivedListener(handleNotification);
  const responseListener = Notifications.addNotificationResponseReceivedListener(handleResponse);

  return () => {
    Notifications.removeNotificationSubscription(notificationListener);
    Notifications.removeNotificationSubscription(responseListener);
  };
}

