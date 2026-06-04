import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Entypo, AntDesign, Feather } from '@expo/vector-icons';
import Swiper from 'react-native-swiper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import {
  clearError,
  fetchPosts,
  toggleLike,
  setPosts,
  removePost,
} from '../redux/slices/postsSlice';
import { RootState, AppDispatch } from '../redux/store';
import {
  responsiveWidth,
  responsiveHeight,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';

//SCREEN TYPES
import { RootStackParamList } from '../navigation/routesType';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

//AUTH COMPONENTS
import {
  doc,
  updateDoc,
  arrayRemove,
  arrayUnion,
  getDocs,
  onSnapshot,
  query,
  collection,
  orderBy,
  deleteDoc,
} from 'firebase/firestore';
import { auth, db } from '../firebase';

//OTHER COMPONENTS
import Loading from '../utils/Loading';
import StatusModal from '../utils/StatusModal';
import LikeButton from '../utils/LikeButton';
import DropdownMenu from '../utils/DropdownMenu';
import ConfirmModal from '../utils/ConfimModal';

//NOTIFICATION COMPONENT
import { sendPushNotification } from '../utils/sendPushNotification';

const HomeScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { posts, error } = useSelector((state: RootState) => state.posts);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [modalHeader, setModalHeader] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [firstLoad, setFirstLoad] = useState(true);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    right: 0,
  });
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const { currentUser } = useSelector((state: RootState) => state.user);

  //SETUP NAVIGATION
  const navigation = useNavigation<NavigationProp>();

  //FETCHING POSTS FROM DATABASE
  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));

    // REAL TIME LISTENER
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      try {
        const posts = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate().toISOString() || null,
          };
        });

        const usersSnap = await getDocs(collection(db, 'users'));
        const users = usersSnap.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate().toISOString() || null,
          };
        });

        const finalPosts = posts.map((post: any) => ({
          ...post,
          user: users.find((u: any) => u.id === post.userId) || null,
        }));
        dispatch(setPosts(finalPosts));
      } catch (err: any) {
        console.log(err);
        if (
          err.message?.includes("Backend didn't respond") ||
          err.message?.includes('network') ||
          err.code === 'unavailable'
        ) {
          setModalHeader('Network Error');
          setModalMessage(
            'Slow connection. Please check your internet and try again.',
          );
        } else {
          setModalHeader('Error');
          setModalMessage('Unable to load posts. Try again later');
        }
        setFirstLoad(false);
        setModalVisible(true);
      } finally {
        setFirstLoad(false);
      }
    });

    return () => unsubscribe();
  }, []);

  //SHOW ERROR IF ANY ERROR OCCURS IN REFRESH
  useEffect(() => {
    if (error) {
      const getError = async () => {
        setModalHeader('Error');
        setModalMessage('Unable to load posts. Try again later.');
        setModalVisible(true);
        dispatch(clearError());
      };

      getError();
    }
  }, [error]);

  //FORMAT TIME METHOD
  const getTimeAgo = (timestamp: any) => {
    if (!timestamp) return '';

    const date =
      typeof timestamp === 'string'
        ? new Date(timestamp)
        : timestamp?.toDate
          ? timestamp.toDate()
          : new Date(timestamp);

    const now: any = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 10) return 'Just now';
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  //METHOD FOR HANDLING LIKES/UNLIKES
  const toggleLikes = async (postId: string) => {
    const userId = currentUser?.id;
    if (!userId) return;

    const postRef = doc(db, 'posts', postId);
    const post = posts.find((p: any) => p.id === postId);
    const alreadyLiked = post.likes.includes(userId);

    //UPDATE IN UI
    dispatch(toggleLike({ postId, userId }));

    try {
      //UPDATE IN BACKEND
      await updateDoc(postRef, {
        likes: alreadyLiked ? arrayRemove(userId) : arrayUnion(userId),
      });

      if (!alreadyLiked && post.userId !== userId) {
        await sendPushNotification(
          post.userId,
          'New Like',
          `${currentUser.username} liked your post`,
        );
      }
    } catch (err) {
      console.log(err);

      //REVERT CHANGES IN UI IF BACKEND FAILS
      dispatch(toggleLike({ postId, userId }));
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

  //FORMAT LIKES/UNLIKES COMMENTS COUNT
  const formatCount = (count: number): string => {
    if (count < 1000) {
      return count.toString(); // 999
    } else if (count < 1000000) {
      const result = count / 1000;
      return result % 1 === 0 ? `${result}K` : `${result.toFixed(1)}K`;
    } else if (count < 1000000000) {
      const result = count / 1000000;
      return result % 1 === 0 ? `${result}M` : `${result.toFixed(1)}M`;
    } else {
      const result = count / 1000000000;
      return result % 1 === 0 ? `${result}B` : `${result.toFixed(1)}B`;
    }
  };

  //METHOD FOR DELETING POST
  const deletePost = async (postId: any) => {
    if (!postId) return;

    dispatch(removePost(postId));

    try {
      await deleteDoc(doc(db, 'posts', postId));
      console.log('Post deleted Successfully');
    } catch (err) {
      console.log('Failed to delete: ', err);
      //REVERT UI IF DELETING FAILS
      await dispatch(fetchPosts());
    }
  };

  //RENDER ITEM FUNCTION
  const renderItem = ({ item }: any) => (
    <View
      style={{
        padding: responsiveWidth(5),
      }}
    >
      {/*USER PROFILE*/}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          //alignItems: 'center',
        }}
      >
        <View style={styles.userProfileContainer}>
          {item.user?.userImage ? (
            <Pressable
              onPress={() =>
                navigation.navigate('ViewProfile', { userId: item.userId })
              }
            >
              <Image
                source={{ uri: item.user.userImage }}
                resizeMode="cover"
                style={styles.userImage}
              />
            </Pressable>
          ) : (
            <Pressable
              style={[styles.userImage, { backgroundColor: '#059669' }]}
              onPress={() =>
                navigation.navigate('ViewProfile', { userId: item.userId })
              }
            >
              <Text style={styles.profileInitials}>
                {getInitials(item.user?.username)}
              </Text>
            </Pressable>
          )}
          <View style={{ justifyContent: 'flex-start' }}>
            <Text style={styles.userName}>{item.user?.username}</Text>
            <Text style={styles.timeStamp}>{getTimeAgo(item.createdAt)}</Text>
          </View>
        </View>
        {currentUser.id === item.userId && (
          <Pressable
            onPress={(event) => {
              // GET THE POSTION OF THE BUTTON ON THE SCREEN
              const { pageY, pageX } = event.nativeEvent;
              setDropdownPosition({
                top: pageY,
                right: responsiveWidth(100) - pageX,
              });
              setSelectedPost(item);
              setDropdownVisible(true);
            }}
          >
            <Feather name={'more-vertical'} size={24} color={'#ffffff'} />
          </Pressable>
        )}
      </View>
      {/*POST TEXT*/}
      <View style={{ marginTop: responsiveHeight(2.5) }}>
        <Text style={styles.postText}>{item.postText}</Text>
      </View>
      {/*POST IMAGES*/}
      {Array.isArray(item.postImages) && item.postImages.length > 0 ? (
        <View style={styles.sliderContainer}>
          <Swiper dotColor="#fff" activeDotColor="#6366F1" loop={false}>
            {item.postImages.map((uri: any, key: any) => (
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
      ) : null}
      {/*LIKES/UNLIKES & COMMENTS AREA*/}
      <View style={styles.likesUnlikesContainer}>
        <LikeButton
          postId={item?.id}
          liked={item.likes.includes(auth.currentUser?.uid)}
          likeCount={item.likes.length}
          onToggle={toggleLikes}
        />
        <View>
          <Pressable
            onPress={() =>
              navigation.navigate('Comment', {
                postId: item.id,
                postOwnerId: item?.userId,
              })
            }
            style={styles.likeAndCommentButton}
          >
            <Feather name={'message-circle'} size={22} color={'#ffffff'} />
            <Text style={styles.counterText}>
              {formatCount(item.commentsCount ?? 0)}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );

  //HANDLE REFRESH
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await dispatch(fetchPosts()).unwrap();
    } catch (err) {
      console.log(err);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <>
      <SafeAreaView style={{ flex: 1 }}>
        {/*HEADER*/}
        <View style={styles.header}>
          <View style={styles.logoAndText}>
            <View style={styles.logoContainer}>
              <Entypo name={'share'} size={30} color={'#6366F1'} />
            </View>
            <Text style={styles.headerText}>Social Connect</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('CreatePost')}>
            <AntDesign name={'plus'} size={30} color={'#ffffff'} />
          </TouchableOpacity>
        </View>
        <View style={styles.seperatorLine} />
        {/*POST AREA*/}
        {firstLoad ? (
          <Loading />
        ) : (
          <FlatList
            data={posts}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
            ItemSeparatorComponent={() => (
              <View
                style={[
                  styles.seperatorLine,
                  { borderWidth: responsiveWidth(0.25) },
                ]}
              />
            )}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor="#6366F1"
                colors={['#6366F1']}
              />
            }
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
      <StatusModal
        modalVisible={modalVisible}
        modalHeader={modalHeader}
        modalMessage={modalMessage}
        loading={false}
        onPressButton={() => setModalVisible(false)}
      />
      {/*DROP DOWN MENU*/}
      <DropdownMenu
        visible={dropdownVisible}
        onClose={() => setDropdownVisible(false)}
        top={dropdownPosition.top}
        right={dropdownPosition.right}
        items={[
          {
            label: 'Edit Post',
            onPress: () =>
              navigation.navigate('EditPost', { post: selectedPost }),
          },
          {
            label: 'Delete Post',
            onPress: () => setConfirmModalVisible(true),
          },
        ]}
      />
      {/*CONFIRM DELETION*/}
      <ConfirmModal
        visible={confirmModalVisible}
        title="Confrim Deletion"
        message="Are you sure you want to delete this post?"
        onCancel={() => setConfirmModalVisible(false)}
        onConfirm={() => {
          deletePost(selectedPost?.id);
          setConfirmModalVisible(false);
        }}
        buttonText="DELETE"
      />
    </>
  );
};
//muhammadaaliyan39@gmail.com Ahmad@123
export default HomeScreen;

const styles = StyleSheet.create({
  logoContainer: {
    width: responsiveWidth(13),
    height: responsiveWidth(13),
    backgroundColor: '#202652',
    borderRadius: responsiveWidth(5),
    justifyContent: 'center',
    alignItems: 'center',
  },

  logoAndText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: responsiveWidth(5),
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: responsiveWidth(5),
    paddingVertical: responsiveHeight(2),
    alignItems: 'center',
  },

  headerText: {
    fontSize: responsiveFontSize(3),
    fontFamily: 'Inter',
    fontWeight: 'bold',
    color: '#ffffff',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },

  seperatorLine: {
    borderBottomWidth: responsiveWidth(0.15),
    borderColor: '#1e293b',
  },

  userProfileContainer: {
    flexDirection: 'row',
    gap: responsiveWidth(5),
  },

  userImage: {
    width: responsiveWidth(13),
    height: responsiveWidth(13),
    borderRadius: responsiveWidth(6.5),
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
    fontSize: responsiveFontSize(2),
    color: '#ffffff',
  },

  timeStamp: {
    fontFamily: 'Inter',
    color: '#7C99AE',
    fontSize: responsiveFontSize(1.8),
  },

  postText: {
    fontFamily: 'Inter',
    color: '#ffffff',
    fontSize: responsiveFontSize(2.2),
  },

  sliderContainer: {
    height: responsiveHeight(40),
    marginTop: responsiveHeight(2.5),
  },

  postImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  postImage: {
    width: '100%',
    height: responsiveHeight(40),
    borderRadius: responsiveWidth(10),
  },

  likesUnlikesContainer: {
    paddingTop: responsiveHeight(4),
    flexDirection: 'row',
    alignItems: 'center',
    gap: responsiveWidth(7),
  },

  likeAndCommentButton: {
    flexDirection: 'row',
    gap: responsiveWidth(4),
    alignItems: 'center',
  },

  counterText: {
    fontFamily: 'Inter',
    fontSize: responsiveFontSize(2),
    color: '#7C99AE',
  },
});
