import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';

type InputFieldProps = {
  text: string;
  iconName?: any;
  onPress: () => void;
  disabled?: boolean;
  style?: any;
};

export default function Button({
  text,
  iconName,
  onPress,
  disabled,
  style,
}: InputFieldProps) {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && { backgroundColor: '#334155' }, style]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.buttonText, disabled && { color: '#64748B' }]}>
        {text}
      </Text>
      <Feather name={iconName} size={30} color={'#ffffff'} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonText: {
    fontSize: responsiveFontSize(2.4),
    fontFamily: 'Inter',
    fontWeight: 'bold',
    color: '#ffffff',
  },

  button: {
    backgroundColor: '#6062e8',
    height: responsiveHeight(7.5),
    padding: responsiveWidth(2),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: responsiveWidth(5),
    marginVertical: responsiveHeight(2.5),
    gap: responsiveWidth(4),
  },
});
