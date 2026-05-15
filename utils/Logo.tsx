import { View, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import {
  responsiveHeight,
  responsiveWidth,
} from 'react-native-responsive-dimensions';

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
    width: responsiveWidth(18),
    height: responsiveWidth(18),
    backgroundColor: '#202652',
    top: responsiveHeight(6),
    borderRadius: responsiveWidth(5.5),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: responsiveHeight(2.5),
  },
});
