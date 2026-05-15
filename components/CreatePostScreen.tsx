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

//AUTH COMPONENTS
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

//OTHER COMPONENTS
import StatusModal from '../utils/StatusModal';

//SCREEN TYPES
import { RootStackParamList } from '../navigation/routesType';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const CreatePostScreen = () => {
  //HOOKS
  const [postText, setPostText] = useState('');
  const [images, setImages] = useState<any>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalHeader, setModalHeader] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const MAX_CHARS = 150;
  const dispatch = useDispatch<AppDispatch>();
  const { currentUser } = useSelector((state: RootState) => state.user);

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

      const urls = await Promise.all(uploadPromises); // ✅ wait for all uploads
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
      });

      dispatch(
        addPost({
          id: docRef.id,
          userId: userId,
          postText: postText,
          postImages: imageUrls,
          createdAt: { toDate: () => new Date() }, // temp timestamp
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
        <ScrollView style={{ padding: 20 }}>
          {/*USER PROFILE SHOW*/}
          <View style={styles.userProfileContainer}>
            <View style={[styles.userImage, { backgroundColor: '#059669' }]}>
              <Text style={styles.profileInitials}>AA</Text>
            </View>
            <View>
              <Text style={styles.userName}>Ahmad Aaliyan</Text>
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
              marginBottom: 30,
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

export default CreatePostScreen;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    fontFamily: 'Inter',
    fontWeight: 'bold',
    color: '#ffffff',
    textAlignVertical: 'center',
  },
  postButton: {
    backgroundColor: '#6366F1',
    width: 80,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postButtonText: {
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  closeButton: {
    backgroundColor: '#1e293b',
    borderWidth: 0.5,
    borderColor: '#7C99AE',
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
  userProfileContainer: { flexDirection: 'row', gap: 20, alignItems: 'center' },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitials: {
    fontFamily: 'Inter',
    fontWeight: '800',
    color: '#ffffff',
    fontSize: 15,
  },
  userName: {
    fontFamily: 'Inter',
    fontWeight: '800',
    fontSize: 16,
    color: '#ffffff',
  },
  input: {
    borderWidth: 0.5,
    borderColor: '#7C99AE',
    fontSize: 16,
    backgroundColor: '#1e293b',
    padding: 10,
    color: '#ffffff',
    borderRadius: 15,
    marginTop: 30,
    textAlignVertical: 'top',
  },
  subText: {
    fontSize: 16,
    fontFamily: 'Inter',
    color: '#7C99AE',
    fontWeight: 800,
  },
  sliderContainer: {
    height: 300,
    marginTop: 20,
  },

  postImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  postImage: {
    width: '100%',
    height: 300,
    borderRadius: 40,
  },
  imagesPlaceholder: {
    borderWidth: 1,
    borderStyle: 'dashed',
    height: 300,
    width: '100%',
    borderColor: '#7C99AE',
    marginVertical: 30,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagesPlaceholderText: {
    fontSize: 20,
    fontFamily: 'Inter',
    fontWeight: 'bold',
    color: '#7C99AE',
  },
});
