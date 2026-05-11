import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

//SCREENS
import SignupScreen from './components/SignupScreen';
import LoginScreen from './components/LoginScreen';
import ForgotPasswordScreen from './components/ForgotPasswordScreen';
import TabNavigator from './navigation/TabNavigator';
import EditProfileScreen from './components/ProfileEditScreen';
import CreatePostScreen from './components/CreatePostScreen';
import ViewProfileScreen from './components/ViewProfileScreen';

//SCREEN TYPES
import { RootStackParamList } from './navigation/routesType';

//STACK NAVIGATOR
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  // useEffect(() => {
  //   const unsubscribe = auth.onAuthStateChanged((user: any) => {
  //     if (user) {
  //       console.log('✅ Persistence working - User:', user.uid);
  //     } else {
  //       console.log('❌ No user found');
  //     }
  //   });
  //   return unsubscribe;
  // }, []); // wait for auth to resolve

  return (
    <SafeAreaView
      style={{ flex: 1 }}
      edges={{ top: 'off', bottom: 'additive' }}
    >
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            contentStyle: { flex: 1, backgroundColor: '#0F172A' },
          }}
          initialRouteName="Login"
        >
          {/*AUTH SCREENS*/}
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPasswordScreen}
          />

          {/*MAIN SCREENS*/}
          <Stack.Screen name="MainTabs" component={TabNavigator} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen name="CreatePost" component={CreatePostScreen} />
          <Stack.Screen name="ViewProfile" component={ViewProfileScreen} />
        </Stack.Navigator>
        <StatusBar style="light" />
      </NavigationContainer>
    </SafeAreaView>
  );
}

//TODO:
//create post screen
//Enable like and unlike system
//Comments screen
