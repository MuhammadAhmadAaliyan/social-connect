import * as React from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';

type InputFieldProps = {
  value: string;
  onChangeValue: (text: string) => void;
  keyboardType?: any;
  placeholder?: string;
  onBlur?: (e: any) => void;
};

export default function PasswordField({
  value,
  onChangeValue,
  keyboardType,
  placeholder,
  onBlur,
}: InputFieldProps) {
  const [ispasswordVisible, setPasswordVisible] =
    React.useState<boolean>(false);

  //HANDLING EYE BUTTON
  const handlePassword = () => {
    setPasswordVisible(!ispasswordVisible);
  };

  return (
    <View style={styles.inputContainer}>
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10 }}>
        <Feather
          name={'lock'}
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
    marginTop: 10,
    height: 50,
    borderWidth: 0.5,
    borderColor: '#7C99AE',
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  icon: { alignSelf: 'center' },
  input: {
    flexGrow: 1,
    fontSize: 16,
    color: '#ffffff',
    width: '82%',
  },
});
