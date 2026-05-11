import { Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

type InputFieldProps = {
  onPress: () => void;
};

export default function BackButton({ onPress }: InputFieldProps) {
  return (
    <Pressable style={styles.backButton} onPress={onPress}>
      <Feather name={'arrow-left'} size={30} color={'#ffffff'} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backButton: {
    backgroundColor: '#1e293b',
    borderWidth: 0.5,
    borderColor: '#7C99AE',
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
