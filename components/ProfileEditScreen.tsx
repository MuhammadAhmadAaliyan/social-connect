import { useState, useRef } from 'react';
import * as ImagePicker from 'expo-image-picker';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  Modal,
  Alert,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { FormikProps } from 'formik';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

//AUTH COMPONENTS
import { auth, db } from '../firebase';
import { updateDoc, doc } from 'firebase/firestore';

//OTHER COMPONENTS
import BackButton from '../utils/BackButton';
import InputField from '../utils/InputField';
import StatusModal from '../utils/StatusModal';

type FormValues = {
  fullName: string;
  email: string;
  bio: string;
};

//SCREEN TYPES
import { RootStackParamList } from '../navigation/routesType';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const EditProfileScreen = () => {
  //HOOKS
  const submitRef = useRef<FormikProps<FormValues> | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [profileImage, setProfileImage] = useState<any>(null);
  const [existingProfileImage, setExistingProfileImage] = useState<any>(null);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalHeader, setModalHeader] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  const navigation = useNavigation<NavigationProp>();

  //YUP VALIDATION SCHEMA
  const InputSchema = Yup.object().shape({
    fullName: Yup.string().max(20, 'Name can be upto 20 characters'),
    bio: Yup.string().max(100, 'Bio can be up to 100 characters.'),
  });

  //METHOD FOR PUBLIC URL OF IMAGE
  const uploadImage = async (uri: string) => {
    try {
      const data = new FormData();

      data.append('file', {
        uri,
        type: 'image/jpeg',
        name: 'profile.jpg',
      } as any);

      data.append('upload_preset', 'profile_upload');

      const res = await fetch(
        'https://api.cloudinary.com/v1_1/dmvr7m9fm/image/upload',
        {
          method: 'POST',
          body: data,
        },
      );

      const result = await res.json();

      return result.secure_url;
    } catch (err) {
      console.log(err);
      throw err;
    }
  };

  //METHOD FOR PICK IMAGE
  const pickImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          'Permission required',
          'Permission to access the media library is required.',
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (err) {
      console.log(err);
    }
  };

  //METHOD FOR CAPTURE IMAGE
  const captureImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestCameraPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          'Permission required',
          'Permission to access the media library is required.',
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (err) {
      console.log(err);
    }
  };

  //METHOD FOR UPDATING USER DATA
  const updateData = async (
    username: string,
    bio: string,
    userImage: string,
  ) => {
    try {
      let picURL = existingProfileImage;
      if (profileImage) {
        picURL = await uploadImage(userImage);
      }

      const user = auth.currentUser;

      if (!user) return;

      const docRef = doc(db, 'users', user.uid);

      const payLoad: any = {
        username,
        bio,
      };

      if (picURL) {
        payLoad.userImage = picURL;
      } else {
        payLoad.userImage = '';
      }

      await updateDoc(docRef, payLoad);

      setModalHeader('Success');
      setModalMessage('Profile updated successfully.');
      setLoading(false);
    } catch (err) {
      console.log(err);
      setModalHeader('Error');
      setModalMessage('Error while updating data. Please try again later');
      setLoading(false);
    }
  };
  return (
    <>
      {/*HEADER*/}
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={styles.headerText}>Edit Profile</Text>
        <Pressable
          style={styles.checkButton}
          onPress={() => submitRef.current?.handleSubmit()}
        >
          <Feather name="check" size={30} color={'#ffffff'} />
        </Pressable>
      </View>
      {/*SEPERATOR LINE*/}
      <View style={styles.seperatorLine} />
      {/*MAIN AREA*/}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.mainArea}
          keyboardShouldPersistTaps="handled"
        >
          {/*PROFILE PICTURE*/}
          <View style={{ paddingHorizontal: 20 }}>
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between' }}
            >
              <Text style={styles.subText}>AVATAR</Text>
              {(profileImage || existingProfileImage) && (
                <MaterialIcons
                  name={'delete-outline'}
                  size={25}
                  color={'#6366F1'}
                  style={{ paddingTop: 10 }}
                  onPress={() => {
                    setProfileImage(null);
                    setExistingProfileImage(null);
                  }}
                />
              )}
            </View>
            <View style={styles.imageContainer}>
              {profileImage ? (
                <View>
                  <Image
                    source={{ uri: profileImage }}
                    resizeMode="contain"
                    style={[
                      styles.profileImage,
                      { backgroundColor: 'transparent' },
                    ]}
                  />
                </View>
              ) : (
                <View style={styles.profileImage}>
                  <Text style={styles.nameInitials}>AA</Text>
                </View>
              )}
              <Pressable
                style={styles.cameraButton}
                onPress={() => setModalVisible(true)}
              >
                <Feather name="camera" size={20} color={'#ffffff'} />
              </Pressable>
            </View>
          </View>
          {/*SEPERATOR LINE*/}
          <View style={[styles.seperatorLine, { marginTop: 16 }]} />
          {/*BASIC INFORMATION*/}
          <Formik<FormValues>
            initialValues={{
              fullName: '',
              email: '',
              bio: '',
            }}
            validationSchema={InputSchema}
            onSubmit={(values) => {
              setStatusModalVisible(true);
              setLoading(true);
              updateData(values.fullName, values.bio, profileImage);
            }}
            innerRef={submitRef}
          >
            {({ handleChange, handleBlur, values, touched, errors }: any) => (
              <View>
                <View style={{ paddingHorizontal: 20 }}>
                  <Text style={styles.subText}>BASIC INFORMATION</Text>

                  <Text style={styles.text}>Full Name</Text>
                  <InputField
                    value={values.fullName}
                    onChangeValue={handleChange('fullName')}
                    onBlur={handleBlur('fullName')}
                    placeholder={'John Doe'}
                    iconName={'user'}
                  />
                  {touched.fullName && errors.fullName && (
                    <Text style={{ color: 'red' }}>{errors.fullName}</Text>
                  )}
                </View>

                {/* SEPARATOR */}
                <View style={[styles.seperatorLine, { marginTop: 16 }]} />

                <View style={{ paddingHorizontal: 20 }}>
                  <Text style={styles.subText}>ABOUT</Text>

                  <Text style={styles.text}>Bio</Text>
                  <TextInput
                    value={values.bio}
                    onChangeText={handleChange('bio')}
                    onBlur={handleBlur('bio')}
                    keyboardType={'default'}
                    placeholder={'About Yourself'}
                    placeholderTextColor={'rgba(148, 163, 184, 0.3)'}
                    multiline
                    style={styles.multilineInput}
                  />
                  {touched.bio && errors.bio && (
                    <Text style={{ color: 'red' }}>{errors.bio}</Text>
                  )}
                </View>
              </View>
            )}
          </Formik>
        </ScrollView>
      </KeyboardAvoidingView>
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              style={styles.options}
              onPress={() => {
                setModalVisible(false);
                captureImage();
              }}
            >
              <Feather name="camera" size={25} color={'#ffffff'} />
              <Text style={styles.modalText}>Take a Picture</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.options}
              onPress={() => {
                setModalVisible(false);
                pickImage();
              }}
            >
              <Feather name="image" size={25} color={'#ffffff'} />
              <Text style={styles.modalText}>Choose from gallery</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <StatusModal
        modalVisible={statusModalVisible}
        loading={loading}
        modalHeader={modalHeader}
        modalMessage={modalMessage}
        onPressButton={() => {
          setStatusModalVisible(false);
          navigation.goBack();
        }}
      />
    </>
  );
};

