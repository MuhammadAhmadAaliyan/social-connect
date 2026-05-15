import { useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { updateCurrentUser } from '../redux/slices/userSlice';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';

//AUTH COMPONENTS
import { auth, db } from '../firebase';
import { updateDoc, doc } from 'firebase/firestore';

//OTHER COMPONENTS
import BackButton from '../utils/BackButton';
import InputField from '../utils/InputField';
import StatusModal from '../utils/StatusModal';
import Button from '../utils/Button';

type FormValues = {
  fullName: string;
  bio: string;
};

//SCREEN TYPES
import { RootStackParamList } from '../navigation/routesType';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const EditProfileScreen = () => {
  //HOOKS
  const [modalVisible, setModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalHeader, setModalHeader] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const [profileImage, setProfileImage] = useState<any>(currentUser?.userImage);
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
        updateCurrentUser({
          userImage: result.assets[0].uri || '',
        });
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

        updateCurrentUser({
          userImage: result.assets[0].uri || '',
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  //METHOD FOR UPDATING USER DATA
  const updateData = async (username: string, bio: string) => {
    try {
      let picURL = profileImage;
      if (profileImage && profileImage !== currentUser?.userImage) {
        picURL = await uploadImage(profileImage);
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

      dispatch(
        updateCurrentUser({
          username,
          bio,
          userImage: picURL || '',
        }),
      );

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

  //METHOD FOR GETTING USER NAME INITIALS
  const getInitials = (name: string) => {
    if (!name) return '';

    const words = name.trim().split(' ');

    if (words.length === 1) {
      return words[0][0].toUpperCase();
    }

    return (words[0][0] + words[1][0]).toUpperCase();
  };

  return (
    <>
      {/*HEADER*/}
      <SafeAreaView
        style={{ flex: 1 }}
        edges={{ top: 'off', bottom: 'additive' }}
      >
        <View style={styles.header}>
          <BackButton onPress={() => navigation.goBack()} />
          <View style={styles.headerTextContainer} pointerEvents="none">
            <Text style={styles.headerText}>Edit Profile</Text>
          </View>
        </View>
        {/*SEPERATOR LINE*/}
        <View style={styles.seperatorLine} />
        {/*MAIN AREA*/}
        <ScrollView style={{ flex: 1 }}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <ScrollView
              contentContainerStyle={styles.mainArea}
              keyboardShouldPersistTaps="handled"
            >
              {/*PROFILE PICTURE*/}
              <View style={{ paddingHorizontal: responsiveWidth(5) }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={styles.subText}>AVATAR</Text>
                  {profileImage && (
                    <MaterialIcons
                      name={'delete-outline'}
                      size={25}
                      color={'#6366F1'}
                      style={{ paddingTop: responsiveHeight(1.2) }}
                      onPress={() => {
                        setProfileImage(null);
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
                      <Text style={styles.nameInitials}>
                        {getInitials(currentUser?.username)}
                      </Text>
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
              <View
                style={[
                  styles.seperatorLine,
                  { marginTop: responsiveHeight(2) },
                ]}
              />
              {/*BASIC INFORMATION*/}
              <Formik<FormValues>
                initialValues={{
                  fullName: currentUser?.username,
                  bio: currentUser?.bio,
                }}
                validationSchema={InputSchema}
                onSubmit={(values) => {
                  setStatusModalVisible(true);
                  setLoading(true);
                  updateData(values.fullName, values.bio);
                }}
              >
                {({
                  handleChange,
                  handleBlur,
                  values,
                  touched,
                  errors,
                  handleSubmit,
                  isValid,
                  dirty,
                }) => {
                  const isImageChanged =
                    profileImage !== currentUser?.userImage;

                  const isButtonEnabled = (dirty || isImageChanged) && isValid;
                  return (
                    <View>
                      <View style={{ paddingHorizontal: responsiveWidth(5) }}>
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
                          <Text style={{ color: 'red' }}>
                            {errors.fullName}
                          </Text>
                        )}
                      </View>

                      {/* SEPARATOR */}
                      <View
                        style={[
                          styles.seperatorLine,
                          { marginTop: responsiveHeight(2) },
                        ]}
                      />

                      <View style={{ paddingHorizontal: responsiveWidth(5) }}>
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
                      <View
                        style={{
                          paddingHorizontal: responsiveWidth(5),
                          marginTop: responsiveHeight(5),
                        }}
                      >
                        <Button
                          text={'Save Changes'}
                          onPress={handleSubmit}
                          disabled={!isButtonEnabled}
                          style={{ marginBottom: 0 }}
                        />
                      </View>
                    </View>
                  );
                }}
              </Formik>
            </ScrollView>
          </KeyboardAvoidingView>
        </ScrollView>
      </SafeAreaView>
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
    padding: responsiveWidth(5),
    paddingTop: responsiveHeight(6),
    paddingBottom: responsiveHeight(2),
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerText: {
    fontSize: responsiveFontSize(3),
    fontFamily: 'Inter',
    fontWeight: 'bold',
    color: '#ffffff',
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
  },

  headerTextContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },

  seperatorLine: {
    borderBottomWidth: responsiveWidth(0.15),
    borderColor: '#1e293b',
  },

  mainArea: {
    paddingBottom: responsiveHeight(2.5),
  },

  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: responsiveHeight(2.5),
    position: 'relative',
  },

  profileImage: {
    width: responsiveWidth(32),
    height: responsiveWidth(32),
    backgroundColor: '#059669',
    borderRadius: responsiveWidth(16),
    marginVertical: responsiveHeight(2.5),
    marginBottom: responsiveHeight(2),
    justifyContent: 'center',
    alignItems: 'center',
  },

  cameraButton: {
    position: 'absolute',
    bottom: responsiveHeight(1),
    right: responsiveWidth(30),
    backgroundColor: '#6366F1',
    width: responsiveWidth(10),
    height: responsiveWidth(10),
    borderRadius: responsiveWidth(5),
    justifyContent: 'center',
    alignItems: 'center',
  },

  nameInitials: {
    fontFamily: 'Inter',
    fontSize: responsiveFontSize(5),
    fontWeight: 'bold',
    color: '#ffffff',
  },

  subText: {
    fontSize: responsiveFontSize(2),
    fontFamily: 'Inter',
    color: '#7C99AE',
    paddingTop: responsiveHeight(1.2),
    fontWeight: '800',
  },

  text: {
    fontSize: responsiveFontSize(2),
    fontFamily: 'Inter',
    color: '#ffffff',
    paddingVertical: responsiveHeight(2.5),
  },

  multilineInput: {
    borderWidth: responsiveWidth(0.1),
    borderColor: '#7C99AE',
    textAlignVertical: 'top',
    color: '#ffffff',
    fontSize: responsiveFontSize(2),
    borderRadius: responsiveWidth(4),
    padding: responsiveWidth(4),
    backgroundColor: '#1e293b',
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: responsiveWidth(5),
  },

  modalContainer: {
    backgroundColor: '#0F172A',
    padding: responsiveWidth(5),
    borderRadius: responsiveWidth(4),
  },

  modalText: {
    fontFamily: 'Inter',
    fontSize: responsiveFontSize(2.4),
    color: '#7C99AE',
    alignSelf: 'center',
  },

  options: {
    flexDirection: 'row',
    gap: responsiveWidth(2.5),
    paddingVertical: responsiveHeight(2),
  },
});
