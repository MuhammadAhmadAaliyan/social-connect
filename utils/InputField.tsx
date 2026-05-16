import * as React from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';

type InputFieldProps = {
  value: string;
  onChangeValue: (text: string) => void;
  keyboardType?: any;
  onBlur?: (e: any) => void;
  placeholder?: string;
  iconName: any;
  ref?: any;
};

export default function InputField({
  value,
  onChangeValue,
  keyboardType,
  placeholder,
  iconName,
  onBlur,
  ref,
}: InputFieldProps) {
  return (
    <View style={styles.inputContainer}>
      <Feather
        name={iconName}
        size={20}
        color={'#94a3b8'}
        style={styles.icon}
      />
      <TextInput
        ref={ref}
        value={value}
        onChangeText={onChangeValue}
        style={styles.input}
        keyboardType={keyboardType}
        placeholder={placeholder}
        onBlur={onBlur}
        placeholderTextColor={'rgba(148, 163, 184, 0.3)'}
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
    justifyContent: 'center',
    paddingHorizontal: responsiveWidth(3),
    gap: responsiveWidth(2.5),
  },

  icon: {
    alignSelf: 'center',
  },

  input: {
    flex: 1,
    fontSize: responsiveFontSize(2),
    color: '#ffffff',
  },
});
