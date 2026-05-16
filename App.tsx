import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider, useDispatch } from 'react-redux';
import { store } from './redux/store';
import { auth } from './firebase';
import { fetchCurrentUser, clearCurrentUser } from './redux/slices/userSlice';
import { AppDispatch } from './redux/store';
import * as Notifications from 'expo-notifications';

//SCREENS
import SignupScreen from './components/SignupScreen';
import LoginScreen from './components/LoginScreen';
import ForgotPasswordScreen from './components/ForgotPasswordScreen';
import TabNavigator from './navigation/TabNavigator';
import EditProfileScreen from './components/ProfileEditScreen';
import CreatePostScreen from './components/CreatePostScreen';
import ViewProfileScreen from './components/ViewProfileScreen';
import CommentScreen from './components/CommentScreen';

//OTHER COMPONENTS
import Loading from './utils/Loading';

//NOTIFICATION COMPONENT
import { registerForPushNotifications } from './utils/registerPushNotifications';

//SCREEN TYPES
import { RootStackParamList } from './navigation/routesType';

//HANDLE NOTIFICATIONS
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const Stack = createNativeStackNavigator<RootStackParamList>();

const AuthNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      contentStyle: { flex: 1, backgroundColor: '#0F172A' },
      animation: 'ios_from_right',
      gestureEnabled: true,
      gestureDirection: 'horizontal',
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Signup" component={SignupScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </Stack.Navigator>
);

const AppNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      contentStyle: { flex: 1, backgroundColor: '#0F172A' },
      animation: 'fade',
      gestureEnabled: true,
      gestureDirection: 'horizontal',
    }}
  >
    <Stack.Screen name="MainTabs" component={TabNavigator} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    <Stack.Screen name="CreatePost" component={CreatePostScreen} />
    <Stack.Screen name="ViewProfile" component={ViewProfileScreen} />
    <Stack.Screen name="Comment" component={CommentScreen} />
  </Stack.Navigator>
);

// NAVIGATION COMPONENT HANDLING AUTH STATE
const Navigation = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [user, setUser] = useState<any>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser && firebaseUser.emailVerified) {
        setUser(firebaseUser);
        await dispatch(fetchCurrentUser(firebaseUser.uid));
        try {
          await registerForPushNotifications(firebaseUser.uid);
        } catch (err) {
          console.log('Push notification error:', err);
        }
      } else {
        setUser(null);
        dispatch(clearCurrentUser());
      }
      setAuthReady(true);
    });
    return unsubscribe;
  }, []);

  if (!authReady)
    return (
      <View style={{ flex: 1, backgroundColor: '#0F172A' }}>
        <Loading />
      </View>
    );

  return (
    <NavigationContainer
      theme={{
        dark: true,
        fonts: {
          regular: { fontFamily: 'Inter', fontWeight: '400' },
          medium: { fontFamily: 'Inter', fontWeight: '500' },
          bold: { fontFamily: 'Inter', fontWeight: '700' },
          heavy: { fontFamily: 'Inter', fontWeight: '900' },
        },
        colors: {
          background: '#0F172A',
          primary: '#ffffff',
          card: '#0F172A',
          text: '#ffffff',
          border: '#1E293B',
          notification: '#ffffff',
        },
      }}
    >
      {user ? <AppNavigator /> : <AuthNavigator />}
      <StatusBar style="light" />
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <SafeAreaProvider style={{ flex: 1, backgroundColor: '#0F172A' }}>
      <Provider store={store}>
        <Navigation />
      </Provider>
    </SafeAreaProvider>
  );
}
