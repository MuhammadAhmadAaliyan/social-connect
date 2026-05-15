import { Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { responsiveWidth } from 'react-native-responsive-dimensions';

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
    borderWidth: responsiveWidth(0.1),
    borderColor: '#7C99AE',
    width: responsiveWidth(13),
    height: responsiveWidth(13),
    borderRadius: responsiveWidth(4),
    justifyContent: 'center',
    alignItems: 'center',
  },
});
