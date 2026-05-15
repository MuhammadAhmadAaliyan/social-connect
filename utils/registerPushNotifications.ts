import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const registerForPushNotifications = async (userId: string) => {
  if (!Device.isDevice) return;

  //REQUIRED FOR ANDROID
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return;

  //REQUIRED: projectId
  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ??
    Constants?.easConfig?.projectId;

  if (!projectId) {
    console.log('Project ID not found');
    return;
  }

  // PASS projectId WHEN GETTING TOKEN
  const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  console.log('PUSH TOKEN:', token);

  await updateDoc(doc(db, 'users', userId), {
    pushToken: token,
  });
};
