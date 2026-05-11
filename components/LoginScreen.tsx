import * as React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

//AUTH COMPONENTS
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

//IMPORT OTHER COMPONENTS
import InputField from '../utils/InputField';
import PasswordField from '../utils/passwordField';
import Logo from '../utils/Logo';
import Button from '../utils/Button';
import StatusModal from '../utils/StatusModal';

//SCREEN TYPES
import { RootStackParamList } from '../navigation/routesType';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const LoginScreen = () => {
  //HOOKS
  const [modalVisible, setModalVisible] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [modalHeader, setModalHeader] = React.useState('');
  const [modalMessage, setModalMessage] = React.useState('');

  //YUP VALIDATION SCHEMA
  const SigninSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string()
      .min(6, 'Minimum 6 characters')
      .required('Password is required'),
  });

  //SETUP NAVIGATION
  const navigation = useNavigation<NavigationProp>();

  //METHOD FOR HANDLE LOGIN
  const logIn = async (email: string, password: string) => {
    try {
      const userCredentials = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      const { user } = userCredentials;

      if (!user.emailVerified) {
        Alert.alert('Email not verified yet!!');
        return;
      }

      setLoading(false);
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    } catch (err: any) {
      setLoading(false);
      if (err.code === 'auth/invalid-credential') {
        setModalHeader('Wrong Credentials');
        setModalMessage('Invalid email or password.');
      } else if (err.code === 'auth/network-request-failed') {
        setModalHeader('Network Error');
        setModalMessage('Please check your Internet Connection.');
      } else {
        setModalHeader('Error');
        setModalMessage('Unable to login.Try again later.');
      }
    }
  };

  return (
    <>
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/*LOGO*/}
          <Logo name={'link'} size={40} />
          {/*WELCOME TEXT */}
          <Text style={styles.welcomeText}>Welcome Back</Text>
          {/*SUBTEXT */}
          <Text style={styles.subText}>
            Sign in to continue to Social Connect.
          </Text>
          {/*SIGNUP FORM*/}

          {/*INPUTS*/}
          <Formik
            initialValues={{
              email: '',
              password: '',
            }}
            validationSchema={SigninSchema}
            onSubmit={(values) => {
              logIn(values.email, values.password);
              setLoading(true);
              setModalVisible(true);
            }}
          >
            {({
              handleBlur,
              handleChange,
              handleSubmit,
              values,
              errors,
              touched,
            }) => (
              <>
                <View style={styles.inputContainer}>
                  <Text style={styles.subText}>Email Address</Text>
                  <InputField
                    value={values.email}
                    onChangeValue={handleChange('email')}
                    onBlur={handleBlur('email')}
                    keyboardType={'email-address'}
                    placeholder={'you@example.com'}
                    iconName={'mail'}
                  />
                  {touched.email && errors.email && (
                    <Text style={{ color: 'red' }}>{errors.email}</Text>
                  )}
                </View>
                <View style={styles.inputContainer}>
                  <Text style={styles.subText}>Password</Text>
                  <PasswordField
                    value={values.password}
                    onChangeValue={handleChange('password')}
                    onBlur={handleBlur('password')}
                    keyboardType={'default'}
                    placeholder={'••••••••'}
                  />
                  {touched.password && errors.password && (
                    <Text style={{ color: 'red' }}>{errors.password}</Text>
                  )}
                </View>
                {/*FORGET PASSWORD BUTTON*/}
                <View style={styles.forgotButton}>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('ForgotPassword')}
                  >
                    <Text
                      style={[
                        styles.text,
                        { color: '#6366F1', fontWeight: 500 },
                      ]}
                    >
                      Forgot Password?
                    </Text>
                  </TouchableOpacity>
                </View>
                {/*BUTTON*/}
                <Button
                  text={'Log in'}
                  iconName={'arrow-right'}
                  onPress={handleSubmit}
                />
              </>
            )}
          </Formik>
          {/*ALREADY HAVE ACCOUNT SIGN IN*/}
          <View style={styles.textContainer}>
            <Text style={styles.text}>Doesn't have an account? </Text>

            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={[styles.text, { color: '#6366F1' }]}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
      <StatusModal
        modalVisible={modalVisible}
        loading={loading}
        modalHeader={modalHeader}
        modalMessage={modalMessage}
        onPressButton={() => setModalVisible(false)}
      />
    </>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  welcomeText: {
    fontSize: 36,
    fontFamily: 'Inter',
    fontWeight: 'bold',
    color: '#ffffff',
    paddingTop: 50,
  },
  subText: {
    fontSize: 16,
    fontFamily: 'Inter',
    color: '#7C99AE',
    paddingTop: 10,
  },
  inputContainer: { paddingBottom: 15, paddingTop: 15 },
  textContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 30,
  },
  text: {
    fontSize: 16,
    fontFamily: 'Inter',
    color: '#7C99AE',
    lineHeight: 20,
  },
  forgotButton: {
    width: '100%',
    alignItems: 'flex-end',
    paddingTop: 5,
    paddingBottom: 40,
  },
});
