import { View, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

type InputFieldProps = {
  name: any;
  size: number;
};

export default function Logo({ name, size }: InputFieldProps) {
  return (
    <View style={styles.logo}>
      <Feather name={name} size={size} color={'#6366F1'} />
    </View>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 70,
    height: 70,
    backgroundColor: '#202652',
    top: 50,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
});
