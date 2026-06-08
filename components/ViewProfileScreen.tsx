import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import PagerView from 'react-native-pager-view';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from 'react-native-responsive-dimensions';
import { RootState, AppDispatch } from '../redux/store';
import { useSelector, useDispatch } from 'react-redux';
import { toggleFollow } from '../redux/slices/userSlice';
import { toggleLike, removePost } from '../redux/slices/postsSlice';
import { Feather } from '@expo/vector-icons';

//AUTH COMPONENTS
import { db } from '../firebase';
import {
  arrayRemove,
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  query,
  collection,
  where,
  orderBy,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';

//NOTIFICATION COMPONENT
import { sendPushNotification } from '../utils/sendPushNotification';

//SCREEN TYPES
import { RootStackParamList } from '../navigation/routesType';

//OTHER COMPONENTS
import Loading from '../utils/Loading';
import BackButton from '../utils/BackButton';
import StatusModal from '../utils/StatusModal';
import Button from '../utils/Button';
import ConfirmModal from '../utils/ConfimModal';
import LikeButton from '../utils/LikeButton';
import DropdownMenu from '../utils/DropdownMenu';
import { optimizeImageUrl } from '../utils/optimizedImageUrl';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ViewProfileScreen = ({ route }: any) => {
  //HOOKS
  const [userData, setUserData] = useState<any>();
  const navigation = useNavigation<NavigationProp>();
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalHeader, setModalHeader] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [userPosts, setUserPosts] = useState<any>();
  const dispatch = useDispatch<AppDispatch>();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    right: 0,
  });
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);

  const userId = route.params?.userId;

  const isFollowing = userData?.followers?.includes(currentUser?.id);
  const isFollowBack = userData?.followings?.includes(currentUser?.id);
  const isOwnProfile = userId === currentUser?.id;

  //FETCH USER PROFILE DATA FROM FIRESTORE
  useEffect(() => {
    if (!userId) return;

    const unsubscribe = onSnapshot(
      query(
        collection(db, 'posts'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
      ),
      async (postsSnap) => {
        try {
          const userSnap = await getDoc(doc(db, 'users', userId));
          let userData: any = null;

          if (userSnap.exists()) {
            userData = { id: userSnap.id, ...userSnap.data() };
            setUserData(userData);
          }

          const posts = postsSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate().toISOString() || null,
            user: userData,
          }));

          setUserPosts(posts);
        } catch (err) {
          setModalHeader('Error');
          setModalMessage('Unable to load profile. Try again later');
          setModalVisible(true);
          console.log(err);
        } finally {
          setLoading(false);
        }
      },
    );

    return () => unsubscribe();
  }, [userId]);

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

  //METHOD FOR FOLLOW/UNFOLLOW
  const toggleFollowUnfollow = async () => {
    const currentUserId = currentUser?.id;
    if (!currentUserId) return;

    dispatch(toggleFollow({ userId }));
    setUserData((prev: any) => ({
      ...prev,
      followers: isFollowing
        ? prev.followers.filter((id: string) => id !== currentUserId)
        : [...(prev.followers || []), currentUserId],
    }));

    try {
      const userDoc = doc(db, 'users', userId);
      const currentUserDoc = doc(db, 'users', currentUserId);
      if (isFollowing) {
        await updateDoc(userDoc, { followers: arrayRemove(currentUserId) });
        await updateDoc(currentUserDoc, { followings: arrayRemove(userId) });
      } else {
        await updateDoc(userDoc, { followers: arrayUnion(currentUserId) });
        await updateDoc(currentUserDoc, { followings: arrayUnion(userId) });
      }

      // Push notification
      if (userId !== currentUser.id && !isFollowing) {
        await sendPushNotification(
          userId,
          'New Follower',
          isFollowBack
            ? `${currentUser.username} followed you back`
            : `${currentUser.username} started following you`,
        );
      }
    } catch (err) {
      console.log('Error while toggle Followers/Followings: ', err);

      dispatch(toggleFollow({ userId }));
      setUserData((prev: any) => ({
        ...prev,
        followers: isFollowing
          ? [...(prev.followers || []), currentUserId]
          : prev.followers.filter((id: string) => id !== currentUserId),
      }));
    }
  };

  //METHOD FOR HANDLING LIKES/UNLIKES
  const toggleLikes = async (postId: string) => {
    const userId = currentUser?.id;
    if (!userId) return;

    const postRef = doc(db, 'posts', postId);
    const post = userPosts.find((p: any) => p.id === postId);
    const alreadyLiked = post.likes.includes(userId);

    dispatch(toggleLike({ postId, userId }));

    setUserPosts((prev: any) =>
      prev.map((p: any) => {
        if (p.id === postId) {
          return {
            ...p,
            likes: alreadyLiked
              ? p.likes.filter((id: string) => id !== userId)
              : [...p.likes, userId],
          };
        }
        return p;
      }),
    );

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

      dispatch(toggleLike({ postId, userId }));
      setUserPosts((prev: any) =>
        prev.map((p: any) => {
          if (p.id === postId) {
            return {
              ...p,
              likes: alreadyLiked
                ? [...p.likes, userId]
                : p.likes.filter((id: string) => id !== userId),
            };
          }
          return p;
        }),
      );
    }
  };

  //DELETE POST
  const deletePost = async (postId: any) => {
    if (!postId) return;

    dispatch(removePost(postId));

    try {
      await deleteDoc(doc(db, 'posts', postId));
      console.log('Post deleted Successfully');
    } catch (err) {
      console.log('Failed to delete: ', err);
      //REVERT UI IF DELETING FAILS
      //await dispatch(fetchPosts());
    }
  };

  //LIST HEADER COMPONENTS
  const listHeaderComponents = () => {
    return (
      <View>
        {/*PROFILE PICTURE*/}
        <View style={{ paddingHorizontal: responsiveWidth(5) }}>
          <Text style={styles.subText}>AVATAR</Text>
          {userData.userImage ? (
            <Image
              source={{ uri: userData.userImage }}
              contentFit={'contain'}
              cachePolicy={'memory-disk'}
              transition={200}
              style={[styles.profileImage, { backgroundColor: 'transparent' }]}
            />
          ) : (
            <View style={styles.profileImage}>
              <Text style={styles.nameInitials}>
                {getInitials(userData.username)}
              </Text>
            </View>
          )}
          {/*PROFILE STATS*/}
          <View style={styles.profileStatsContainer}>
            <View>
              <Text style={styles.profileCounts}>
                {formatCount(userPosts.length)}
              </Text>
              <Text style={styles.statsText}>Posts</Text>
            </View>
            <View style={styles.statsSeperator} />
            <View>
              <Text style={styles.profileCounts}>
                {formatCount(userData?.followers?.length)}
              </Text>
              <Text style={styles.statsText}>Followers</Text>
            </View>
            <View style={styles.statsSeperator} />
            <View>
              <Text style={styles.profileCounts}>
                {formatCount(userData?.followings?.length)}
              </Text>
              <Text style={styles.statsText}>Followings</Text>
            </View>
          </View>
          {/*PROFILE ACTIONS*/}
          {userId !== currentUser.id ? (
            isFollowing ? (
              <View style={{ paddingTop: responsiveHeight(3.5) }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}
                >
                  <Button
                    iconName1={'user-minus'}
                    text={'Unfollow'}
                    size={responsiveWidth(5)}
                    onPress={() => {
                      setModalHeader('Unfollow?');
                      setModalMessage(`Stop following ${userData?.username}?`);
                      setConfirmModalVisible(true);
                    }}
                    style={{ width: responsiveWidth(35) }}
                  />
                  <Button
                    text={'Message'}
                    size={responsiveWidth(5)}
                    onPress={() =>
                      navigation.navigate('Message', {
                        username: userData?.username,
                        userImage: userData?.userImage,
                        userId: userId,
                      })
                    }
                    style={{
                      backgroundColor: '#1e293b',
                      borderWidth: responsiveWidth(0.1),
                      borderColor: '#7C99AE',
                      width: responsiveWidth(50),
                    }}
                  />
                </View>
              </View>
            ) : (
              <View style={{ paddingTop: responsiveHeight(3.5) }}>
                <Button
                  iconName1={'user-plus'}
                  text={isFollowBack ? 'Follow Back' : 'Follow'}
                  size={responsiveWidth(5)}
                  onPress={() => toggleFollowUnfollow()}
                />
              </View>
            )
          ) : (
            <View style={{ marginVertical: responsiveHeight(2) }} />
          )}
        </View>
        {/*SEPERATOR LINE*/}
        <View
          style={[styles.seperatorLine, { marginTop: responsiveHeight(2) }]}
        />
        {/*BASIC INFORMATION*/}
        <View style={{ paddingHorizontal: responsiveWidth(5) }}>
          <Text style={styles.subText}>BASIC INFORMATION</Text>
          <Text style={styles.text}>Full Name</Text>
          <View style={styles.infoFields}>
            <Text style={[styles.text, { paddingVertical: 0 }]}>
              {userData.username}
            </Text>
          </View>
          <Text style={styles.text}>Email</Text>
          <View style={styles.infoFields}>
            <Text style={[styles.text, { paddingVertical: 0 }]}>
              {userData.email}
            </Text>
          </View>
        </View>
        {/*SEPERATOR LINE*/}
        <View
          style={[styles.seperatorLine, { marginTop: responsiveHeight(2) }]}
        />
        <View style={{ paddingHorizontal: responsiveWidth(5) }}>
          <Text style={styles.subText}>ABOUT</Text>
          <Text style={styles.text}>Bio</Text>
          <View
            style={[
              styles.infoFields,
              { height: 'auto', marginBottom: responsiveHeight(2) },
            ]}
          >
            <Text
              style={[
                styles.text,
                { paddingVertical: responsiveHeight(1.2) },
                !userData.bio && { color: 'rgba(148, 163, 184, 0.3)' },
              ]}
            >
              {userData.bio ? userData.bio : 'No Bio'}
            </Text>
          </View>
        </View>
        {/*SEPARATOR*/}
        <View style={styles.seperatorLine} />

        {/*POSTS HEADER*/}
        <View
          style={{
            paddingHorizontal: responsiveWidth(5),
          }}
        >
          <Text style={styles.subText}>POSTS</Text>
        </View>
      </View>
    );
  };

  //RENDER ITEM FUNCTION
  const renderItem = ({ item }: any) => {
    if (!userData) return null;
    return (
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
              <View>
                <Image
                  source={{ uri: item.user.userImage }}
                  contentFit="cover"
                  cachePolicy={'memory-disk'}
                  transition={200}
                  style={styles.userImage}
                />
              </View>
            ) : (
              <View style={[styles.userImage, { backgroundColor: '#059669' }]}>
                <Text style={styles.profileInitials}>
                  {getInitials(item.user?.username)}
                </Text>
              </View>
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
              <Feather
                name={'more-vertical'}
                size={responsiveWidth(6)}
                color={'#ffffff'}
              />
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
            <PagerView
              style={{ height: responsiveHeight(40) }}
              initialPage={activeIndex}
              onPageSelected={(e) => setActiveIndex(e.nativeEvent.position)}
            >
              {item.postImages.map((uri: any, index: number) => (
                <View style={styles.postImageContainer} key={index}>
                  <Image
                    source={{ uri: optimizeImageUrl(uri) }}
                    style={styles.postImage}
                    contentFit="cover"
                    cachePolicy={'memory-disk'}
                    transition={200}
                  />
                </View>
              ))}
            </PagerView>

            {/* DOT INDICATORS */}
            {item.postImages.length > 1 && (
              <View style={styles.dotsContainer}>
                {item.postImages.map((_: any, i: number) => (
                  <View
                    key={i}
                    style={[styles.dot, i === activeIndex && styles.activeDot]}
                  />
                ))}
              </View>
            )}
          </View>
        ) : null}
        {/*LIKES/UNLIKES & COMMENTS AREA*/}
        <View style={styles.likesUnlikesContainer}>
          <LikeButton
            postId={item?.id}
            liked={item.likes.includes(currentUser?.id)}
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
              <Feather
                name={'message-circle'}
                size={responsiveWidth(5.5)}
                color={'#ffffff'}
              />
              <Text style={styles.counterText}>
                {formatCount(item.commentsCount ?? 0)}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  };

  //CHECK IF CURRENT USER FOLLOWS THE USER OR NOT
  const shouldShowPosts = isFollowing || isOwnProfile;

  return (
    <>
      {/*HEADER*/}
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <View style={styles.profileTextContainer} pointerEvents="none">
          <Text style={styles.headerText}>Profile</Text>
        </View>
      </View>
      {/*SEPERATOR LINE*/}
      <View style={styles.seperatorLine} />
      {/*MAIN AREA*/}
      <SafeAreaView
        style={styles.mainArea}
        edges={{ top: 'off', bottom: 'additive' }}
      >
        {loading || !userData ? (
          <Loading />
        ) : (
          <FlatList
            data={shouldShowPosts ? userPosts : []}
            ListHeaderComponent={listHeaderComponents}
            ItemSeparatorComponent={() => (
              <View
                style={[
                  styles.seperatorLine,
                  { borderWidth: responsiveWidth(0.25) },
                ]}
              />
            )}
            renderItem={renderItem}
            ListEmptyComponent={() => (
              <View style={styles.emptyListComponentContainer}>
                {shouldShowPosts ? (
                  <>
                    <Feather
                      name={'file-text'}
                      size={responsiveWidth(10)}
                      color={'#475569'}
                    />
                    <Text style={styles.emptyContainerText1}>No posts yet</Text>
                  </>
                ) : (
                  <>
                    <Feather
                      name={'lock'}
                      size={responsiveWidth(10)}
                      color={'#475569'}
                    />
                    <Text style={styles.emptyContainerText2}>
                      This account is private
                    </Text>
                    <Text style={styles.emptyContainerText3}>
                      Follow to see their posts
                    </Text>
                  </>
                )}
              </View>
            )}
          />
        )}
      </SafeAreaView>
      <StatusModal
        modalVisible={modalVisible}
        loading={false}
        modalHeader={modalHeader}
        modalMessage={modalMessage}
        onPressButton={() => {
          navigation.goBack();
          setModalVisible(false);
        }}
      />
      <ConfirmModal
        visible={confirmModalVisible}
        title={modalHeader}
        message={modalMessage}
        onConfirm={() => {
          setConfirmModalVisible(false);
          if (modalHeader === 'Unfollow?') {
            toggleFollowUnfollow();
          } else if (modalHeader == 'Confirm Deletion') {
            deletePost(selectedPost?.id);
          }
        }}
        onCancel={() => setConfirmModalVisible(false)}
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
            onPress: () => {
              setModalHeader('Confrim Deletion');
              setModalMessage('Are you sure you want to delete this post?');
              setConfirmModalVisible(true);
            },
          },
        ]}
      />
    </>
  );
};

