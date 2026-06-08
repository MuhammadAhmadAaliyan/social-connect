import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  responsiveHeight,
  responsiveFontSize,
  responsiveWidth,
} from 'react-native-responsive-dimensions';

import { Feather } from '@expo/vector-icons';

//SCREENS
import HomeScreen from '../components/HomeScreen';
import ProfileScreen from '../components/ProfileScreen';
import SettingScreen from '../components/SettingsScreen';
import SearchScreen from '../components/SearchScreen';

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
          sceneStyle: {
            flex: 1,
            backgroundColor: '#0F172A',
          },

          tabBarStyle: {
            backgroundColor: '#0F172A',
            borderTopColor: '#1e293b',
            borderTopWidth: responsiveWidth(0.15),
            height: responsiveHeight(10.5),
            paddingTop: responsiveHeight(1.2),
          },

          tabBarIcon: ({ color, focused }) => {
            let iconName: any;

            if (route.name === 'Home') iconName = 'home';
            else if (route.name === 'Profile') iconName = 'user';
            else if (route.name === 'Settings') iconName = 'settings';
            else if (route.name === 'Search') iconName = 'search';

            return (
              <Feather
                name={iconName}
                size={
                  focused ? responsiveFontSize(3.2) : responsiveFontSize(2.8)
                }
                color={color}
              />
            );
          },

          tabBarActiveTintColor: '#ffffff',
          tabBarInactiveTintColor: '#94a3b8',

          tabBarLabelStyle: {
            fontSize: responsiveFontSize(1.6),
            fontFamily: 'Inter-Medium',
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Search" component={SearchScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
        <Tab.Screen name="Settings" component={SettingScreen} />
      </Tab.Navigator>
    </SafeAreaView>
  );
}
