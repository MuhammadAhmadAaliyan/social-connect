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
import { useFonts } from 'expo-font';

//SCREENS
import SignupScreen from './components/SignupScreen';
import LoginScreen from './components/LoginScreen';
import ForgotPasswordScreen from './components/ForgotPasswordScreen';
import TabNavigator from './navigation/TabNavigator';
import EditProfileScreen from './components/EditProfileScreen';
import CreatePostScreen from './components/CreatePostScreen';
import ViewProfileScreen from './components/ViewProfileScreen';
import CommentScreen from './components/CommentScreen';
import MessageScreen from './components/MessageScreen';
import EditPostScreen from './components/EditPostScreen';
import PostDetailScreen from './components/PostDetailScreen';

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
      animation: 'flip',
      gestureEnabled: true,
      gestureDirection: 'horizontal',
    }}
  >
    <Stack.Screen name="MainTabs" component={TabNavigator} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    <Stack.Screen name="CreatePost" component={CreatePostScreen} />
    <Stack.Screen name="ViewProfile" component={ViewProfileScreen} />
    <Stack.Screen
      name="Comment"
      component={CommentScreen}
      options={{ animation: 'slide_from_bottom' }}
    />
    <Stack.Screen
      name="Message"
      component={MessageScreen}
      options={{ animation: 'slide_from_right' }}
    />
    <Stack.Screen name="EditPost" component={EditPostScreen} />
    <Stack.Screen name="PostDetail" component={PostDetailScreen} />
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
          regular: { fontFamily: 'Inter-Regular', fontWeight: '400' },
          medium: { fontFamily: 'Inter-Medium', fontWeight: '500' },
          bold: { fontFamily: 'Inter-Bold', fontWeight: '700' },
          heavy: { fontFamily: 'Inter-ExtraBold', fontWeight: '900' },
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
  const [fontsLoaded] = useFonts({
    'Inter-Regular': require('./assets/fonts/Inter_18pt-Regular.ttf'),
    'Inter-Medium': require('./assets/fonts/Inter_18pt-Medium.ttf'),
    'Inter-SemiBold': require('./assets/fonts/Inter_18pt-SemiBold.ttf'),
    'Inter-Bold': require('./assets/fonts/Inter_18pt-Bold.ttf'),
    'Inter-ExtraBold': require('./assets/fonts/Inter_18pt-ExtraBold.ttf'),
  });

  if (!fontsLoaded)
    return (
      <View style={{ flex: 1, backgroundColor: '#0F172A' }}>
        <Loading />
      </View>
    );

  return (
    <SafeAreaProvider style={{ flex: 1, backgroundColor: '#0F172A' }}>
      <Provider store={store}>
        <Navigation />
      </Provider>
    </SafeAreaProvider>
  );
}
