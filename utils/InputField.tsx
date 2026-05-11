import * as React from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';

type InputFieldProps = {
  value: string;
  onChangeValue: (text: string) => void;
  keyboardType?: any;
  onBlur?: (e: any) => void;
  placeholder?: string;
  iconName: any;
};

export default function InputField({
  value,
  onChangeValue,
  keyboardType,
  placeholder,
  iconName,
  onBlur,
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
    //flex: 1,
    backgroundColor: '#1e293b',
    marginTop: 10,
    height: 50,
    borderWidth: 0.5,
    borderColor: '#7C99AE',
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 10,
    gap: 10,
  },
  icon: { alignSelf: 'center' },
  input: { flex: 1, fontSize: 16, color: '#ffffff' },
});
