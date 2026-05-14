import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Feather } from '@expo/vector-icons';

//SCREENS
import HomeScreen from '../components/HomeScreen';
import ProfileScreen from '../components/ProfileScreen';
import SettingScreen from '../components/SettingsScreen';

//SCREEN TYPES
import { TabParamList } from './routesType';

const Tab = createBottomTabNavigator<TabParamList>();

export default function TabNavigator() {
  return (
    <SafeAreaView
      style={{ flex: 1 }}
      edges={{ top: 'off', bottom: 'additive' }}
    >
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          sceneStyle: { flex: 1, backgroundColor: '#0F172A' },
          tabBarStyle: {
            backgroundColor: '#0F172A',
            borderTopColor: '#1e293b',
            borderTopWidth: 0.6,
            height: 75,
            paddingTop: 10,
          },
          tabBarIcon: ({ color, focused }) => {
            let iconName: any;

            if (route.name === 'Home') iconName = 'home';
            else if (route.name === 'Profile') iconName = 'user';
            else if (route.name === 'Settings') iconName = 'settings';

            return (
              <Feather name={iconName} size={focused ? 26 : 22} color={color} />
            );
          },

          tabBarActiveTintColor: '#ffffff',
          tabBarInactiveTintColor: '#94a3b8',
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
        <Tab.Screen name="Settings" component={SettingScreen} />
      </Tab.Navigator>
    </SafeAreaView>
  );
}
