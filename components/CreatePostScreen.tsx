import { useEffect } from 'react';
import {
  Text,
  View,
  StyleSheet,
  Pressable,
  Image,
  ScrollView,
  TextInput,
  Alert,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AntDesign } from '@expo/vector-icons';
import { useState } from 'react';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import PagerView from 'react-native-pager-view';
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
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

//OTHER COMPONENTS
import StatusModal from '../utils/StatusModal';
import ConfirmModal from '../utils/ConfimModal';

//SCREEN TYPES
import { RootStackParamList } from '../navigation/routesType';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const CreatePostScreen = () => {
  //HOOKS
  const [postText, setPostText] = useState('');
  const [images, setImages] = useState<any>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalHeader, setModalHeader] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const dispatch = useDispatch<AppDispatch>();
  const { currentUser } = useSelector((state: RootState) => state.user);

  const MAX_CHARS = 150;

  //SETUP NAVIGATION
  const navigation = useNavigation<NavigationProp>();

  //ANDROID BACK BUTTON HANDLER METHOD
  useEffect(() => {
    const backAction = () => {
      if (postText.trim() || images.length > 0) {
        setConfirmModalVisible(true);
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [postText, images]);

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

      const remaining = 5 - (images?.length || 0);

      if (remaining <= 0) {
        Alert.alert('Limit reached', 'You can only add up to 5 images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        allowsMultipleSelection: true,
        quality: 1,
      });

      if (!result.canceled) {
        const selected = result.assets.slice(0, remaining);
        const uris = selected.map((asset) => asset.uri);

        if (result.assets.length > remaining) {
          Alert.alert(
            'Limit reached',
            `You can only add upto 5 images in one post.`,
          );

          return;
        }

        setImages((prev: any) => [...(prev || []), ...uris]);
      }
    } catch (err) {
      console.log(err);
    }
  };

  // //METHOD FOR PUBLIC URL OF IMAGES
  const uploadImages = async (uris: string[]): Promise<string[]> => {
    try {
      // ✅ upload all images concurrently
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
  const createPost = async () => {
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

      const docRef = await addDoc(collection(db, 'posts'), {
        userId: userId,
        postText: postText,
        postImages: imageUrls,
        createdAt: serverTimestamp(),
        likes: [],
        commentsCount: 0,
      });

      dispatch(
        addPost({
          id: docRef.id,
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
      setModalMessage('Post created successfully');
      setLoading(false);
    } catch (err) {
      console.log(err);
      setModalHeader('Error');
      setModalMessage('Failed to create post. Try again later.');
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
          <Pressable
            style={styles.closeButton}
            onPress={() => {
              if (postText.trim() || images?.length > 0) {
                setConfirmModalVisible(true);
              } else {
                navigation.goBack();
              }
            }}
          >
            <AntDesign
              name={'close'}
              size={responsiveWidth(6.5)}
              color={'#ffffff'}
            />
          </Pressable>
          <Text style={styles.headerText}>Create Post</Text>
          <Pressable
            style={[
              styles.postButton,
              !postText.trim() && { backgroundColor: '#334155' },
            ]}
            disabled={!postText.trim()}
            onPress={() => {
              if (!postText.trim()) return;
              setLoading(true);
              setModalVisible(true);
              createPost();
            }}
          >
            <Text
              style={[
                styles.postButtonText,
                !postText.trim() && { color: '#64748B' },
              ]}
            >
              Post
            </Text>
          </Pressable>
        </View>
        {/*SEPERATOR LINE*/}
        <View style={styles.seperatorLine} />
        {/*MAIN AREA*/}
        <ScrollView
          style={{
            padding: responsiveWidth(5),
          }}
        >
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
            maxLength={150}
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
              <Pressable onPress={() => setImages([])}>
                <Text
                  style={{
                    fontFamily: 'Inter',
                    fontWeight: '500',
                    color: '#6366F1',
                  }}
                >
                  Clear All
                </Text>
              </Pressable>
            )}
          </View>
          {Array.isArray(images) && images.length > 0 ? (
            <View style={styles.sliderContainer}>
              <PagerView
                style={{ height: responsiveHeight(35) }}
                initialPage={activeIndex}
                onPageSelected={(e) => setActiveIndex(e.nativeEvent.position)}
              >
                {images.map((uri: any, index: number) => (
                  <View style={styles.postImageContainer} key={index}>
                    <Image
                      source={{ uri }}
                      style={styles.postImage}
                      resizeMode="cover"
                    />
                    <Pressable
                      style={styles.deleteImageButton}
                      onPress={() => {
                        const newIndex =
                          index === images.length - 1 ? index - 1 : index;
                        setActiveIndex(newIndex < 0 ? 0 : newIndex);
                        setImages((prev: any) =>
                          prev.filter((_: any, i: number) => i !== index),
                        );
                      }}
                    >
                      <MaterialIcons
                        name="delete-outline"
                        size={responsiveWidth(5)}
                        color="#ffffff"
                      />
                    </Pressable>
                  </View>
                ))}
              </PagerView>

              {/* DOT INDICATORS */}
              {images.length > 1 && (
                <View style={styles.dotsContainer}>
                  {images.map((_: any, i: number) => (
                    <View
                      key={i}
                      style={[
                        styles.dot,
                        i === activeIndex && styles.activeDot,
                      ]}
                    />
                  ))}
                </View>
              )}

              {/* ADD MORE BUTTON */}
              {images.length < 5 && (
                <Pressable style={styles.addMoreButton} onPress={pickImage}>
                  <Ionicons
                    name="add-circle"
                    size={responsiveWidth(5)}
                    color="#6366F1"
                  />
                  <Text style={styles.addMoreText}>
                    Add more ({images.length}/5)
                  </Text>
                </Pressable>
              )}
            </View>
          ) : (
            <Pressable
              style={styles.imagesPlaceholder}
              onPress={() => pickImage()}
            >
              <Ionicons
                name="images"
                size={responsiveWidth(15)}
                color={'#7C99AE'}
              />
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
      <ConfirmModal
        visible={confirmModalVisible}
        title="Discard Post?"
        message="You have unsaved changes. If you leave now, your post will be lost."
        buttonText="DISCARD"
        onConfirm={() => {
          setConfirmModalVisible(false);
          navigation.goBack();
        }}
        onCancel={() => setConfirmModalVisible(false)}
      />
    </>
  );
};

export default CreatePostScreen;

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
    fontFamily: 'Inter-Bold',
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
    fontFamily: 'Inter-Bold',
    fontSize: responsiveFontSize(2),
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
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
    fontSize: responsiveFontSize(1.8),
  },
  userName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: responsiveFontSize(1.8),
    color: '#ffffff',
  },
  input: {
    borderWidth: 0.5,
    borderColor: '#7C99AE',
    fontFamily: 'Inter-Regular',
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
    fontFamily: 'Inter-SemiBold',
    color: '#7C99AE',
  },
  sliderContainer: {
    marginTop: responsiveHeight(2.5),
  },
  postImageContainer: {
    flex: 1,
    borderRadius: responsiveWidth(10),
    overflow: 'hidden',
  },
  postImage: {
    width: '100%',
    height: responsiveHeight(35),
  },
  deleteImageButton: {
    position: 'absolute',
    top: responsiveWidth(3),
    right: responsiveWidth(3),
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: responsiveWidth(5),
    padding: responsiveWidth(2),
    zIndex: 10,
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
    fontFamily: 'Inter-Bold',
    color: '#7C99AE',
  },
  addMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: responsiveWidth(2),
    paddingVertical: responsiveHeight(1),
    paddingTop: responsiveHeight(3),
    paddingBottom: responsiveHeight(8),
  },

  addMoreText: {
    color: '#6366F1',
    fontFamily: 'Inter-Bold',
    fontSize: responsiveFontSize(1.8),
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: responsiveHeight(1),
    gap: responsiveWidth(1.5),
  },
  dot: {
    width: responsiveWidth(2),
    height: responsiveWidth(2),
    borderRadius: responsiveWidth(1),
    backgroundColor: '#ffffff',
    opacity: 0.4,
  },
  activeDot: {
    opacity: 1,
    backgroundColor: '#6366F1',
    width: responsiveWidth(3),
  },
});