export default EditProfileScreen;

const styles = StyleSheet.create({
  header: {
    padding: 20,
    paddingTop: 50,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerText: {
    fontSize: 24,
    fontFamily: 'Inter',
    fontWeight: 'bold',
    color: '#ffffff',
    textAlignVertical: 'center',
  },
  checkButton: {
    backgroundColor: '#6366F1',
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  seperatorLine: {
    borderBottomWidth: 0.6,
    borderColor: '#1e293b',
  },
  mainArea: {
    paddingBottom: 20,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    backgroundColor: '#059669',
    borderRadius: 60,
    marginVertical: 20,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 5,
    right: 110,
    backgroundColor: '#6366F1',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameInitials: {
    fontFamily: 'Inter',
    fontSize: 50,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subText: {
    fontSize: 16,
    fontFamily: 'Inter',
    color: '#7C99AE',
    paddingTop: 10,
    fontWeight: 800,
  },
  text: {
    fontSize: 16,
    fontFamily: 'Inter',
    color: '#ffffff',
    paddingVertical: 20,
  },
  multilineInput: {
    borderWidth: 0.5,
    borderColor: '#7C99AE',
    textAlignVertical: 'top',
    color: '#ffffff',
    fontSize: 16,
    borderRadius: 15,
    padding: 15,
    backgroundColor: '#1e293b',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: '#0F172A',
    padding: 20,
    borderRadius: 15,
  },
  modalText: {
    fontFamily: 'Inter',
    fontSize: 20,
    color: '#7C99AE',
    alignSelf: 'center',
  },
  options: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 15,
  },
});
