import {
  Text,
  View,
  StyleSheet,
  Pressable,
  Image,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AntDesign } from '@expo/vector-icons';
import { useState } from 'react';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import Swiper from 'react-native-swiper';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { addPost } from '../redux/slices/postsSlice';
import { RootState, AppDispatch } from '../redux/store';
import {
  responsiveWidth,
  responsiveHeight,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';

//AUTH COMPONENTS
import { db } from '../firebase';
import { updateDoc, serverTimestamp, doc } from 'firebase/firestore';

//OTHER COMPONENTS
import StatusModal from '../utils/StatusModal';

//SCREEN TYPES
import { RootStackParamList } from '../navigation/routesType';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const EditPostScreen = ({ route }: any) => {
  //HOOKS
  const selectedPost = route.params?.post;
  const [postText, setPostText] = useState(selectedPost?.postText);
  const [images, setImages] = useState<any>(selectedPost?.postImages);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalHeader, setModalHeader] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const { currentUser } = useSelector((state: RootState) => state.user);

  const MAX_CHARS = 150;
  const isPostTextChanged = postText.trim() !== selectedPost?.postText;
  const isImagesChanged =
    JSON.stringify(images) !== JSON.stringify(selectedPost?.postImages);

  const isButtonEnabled =
    (isPostTextChanged || isImagesChanged) && postText.trim();

  //SETUP NAVIGATION
  const navigation = useNavigation<NavigationProp>();

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
        allowsEditing: false,
        allowsMultipleSelection: true,
        selectionLimit: 5,
        quality: 1,
      });

      if (!result.canceled) {
        const uris = result.assets.map((asset) => asset.uri);
        setImages(uris);
      }
    } catch (err) {
      console.log(err);
    }
  };

  // //METHOD FOR PUBLIC URL OF IMAGES
  const uploadImages = async (uris: string[]): Promise<string[]> => {
    try {
      //UPLOAD IMAGES CONCURRENTLY
      const uploadPromises = uris.map(async (uri) => {
        const data = new FormData();

        data.append('file', {
          uri,
          type: 'image/jpeg',
          name: `post_${Date.now()}.jpg`,
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
      });

      const urls = await Promise.all(uploadPromises);
      return urls;
    } catch (err) {
      console.log('Image upload error:', err);
      throw err;
    }
  };
  //METHOD FOR HANDLING CREATING POST
  const updatePost = async () => {
    try {
      const userId = currentUser?.id;

      if (!userId) {
        setModalHeader('Error');
        setModalMessage('You must be logged in to create a post.');
        setLoading(false);
        return;
      }

      let imageUrls: any;

      if (images.length > 0) {
        imageUrls = await uploadImages(images);
      } else {
        imageUrls = [];
      }

      await updateDoc(doc(db, 'posts', selectedPost?.id), {
        userId: userId,
        postText: postText,
        postImages: imageUrls,
        createdAt: serverTimestamp(),
      });

      dispatch(
        addPost({
          id: selectedPost?.id,
          userId: userId,
          postText: postText,
          postImages: imageUrls,
          createdAt: new Date().toISOString(),
          likes: [],
          commentsCount: 0,
          user: currentUser,
        }),
      );

      setModalHeader('Success');
      setModalMessage('Post updated successfully');
      setLoading(false);
    } catch (err) {
      console.log(err);
      setModalHeader('Error');
      setModalMessage('Failed to update post. Try again later.');
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
      <SafeAreaView
        style={{ flex: 1 }}
        edges={{ top: 'additive', bottom: 'additive' }}
      >
        {/*HEADER*/}
        <View style={styles.header}>
          <Pressable style={styles.closeButton}>
            <AntDesign
              name={'close'}
              size={25}
              color={'#ffffff'}
              onPress={() => navigation.goBack()}
            />
          </Pressable>
          <Text style={styles.headerText}>Edit Post</Text>
          <Pressable
            style={[
              styles.postButton,
              !isButtonEnabled && { backgroundColor: '#334155' },
            ]}
            disabled={!isButtonEnabled}
            onPress={() => {
              if (!isButtonEnabled) return;
              setLoading(true);
              setModalVisible(true);
              updatePost();
            }}
          >
            <Text
              style={[
                styles.postButtonText,
                !isButtonEnabled && { color: '#64748B' },
              ]}
            >
              Update
            </Text>
          </Pressable>
        </View>
        {/*SEPERATOR LINE*/}
        <View style={styles.seperatorLine} />
        {/*MAIN AREA*/}
        <ScrollView style={{ padding: responsiveWidth(5) }}>
          {/*USER PROFILE SHOW*/}
          <View style={styles.userProfileContainer}>
            {currentUser?.userImage ? (
              <Image
                source={{ uri: currentUser?.userImage }}
                style={styles.userImage}
                resizeMode={'cover'}
              />
            ) : (
              <View style={[styles.userImage, { backgroundColor: '#059669' }]}>
                <Text style={styles.profileInitials}>
                  {getInitials(currentUser?.username)}
                </Text>
              </View>
            )}
            <View>
              <Text style={styles.userName}>{currentUser?.username}</Text>
            </View>
          </View>
          {/*POST TEXT*/}
          <TextInput
            value={postText}
            onChangeText={(value) => {
              if (postText.length <= MAX_CHARS) {
                setPostText(value);
              }
            }}
            keyboardType="default"
            placeholder={"What's going on your mind?"}
            style={styles.input}
            multiline
            placeholderTextColor={'rgba(148, 163, 184, 0.3)'}
          />
          <Text
            style={{
              color: postText.length === MAX_CHARS ? 'red' : '#7C99AE',
              alignSelf: 'flex-end',
              marginBottom: responsiveHeight(3.5),
            }}
          >
            {postText.length}/{MAX_CHARS}
          </Text>
          {/*POST IMAGES*/}
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}
          >
            <Text style={styles.subText}>Images (Optional):</Text>
            {images.length > 0 && (
              <Pressable>
                <MaterialIcons
                  name={'delete-outline'}
                  size={25}
                  color={'#6366F1'}
                  onPress={() => {
                    setImages([]);
                  }}
                />
              </Pressable>
            )}
          </View>
          {Array.isArray(images) && images.length > 0 ? (
            <View style={styles.sliderContainer}>
              <Swiper dotColor="#fff" activeDotColor="#6366F1" loop={false}>
                {images.map((uri: any, key: any) => (
                  <View style={styles.postImageContainer} key={key}>
                    <Image
                      source={{ uri }}
                      style={styles.postImage}
                      resizeMode="cover"
                    />
                  </View>
                ))}
              </Swiper>
            </View>
          ) : (
            <Pressable
              style={styles.imagesPlaceholder}
              onPress={() => pickImage()}
            >
              <Ionicons name="images" size={60} color={'#7C99AE'} />
              <Text style={styles.imagesPlaceholderText}>Add Images</Text>
            </Pressable>
          )}
        </ScrollView>
      </SafeAreaView>
      <StatusModal
        modalVisible={modalVisible}
        loading={loading}
        modalHeader={modalHeader}
        modalMessage={modalMessage}
        onPressButton={() => navigation.goBack()}
      />
    </>
  );
};

export default EditPostScreen;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: responsiveWidth(5),
    paddingVertical: responsiveHeight(2),
    alignItems: 'center',
  },
  headerText: {
    fontSize: responsiveFontSize(2.5),
    fontFamily: 'Inter',
    fontWeight: 'bold',
    color: '#ffffff',
    textAlignVertical: 'center',
  },
  postButton: {
    backgroundColor: '#6366F1',
    width: responsiveWidth(20),
    height: responsiveHeight(6),
    borderRadius: responsiveWidth(4),
    justifyContent: 'center',
    alignItems: 'center',
  },
  postButtonText: {
    fontFamily: 'Inter',
    fontSize: responsiveFontSize(2),
    fontWeight: 'bold',
    color: '#ffffff',
  },
  closeButton: {
    backgroundColor: '#1e293b',
    borderWidth: 0.5,
    borderColor: '#7C99AE',
    width: responsiveHeight(6),
    height: responsiveHeight(6),
    borderRadius: responsiveWidth(4),
    justifyContent: 'center',
    alignItems: 'center',
  },
  seperatorLine: {
    borderBottomWidth: 0.6,
    borderColor: '#1e293b',
  },
  userProfileContainer: {
    flexDirection: 'row',
    gap: responsiveWidth(5),
    alignItems: 'center',
  },
  userImage: {
    width: responsiveWidth(12),
    height: responsiveWidth(12),
    borderRadius: responsiveWidth(6),
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitials: {
    fontFamily: 'Inter',
    fontWeight: '800',
    color: '#ffffff',
    fontSize: responsiveFontSize(1.8),
  },
  userName: {
    fontFamily: 'Inter',
    fontWeight: '800',
    fontSize: responsiveFontSize(1.8),
    color: '#ffffff',
  },
  input: {
    borderWidth: 0.5,
    borderColor: '#7C99AE',
    fontSize: responsiveFontSize(1.8),
    backgroundColor: '#1e293b',
    padding: responsiveWidth(3),
    color: '#ffffff',
    borderRadius: responsiveWidth(4),
    marginTop: responsiveHeight(3.5),
    textAlignVertical: 'top',
  },
  subText: {
    fontSize: responsiveFontSize(1.8),
    fontFamily: 'Inter',
    color: '#7C99AE',
    fontWeight: '800',
  },
  sliderContainer: {
    height: responsiveHeight(35),
    marginTop: responsiveHeight(2.5),
  },
  postImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postImage: {
    width: '100%',
    height: responsiveHeight(35),
    borderRadius: responsiveWidth(10),
  },
  imagesPlaceholder: {
    borderWidth: 1,
    borderStyle: 'dashed',
    height: responsiveHeight(35),
    width: '100%',
    borderColor: '#7C99AE',
    marginVertical: responsiveHeight(3.5),
    borderRadius: responsiveWidth(10),
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagesPlaceholderText: {
    fontSize: responsiveFontSize(2.2),
    fontFamily: 'Inter',
    fontWeight: 'bold',
    color: '#7C99AE',
  },
});
