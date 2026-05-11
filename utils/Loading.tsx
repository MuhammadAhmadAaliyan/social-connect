import { ActivityIndicator } from 'react-native';

export default function Loading() {
  return (
    <ActivityIndicator
      size={60}
      color={'#6366F1'}
      style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
    />
  );
}
