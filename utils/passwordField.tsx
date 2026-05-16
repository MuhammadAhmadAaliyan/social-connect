import * as React from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import {
  responsiveHeight,
  responsiveFontSize,
  responsiveWidth,
} from 'react-native-responsive-dimensions';

type InputFieldProps = {
  value: string;
  onChangeValue: (text: string) => void;
  keyboardType?: any;
  placeholder?: string;
  onBlur?: (e: any) => void;
  ref?: any;
  onFocus?: () => void;
};

export default function PasswordField({
  value,
  onChangeValue,
  keyboardType,
  placeholder,
  onBlur,
  ref,
  onFocus,
}: InputFieldProps) {
  const [ispasswordVisible, setPasswordVisible] =
    React.useState<boolean>(false);

  //HANDLING EYE BUTTON
  const handlePassword = () => {
    setPasswordVisible(!ispasswordVisible);
  };

  return (
    <View style={styles.inputContainer}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          gap: responsiveWidth(2.5),
        }}
      >
        <Feather
          name={'lock'}
          size={20}
          color={'#94a3b8'}
          style={styles.icon}
        />
        <TextInput
          ref={ref}
          onFocus={onFocus}
          value={value}
          onChangeText={onChangeValue}
          style={styles.input}
          keyboardType={keyboardType}
          placeholder={placeholder}
          onBlur={onBlur}
          placeholderTextColor={'rgba(148, 163, 184, 0.3)'}
          secureTextEntry={!ispasswordVisible}
        />
      </View>
      <Feather
        name={ispasswordVisible ? 'eye-off' : 'eye'}
        size={20}
        color={'#94a3b8'}
        style={styles.icon}
        onPress={handlePassword}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    backgroundColor: '#1e293b',
    marginTop: responsiveHeight(1.2),
    height: responsiveHeight(6.5),
    borderWidth: responsiveWidth(0.1),
    borderColor: '#7C99AE',
    borderRadius: responsiveWidth(4),
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: responsiveWidth(3),
  },

  icon: {
    alignSelf: 'center',
  },

  input: {
    flexGrow: 1,
    fontSize: responsiveFontSize(2),
    color: '#ffffff',
    width: '82%',
  },
});
