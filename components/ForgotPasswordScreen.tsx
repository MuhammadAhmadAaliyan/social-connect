import * as React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FontAwesome5, FontAwesome } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

//AUTH COMPONENTS
import { auth } from '../firebase';
import { sendPasswordResetEmail } from 'firebase/auth';

//IMPORT OTHER COMPONENTS
import InputField from '../utils/InputField';
import BackButton from '../utils/BackButton';
import StatusModal from '../utils/StatusModal';

//TYPESCRIPT TYPES
import { RootStackParamList } from '../navigation/routesType';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ForgotPasswordScreen = () => {
  //HOOKS
  const [modalVisible, setModalVisible] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [modalHeader, setModalHeader] = React.useState('');
  const [modalMessage, setModalMessage] = React.useState('');

  //YUP VALIDATION SCHEMA
  const SigninSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email').required('Email is required'),
  });

  //SETUP NAVIGATION
  const navigation = useNavigation<NavigationProp>();

  //METHOD FOR HANDLE FORGOT PASSWORD
  const forgotPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);

      setModalHeader('Password Reset');
      setModalMessage('We’ve sent a password reset link to your email.');
      setLoading(false);
    } catch (err: any) {
      setLoading(false);
      if (err.code === 'auth/network-request-failed') {
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
      <SafeAreaView
        style={styles.container}
        edges={{ top: 'off', bottom: 'additive' }}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/*BACK BUTTON*/}
          <BackButton onPress={() => navigation.goBack()} />
          {/*LOGO*/}
          <View style={styles.logo}>
            <FontAwesome5 name={'key'} size={40} color={'#6366F1'} />
          </View>
          {/*WELCOME TEXT */}
          <Text style={styles.welcomeText}>Forgot Password?</Text>
          {/*SUBTEXT */}
          <Text style={styles.subText}>
            No worries! Enter your email address and we'll send you a reset
            link.
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
              forgotPassword(values.email);
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
                {/*BUTTON*/}
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => handleSubmit()}
                >
                  <Text style={styles.buttonText}>Send reset link</Text>
                  <FontAwesome name={'send'} size={25} color={'#ffffff'} />
                </TouchableOpacity>
              </>
            )}
          </Formik>
        </ScrollView>
        <StatusModal
          modalVisible={modalVisible}
          loading={loading}
          modalHeader={modalHeader}
          modalMessage={modalMessage}
          onPressButton={() => {
            setModalVisible(false);
            navigation.goBack();
          }}
        />
      </SafeAreaView>
    </>
  );
};

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  logo: {
    width: 70,
    height: 70,
    backgroundColor: '#202652',
    top: 50,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
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
  buttonText: {
    fontSize: 20,
    fontFamily: 'Inter',
    fontWeight: 'bold',
    color: '#ffffff',
  },
  button: {
    backgroundColor: '#6062e8',
    height: 60,
    padding: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginVertical: 20,
    gap: 15,
  },
});
