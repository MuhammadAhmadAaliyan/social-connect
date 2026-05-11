import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';

export default function AuthGate({ navigation }: any) {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigation.replace('MainTabs');
      } else {
        navigation.replace('Login');
      }
    });

    return unsubscribe;
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0F172A',
      }}
    >
      <ActivityIndicator size="large" color="#fff" />
    </View>
  );
}