export default ViewProfileScreen;

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
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
  },

  profileTextContainer: {
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
    flex: 1,
  },

  profileImage: {
    width: responsiveWidth(32),
    height: responsiveWidth(32),
    backgroundColor: '#059669',
    borderRadius: responsiveWidth(16),
    alignSelf: 'center',
    marginVertical: responsiveHeight(2.5),
    marginBottom: responsiveHeight(2),
    justifyContent: 'center',
    alignItems: 'center',
  },

  nameInitials: {
    fontFamily: 'Inter-SemiBold',
    fontSize: responsiveFontSize(5),
    color: '#ffffff',
  },

  subText: {
    fontSize: responsiveFontSize(2),
    fontFamily: 'Inter-SemiBold',
    color: '#7C99AE',
    paddingTop: responsiveHeight(1.2),
  },

  text: {
    fontSize: responsiveFontSize(2),
    fontFamily: 'Inter-Regular',
    color: '#ffffff',
    paddingVertical: responsiveHeight(2.5),
  },

  infoFields: {
    backgroundColor: '#1e293b',
    height: responsiveHeight(6.5),
    borderWidth: responsiveWidth(0.1),
    borderColor: '#7C99AE',
    borderRadius: responsiveWidth(4),
    paddingHorizontal: responsiveWidth(3),
    justifyContent: 'center',
  },
  profileStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingTop: responsiveHeight(5),
  },
  profileCounts: {
    fontSize: responsiveFontSize(2.2),
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  statsText: { color: '#7C99AE' },
  statsSeperator: {
    borderRightWidth: 0.5,
    borderRightColor: '#7C99AE',
    alignSelf: 'stretch',
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
    fontFamily: 'Inter-SemiBold',
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
  emptyListComponentContainer: {
    alignItems: 'center',
    padding: responsiveWidth(10),
  },
  emptyContainerText1: {
    color: '#475569',
    marginTop: responsiveHeight(1),
  },
  emptyContainerText2: {
    color: '#ffffff',
    fontFamily: 'Inter-Bold',
    fontSize: responsiveFontSize(2),
    marginTop: responsiveHeight(1),
  },
  emptyContainerText3: {
    color: '#475569',
    fontFamily: 'Inter-Regular',
    fontSize: responsiveFontSize(1.6),
    marginTop: responsiveHeight(0.5),
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
