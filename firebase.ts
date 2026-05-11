import { initializeApp, getApps, getApp } from 'firebase/app';

import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
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

// ✅ prevent double initialization
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage), // ✅ removes warning
});

export const db = getFirestore(app);
export const storage = getStorage(app);
