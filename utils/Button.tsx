import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';

type InputFieldProps = {
  text: string;
  iconName1?: any;
  iconName2?: any;
  onPress: () => void;
  disabled?: boolean;
  style?: any;
  size?: number;
};

export default function Button({
  text,
  iconName1,
  iconName2,
  onPress,
  disabled,
  style,
  size = 30,
}: InputFieldProps) {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && { backgroundColor: '#334155' }, style]}
      onPress={onPress}
      disabled={disabled}
    >
      {iconName1 && <Feather name={iconName1} size={size} color={'#ffffff'} />}
      <Text style={[styles.buttonText, disabled && { color: '#64748B' }]}>
        {text}
      </Text>
      {iconName2 && <Feather name={iconName2} size={size} color={'#ffffff'} />}
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
