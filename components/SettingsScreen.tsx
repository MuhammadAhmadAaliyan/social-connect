import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SettingsScreen = () => {
  return (
    <SafeAreaView
      style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
    >
      <Text style={{ fontSize: 30, fontWeight: 'bold' }}>Setting Screen</Text>
    </SafeAreaView>
  );
};

export default SettingsScreen;
