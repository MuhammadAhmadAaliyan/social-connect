import * as React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

//AUTH COMPONENTS
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
} from 'firebase/auth';
import { auth } from '../firebase';
import { db } from '../firebase';
import { setDoc, doc } from 'firebase/firestore';

//IMPORT OTHER COMPONENTS
import InputField from '../utils/InputField';
import PasswordField from '../utils/passwordField';
import Logo from '../utils/Logo';
import Button from '../utils/Button';
import StatusModal from '../utils/StatusModal';

//SCREEN TYPES
import { RootStackParamList } from '../navigation/routesType';

type navigationProp = NativeStackNavigationProp<RootStackParamList>;

const SignupScreen = () => {
  //HOOKS
  const [modalVisible, setModalVisible] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [modalHeader, setModalHeader] = React.useState('');
  const [modalMessage, setModalMessage] = React.useState('');

  //YUP VALIDATION SCHEMA
  const SignupSchema = Yup.object().shape({
    fullName: Yup.string().required('Full name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string()
      .min(8, 'Minimum 6 characters')
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')], 'Passwords must match')
      .required('Confirm your password'),
  });

  //SETUP NAVIGATION
  const navigation = useNavigation<navigationProp>();

  //MEHTHOD FOR HANDLE SIGNUP
  const signUp = async (fullName: string, email: string, password: string) => {
    try {
      const userCredentials = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      const { user } = userCredentials;

      await Promise.all([
        updateProfile(user, {
          displayName: fullName,
        }),

        setDoc(doc(db, 'users', user.uid), {
          username: fullName,
          email: user.email,
          bio: '',
          userImage: '',
        }),
      ]);

      sendEmailVerification(user);

      setModalHeader('Verfiy Your Email');
      setModalMessage(
        'We’ve sent a verification link to your email. Please check your inbox and verify your account.',
      );
      setLoading(false);
    } catch (err: any) {
      setLoading(false);
      if (err.code === 'auth/email-already-in-use') {
        setModalHeader('Error');
        setModalMessage(
          'The email you are trying to register is already used by another account.',
        );
      } else if (err.code === 'auth/network-request-failed') {
        setModalHeader('Network Error');
        setModalMessage('Please check your Internet Connection.');
      } else {
        setModalHeader('Error');
        setModalMessage('Unable to create account.Try again later.');
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
          <Text style={styles.welcomeText}>Social Connect</Text>
          {/*SUBTEXT */}
          <Text style={styles.subText}>
            Create an account to join the network.
          </Text>
          {/*SIGNUP FORM*/}

          {/*INPUTS*/}
          <Formik
            initialValues={{
              fullName: '',
              email: '',
              password: '',
              confirmPassword: '',
            }}
            validationSchema={SignupSchema}
            onSubmit={(values) => {
              signUp(values.fullName, values.email, values.password);
              setLoading(true);
              setModalVisible(true);
            }}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
            }) => (
              <>
                <View style={styles.inputContainer}>
                  <Text style={styles.subText}>Full Name</Text>
                  <InputField
                    value={values.fullName}
                    onChangeValue={handleChange('fullName')}
                    onBlur={handleBlur('fullName')}
                    keyboardType={'default'}
                    placeholder={'John Doe'}
                    iconName={'user'}
                  />
                  {touched.fullName && errors.fullName && (
                    <Text style={{ color: 'red' }}>{errors.fullName}</Text>
                  )}
                </View>
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
                <View style={styles.inputContainer}>
                  <Text style={styles.subText}>Confirm Password</Text>
                  <PasswordField
                    value={values.confirmPassword}
                    onChangeValue={handleChange('confirmPassword')}
                    onBlur={handleBlur('confirmPassword')}
                    keyboardType={'default'}
                    placeholder={'••••••••'}
                  />
                  {touched.confirmPassword && errors.confirmPassword && (
                    <Text style={{ color: 'red' }}>
                      {errors.confirmPassword}
                    </Text>
                  )}
                </View>
                {/*BUTTON*/}
                <Button
                  text={'Create Account'}
                  iconName={'arrow-right'}
                  onPress={handleSubmit}
                />
              </>
            )}
          </Formik>
          {/*ALREADY HAVE ACCOUNT SIGN IN*/}
          <View style={styles.textContainer}>
            <Text style={styles.text}>Already have an account? </Text>

            <TouchableOpacity
              onPress={() =>
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Login' }],
                })
              }
            >
              <Text style={[styles.text, { color: '#6366F1' }]}>Log in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
      <StatusModal
        modalVisible={modalVisible}
        loading={loading}
        modalHeader={modalHeader}
        modalMessage={modalMessage}
        onPressButton={() => {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        }}
      />
    </>
  );
};

export default SignupScreen;

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
});
