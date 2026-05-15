import { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import { SafeAreaView } from 'react-native-safe-area-context';

//SCREEN TYPES
import { RootStackParamList } from '../navigation/routesType';

//OTHER COMPONENTS
import BackButton from '../utils/BackButton';
import Loading from '../utils/Loading';
import StatusModal from '../utils/StatusModal';

//AUTH COMPONENTS
import { db } from '../firebase';
import {
  query,
  orderBy,
  getDocs,
  collection,
  updateDoc,
  serverTimestamp,
  addDoc,
  doc,
  increment,
} from 'firebase/firestore';

//NOTIFICATION COMPONENT
import { sendPushNotification } from '../utils/sendPushNotification';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const CommentScreen = ({ route }: any) => {
  //HOOKS
  const navigation = useNavigation<NavigationProp>();
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<any>([]);
  const [modalHeader, setModalHeader] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const { currentUser } = useSelector((state: RootState) => state.user);

  const postId = route.params?.postId;
  const postOwnerId = route.params?.postOwnerId;

  //FORMAT TIME METHOD
  const getTimeAgo = (timestamp: any) => {
    if (!timestamp) return '';

    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);

    const now: any = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 10) return 'Just now';
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

  //METHOD FOR RENDER ITEM
  const renderItem = ({ item }: any) => (
    <View style={styles.commentContainer}>
      {/*USER IMAGE*/}
      {item.user?.userImage ? (
        <Image
          source={{ uri: item.user?.userImage }}
          style={styles.userImage}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.userImage, { backgroundColor: '#059669' }]}>
          <Text style={styles.initials}>
            {getInitials(item.user?.username)}
          </Text>
        </View>
      )}
      {/*COMMENT CONTENT*/}
      <View style={styles.commentContent}>
        <View style={{ flexDirection: 'row', gap: responsiveWidth(2.5) }}>
          <Text style={styles.username}>{item.user?.username}</Text>
          <Text style={styles.timestamp}>{getTimeAgo(item.createdAt)}</Text>
        </View>
        <Text style={styles.commentText}>{item.commentText}</Text>
      </View>
    </View>
  );

  //METHOD FOR FETCH COMMENTS
  const fetchComments = async () => {
    try {
      const commentsSnap = await getDocs(
        query(
          collection(db, 'posts', postId, 'comments'),
          orderBy('createdAt', 'desc'),
        ),
      );

      const commentsData = commentsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const usersSnap = await getDocs(collection(db, 'users'));
      const users = usersSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const finalComments = commentsData.map((comment: any) => {
        const user = users.find((u: any) => u.id === comment.userId);
        return {
          ...comment,
          user: user || null,
        };
      });

      setComments(finalComments);
    } catch (err) {
      setModalHeader('Error');
      setModalMessage('Unable to load comments. Try again later');
      setLoading(false);
      setModalVisible(true);
      console.log('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  //METHOD FOR ADD COMMENT
  const addComment = async () => {
    if (!comment.trim()) return;
    if (!currentUser) return;

    const tempId = Date.now().toString();
    const tempComment = {
      id: tempId,
      userId: currentUser.id,
      commentText: comment.trim(),
      createdAt: { toDate: () => new Date() },
      user: {
        userId: currentUser.id,
        username: currentUser?.username || null,
        userImage: currentUser?.userImage || null,
      },
    };

    setComments((prev: any) => [tempComment, ...prev]);
    setComment('');

    try {
      const docRef = await addDoc(collection(db, 'posts', postId, 'comments'), {
        userId: currentUser.id,
        commentText: tempComment.commentText,
        createdAt: serverTimestamp(),
      });

      await updateDoc(doc(db, 'posts', postId), {
        commentsCount: increment(1),
      });
      await sendPushNotification(
        postOwnerId,
        'New Comment',
        `${currentUser.username} commented on your post`,
      );

      setComments((prev: any) =>
        prev.map((c: any) => (c.id === tempId ? { ...c, id: docRef.id } : c)),
      );
    } catch (err) {
      console.log('Error adding comment:', err);

      setComments((prev: any) => prev.filter((c: any) => c.id !== tempId));
      setComment(tempComment.commentText);
    }
  };

  useEffect(() => {
    const getComments = async () => {
      await fetchComments();
    };

    getComments();
  }, []);

  return (
    <>
      <SafeAreaView
        style={{ flex: 1 }}
        edges={{ top: 'off', bottom: 'additive' }}
      >
        <KeyboardAvoidingView
          style={{ flex: 1, backgroundColor: '#0F172A' }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/*HEADER*/}
          <View style={styles.header}>
            <BackButton onPress={() => navigation.goBack()} />
            <View style={styles.headerTextContainer} pointerEvents="none">
              <Text style={styles.headerText}>Comments</Text>
            </View>
          </View>

          {/*SEPARATOR LINE*/}
          <View style={styles.seperatorLine} />

          {/*COMMENTS LIST*/}
          {loading ? (
            <Loading />
          ) : (
            <FlatList
              data={comments}
              keyExtractor={(item: any) => item.id}
              contentContainerStyle={{
                padding: responsiveWidth(5),
                flexGrow: 1,
              }}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No comments yet</Text>
                  <Text style={styles.emptySubText}>
                    Be the first to comment!
                  </Text>
                </View>
              }
              renderItem={renderItem}
            />
          )}

          {/*SEPARATOR LINE*/}
          <View style={styles.seperatorLine} />

          {/*COMMENT INPUT*/}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Write a comment..."
              placeholderTextColor="#475569"
              value={comment}
              onChangeText={setComment}
              multiline
            />
            <TouchableOpacity
              style={[styles.sendButton, !comment.trim() && { opacity: 0.4 }]}
              disabled={!comment.trim()}
              onPress={() => {
                addComment();
              }}
            >
              <Ionicons name="send" size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
      <StatusModal
        modalVisible={modalVisible}
        modalHeader={modalHeader}
        modalMessage={modalMessage}
        loading={false}
        onPressButton={() => {
          setModalVisible(false);
          navigation.goBack();
        }}
      />
    </>
  );
};

export default CommentScreen;

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

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyText: {
    color: '#ffffff',
    fontSize: responsiveFontSize(2.2),
    fontWeight: 'bold',
    fontFamily: 'Inter',
  },

  emptySubText: {
    color: '#475569',
    fontSize: responsiveFontSize(1.8),
    fontFamily: 'Inter',
    marginTop: responsiveHeight(0.6),
  },

  commentContainer: {
    flexDirection: 'row',
    marginBottom: responsiveHeight(2.5),
    alignItems: 'flex-start',
  },

  userImage: {
    width: responsiveWidth(10),
    height: responsiveWidth(10),
    borderRadius: responsiveWidth(5),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: responsiveWidth(2.5),
  },

  initials: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: responsiveFontSize(2),
  },

  commentContent: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: responsiveWidth(3),
    padding: responsiveWidth(3),
  },

  username: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontFamily: 'Inter',
    fontSize: responsiveFontSize(1.8),
    marginBottom: responsiveHeight(0.5),
  },

  commentText: {
    color: '#ffffff',
    fontFamily: 'Inter',
    fontSize: responsiveFontSize(1.8),
  },

  timestamp: {
    color: '#475569',
    fontFamily: 'Inter',
    fontSize: responsiveFontSize(1.6),
  },

  inputContainer: {
    flexDirection: 'row',
    padding: responsiveWidth(4),
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },

  input: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: responsiveWidth(5),
    paddingHorizontal: responsiveWidth(4),
    paddingVertical: responsiveHeight(1.2),
    color: '#ffffff',
    fontFamily: 'Inter',
    fontSize: responsiveFontSize(1.8),
    marginRight: responsiveWidth(2.5),
    maxHeight: responsiveHeight(12),
  },

  sendButton: {
    width: responsiveWidth(11),
    height: responsiveWidth(11),
    borderRadius: responsiveWidth(5.5),
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
