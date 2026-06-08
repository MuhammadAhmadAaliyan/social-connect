import { ActivityIndicator } from 'react-native';
import { responsiveWidth } from 'react-native-responsive-dimensions';
export default function Loading() {
  return (
    <ActivityIndicator
      size={responsiveWidth(15)}
      color={'#6366F1'}
      style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
    />
  );
}
