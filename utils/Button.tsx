import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

type InputFieldProps = {
  text: string;
  iconName: any;
  onPress: () => void;
};

export default function Button({ text, iconName, onPress }: InputFieldProps) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{text}</Text>
      <Feather name={iconName} size={30} color={'#ffffff'} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonText: {
    fontSize: 20,
    fontFamily: 'Inter',
    fontWeight: 'bold',
    color: '#ffffff',
  },
  button: {
    backgroundColor: '#6062e8',
    height: 60,
    padding: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginVertical: 20,
    gap: 15,
  },
});
