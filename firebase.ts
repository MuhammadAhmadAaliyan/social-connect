import { initializeApp, getApps } from 'firebase/app';

import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyCWwUVGyiNn6HojruTc3KZMzbdhf22EQZU',
  authDomain: 'social-connect-d2f0d.firebaseapp.com',
  projectId: 'social-connect-d2f0d',
  storageBucket: 'social-connect-d2f0d.firebasestorage.app',
  messagingSenderId: '89090634773',
  appId: '1:89090634773:web:69dc7d5f6ccbdab1fb8a1c',
};

//PREVENT DOUBLE INITIALIZATION
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = initializeFirestore(app, {
  localCache: persistentLocalCache(),
});
export const storage = getStorage(app);
