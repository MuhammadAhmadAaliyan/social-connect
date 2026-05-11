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
import { Entypo, AntDesign, FontAwesome, Feather } from '@expo/vector-icons';
import Swiper from 'react-native-swiper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

//SCREEN TYPES
import { RootStackParamList } from '../navigation/routesType';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

//AUTH COMPONENTS
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
  arrayRemove,
  arrayUnion,
} from 'firebase/firestore';
import { auth, db } from '../firebase';

//OTHER COMPONENTS
import Loading from '../utils/Loading';
import StatusModal from '../utils/StatusModal';

const HomeScreen = () => {
  //HOOKS
  const [posts, setPosts] = useState<any>();
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalHeader, setModalHeader] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  //SETUP NAVIGATION
  const navigation = useNavigation<NavigationProp>();

  //FETCHING POSTS FROM DATABASE
  const getFeeds = async () => {
    try {
      const postsSnap = await getDocs(
        query(collection(db, 'posts'), orderBy('createdAt', 'desc')),
      );

      const posts = postsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const usersSnap = await getDocs(collection(db, 'users'));

      const users = usersSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const finalPosts = posts.map((post: any) => {
        const user = users.find((u) => u.id === post.userId);
        return {
          ...post,
          user: user || null,
        };
      });

      setPosts(finalPosts);
    } catch (err) {
      console.log(err);
      setModalHeader('Error');
      setModalMessage('Unable to load posts. Try again later');
      setLoading(false);
      setModalVisible(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  //METHOD FOR HANDLING LIKES/UNLIKES
  const toggleLikes = async (postId: string) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const postRef = doc(db, 'posts', postId);
    const post = posts.find((p: any) => p.id === postId);
    const alreadyLiked = post.likes.includes(userId);

    //UPDATE IN UI
    setPosts((prevPosts: any) =>
      prevPosts.map((p: any) => {
        if (p.id === postId) {
          return {
            ...p,
            likes: alreadyLiked
              ? p.likes.filter((id: any) => id !== userId)
              : [...p.likes, userId],
          };
        }
        return p;
      }),
    );
    try {
      //UPDATE IN BACKEND
      await updateDoc(postRef, {
        likes: alreadyLiked ? arrayRemove(userId) : arrayUnion(userId),
      });
    } catch (err) {
      console.log(err);

      //REVERT CHANGES IN UI IF BACKEND FAILS
      setPosts((prevPosts: any) =>
        prevPosts.map((p: any) => {
          if (p.id === postId) {
            return {
              ...p,
              likes: alreadyLiked
                ? [...p.likes, userId]
                : p.likes.filter((id: any) => id !== userId),
            };
          }
          return p;
        }),
      );
    }
  };

  useEffect(() => {
    const loadFeeds = async () => {
      await getFeeds();
    };

    loadFeeds();
  }, []);

  //FORMAT TIME METHOD
  const getTimeAgo = (timestamp: any) => {
    if (!timestamp) return '';

    const date = timestamp.toDate();
    const now: any = new Date();

    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;

    return `${Math.floor(diff / 86400)}d ago`;
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

  //RENDER ITEM FUNCTION
  const renderItem = ({ item }: any) => (
    <View
      style={{
        padding: 20,
      }}
    >
      {/*USER PROFILE*/}
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
      {/*POST TEXT*/}
      <View style={{ marginTop: 18 }}>
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
        <View style={styles.likeAndCommentButton}>
          <Pressable onPress={() => toggleLikes(item.id)}>
            <FontAwesome
              name={
                item.likes.includes(auth.currentUser?.uid) ? 'heart' : 'heart-o'
              }
              size={22}
              color={
                item.likes.includes(auth.currentUser?.uid) ? 'red' : '#ffffff'
              }
            />
          </Pressable>
          <Text style={styles.counterText}>{item.likes.length}</Text>
        </View>
        <View style={styles.likeAndCommentButton}>
          <Pressable>
            <Feather name={'message-circle'} size={22} color={'#ffffff'} />
          </Pressable>
          <Text style={styles.counterText}>23</Text>
        </View>
      </View>
    </View>
  );

  //HANDLE REFRESH
  const handleRefresh = () => {
    setLoading(true);
    setRefreshing(true);
    getFeeds();
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
        {loading ? (
          <Loading />
        ) : (
          <FlatList
            data={posts}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
            ItemSeparatorComponent={() => (
              <View style={[styles.seperatorLine, { borderWidth: 1 }]} />
            )}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor="#6366F1"
                colors={['#6366F1']}
              />
            }
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
    </>
  );
};
//muhammadaaliyan39@gmail.com Ahmad@123
export default HomeScreen;

const styles = StyleSheet.create({
  logoContainer: {
    width: 50,
    height: 50,
    backgroundColor: '#202652',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoAndText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
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
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  seperatorLine: {
    borderBottomWidth: 0.6,
    borderColor: '#1e293b',
  },
  userProfileContainer: { flexDirection: 'row', gap: 20 },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
  timeStamp: { fontFamily: 'Inter', color: '#7C99AE' },
  postText: { fontFamily: 'Inter', color: '#ffffff', fontSize: 18 },
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
  likesUnlikesContainer: {
    paddingTop: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 30,
  },
  likeAndCommentButton: { flexDirection: 'row', gap: 15, alignItems: 'center' },
  counterText: { fontFamily: 'Inter', fontSize: 16, color: '#7C99AE' },
});
