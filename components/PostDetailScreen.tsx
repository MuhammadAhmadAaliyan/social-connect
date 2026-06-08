import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import {
  doc,
  getDoc,
  updateDoc,
  arrayRemove,
  arrayUnion,
  onSnapshot,
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Image } from 'expo-image';
import { optimizeImageUrl } from '../utils/optimizedImageUrl';
import PagerView from 'react-native-pager-view';
import {
  responsiveWidth,
  responsiveHeight,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

//TYPE SCREEN
import { RootStackParamList } from '../navigation/routesType';

//OTHER COMPONENTS
import Loading from '../utils/Loading';
import LikeButton from '../utils/LikeButton';
import BackButton from '../utils/BackButton';

//NOTIFICATION COMPONENT
import { sendPushNotification } from '../utils/sendPushNotification';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const PostDetailScreen = ({ route }: any) => {
  const { postId } = route.params;
  const navigation = useNavigation<NavigationProp>();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  //TRY REDUX FIRST, THEN FALLBACK TO FIRESTORE
  useEffect(() => {
    if (!postId) return;

    const unsubscribe = onSnapshot(doc(db, 'posts', postId), async (snap) => {
      try {
        if (snap.exists()) {
          const data = snap.data();

          const userSnap = await getDoc(doc(db, 'users', data.userId));
          const user = userSnap.exists()
            ? { id: userSnap.id, ...userSnap.data() }
            : null;

          setPost({
            id: snap.id,
            ...data,
            createdAt: data.createdAt?.toDate().toISOString() || null,
            user,
          });
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [postId]);

  const toggleLikes = async (postId: string) => {
    const userId = currentUser?.id;
    if (!userId || !post) return;

    const postRef = doc(db, 'posts', postId);
    const alreadyLiked = post.likes.includes(userId);

    setPost((prev: any) => ({
      ...prev,
      likes: alreadyLiked
        ? prev.likes.filter((id: string) => id !== userId)
        : [...prev.likes, userId],
    }));

    try {
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
      setPost((prev: any) => ({
        ...prev,
        likes: alreadyLiked
          ? [...prev.likes, userId]
          : prev.likes.filter((id: string) => id !== userId),
      }));
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

  if (loading) return <Loading />;
  if (!post)
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: '#0F172A',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#ffffff' }}>Post not found</Text>
      </SafeAreaView>
    );

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: '#0F172A' }}
      edges={{ top: 'additive', bottom: 'additive' }}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={styles.headerText}>Post Detail</Text>
        <View style={{ width: 24 }} />
      </View>
      <View style={styles.seperatorLine} />

      <ScrollView contentContainerStyle={{ padding: responsiveWidth(5) }}>
        {/* USER PROFILE */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={styles.userProfileContainer}>
            {post.user?.userImage ? (
              <Pressable
                onPress={() =>
                  navigation.navigate('ViewProfile', { userId: post.userId })
                }
              >
                <Image
                  source={{ uri: optimizeImageUrl(post.user.userImage) }}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                  transition={200}
                  style={styles.userImage}
                />
              </Pressable>
            ) : (
              <Pressable
                style={[styles.userImage, { backgroundColor: '#059669' }]}
                onPress={() =>
                  navigation.navigate('ViewProfile', { userId: post.userId })
                }
              >
                <Text style={styles.profileInitials}>
                  {getInitials(post.user?.username)}
                </Text>
              </Pressable>
            )}
            <View style={{ justifyContent: 'flex-start' }}>
              <Text style={styles.userName}>{post.user?.username}</Text>
              <Text style={styles.timeStamp}>{getTimeAgo(post.createdAt)}</Text>
            </View>
          </View>
        </View>

        {/* POST TEXT */}
        {post.postText ? (
          <View style={{ marginTop: responsiveHeight(2.5) }}>
            <Text style={styles.postText}>{post.postText}</Text>
          </View>
        ) : null}

        {/* POST IMAGES */}
        {Array.isArray(post.postImages) && post.postImages.length > 0 ? (
          <View style={styles.sliderContainer}>
            <PagerView
              style={{ height: responsiveHeight(40) }}
              initialPage={0}
              onPageSelected={(e) => setActiveIndex(e.nativeEvent.position)}
            >
              {post.postImages.map((uri: string, index: number) => (
                <View style={styles.postImageContainer} key={index}>
                  <Image
                    source={{ uri: optimizeImageUrl(uri) }}
                    style={styles.postImage}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                    transition={200}
                  />
                </View>
              ))}
            </PagerView>
            {post.postImages.length > 1 && (
              <View style={styles.dotsContainer}>
                {post.postImages.map((_: any, i: number) => (
                  <View
                    key={i}
                    style={[styles.dot, i === activeIndex && styles.activeDot]}
                  />
                ))}
              </View>
            )}
          </View>
        ) : null}

        {/* LIKES & COMMENTS */}
        <View style={styles.likesUnlikesContainer}>
          <LikeButton
            postId={post.id}
            liked={post.likes.includes(auth.currentUser?.uid)}
            likeCount={post.likes.length}
            onToggle={toggleLikes}
          />
          <Pressable
            onPress={() =>
              navigation.navigate('Comment', {
                postId: post.id,
                postOwnerId: post.userId,
              })
            }
            style={styles.likeAndCommentButton}
          >
            <Feather
              name="message-circle"
              size={responsiveWidth(5.5)}
              color="#ffffff"
            />
            <Text style={styles.counterText}>
              {formatCount(post.commentsCount ?? 0)}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PostDetailScreen;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: responsiveWidth(5),
    paddingVertical: responsiveHeight(2),
    alignItems: 'center',
  },

  headerText: {
    fontSize: responsiveFontSize(3),
    fontFamily: 'Inter-Bold',
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
    fontFamily: 'Inter-SemiBold',
    fontSize: responsiveFontSize(2),
    color: '#ffffff',
  },

  timeStamp: {
    fontFamily: 'Inter-Regular',
    color: '#7C99AE',
    fontSize: responsiveFontSize(1.8),
  },

  postText: {
    fontFamily: 'Inter-Regular',
    color: '#ffffff',
    fontSize: responsiveFontSize(2.2),
  },

  sliderContainer: {
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
    fontFamily: 'Inter-Regular',
    fontSize: responsiveFontSize(2),
    color: '#7C99AE',
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
