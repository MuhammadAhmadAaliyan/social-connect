import { useState, useEffect, useRef } from 'react';
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
  Pressable,
  ActivityIndicator,
  Keyboard,
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
import { Feather } from '@expo/vector-icons';

//SCREEN TYPES
import { RootStackParamList } from '../navigation/routesType';

//OTHER COMPONENTS
import Loading from '../utils/Loading';
import DropdownMenu from '../utils/DropdownMenu';
import { getChatId } from '../utils/chat';
import ConfirmModal from '../utils/ConfimModal';
import StatusModal from '../utils/StatusModal';

//AUTH COMPONENTS
import { db } from '../firebase';
import {
  query,
  orderBy,
  collection,
  serverTimestamp,
  addDoc,
  doc,
  setDoc,
  onSnapshot,
  getDocs,
  writeBatch,
  updateDoc,
  limit,
  startAfter,
} from 'firebase/firestore';

//NOTIFICATION COMPONENT
import { sendPushNotification } from '../utils/sendPushNotification';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const MessageScreen = ({ route }: any) => {
  //HOOKS
  const navigation = useNavigation<NavigationProp>();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any>([]);
  const [statusModalLoading, setStatusModalLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modalHeader, setModalHeader] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const { currentUser } = useSelector((state: RootState) => state.user);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    right: 0,
  });
  const flatListRef = useRef<FlatList>(null);
  const [lastDoc, setLastDoc] = useState<any>();
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const PAGE_SIZE = 5;

  const userId = route.params?.userId;
  const userImage = route.params?.userImage;
  const username = route.params?.username;
  const isFirstLoad = useRef(true);
  const isLoadingMore = useRef(false);

  //REAL TIME LISTENER
  useEffect(() => {
    if (!currentUser?.id || !userId) return;

    const chatId = getChatId(currentUser.id, userId);

    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('createdAt', 'desc'), // ← desc to get latest first
      limit(PAGE_SIZE),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt:
            doc.data().createdAt?.toDate?.().toISOString() ??
            new Date().toISOString(),
        }))
        .reverse(); // ← reverse so oldest is on top

      setMessages(msgs);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]); // ← save last doc for pagination
      setHasMore(snapshot.docs.length === PAGE_SIZE);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser?.id, userId]);

  useEffect(() => {
    if (messages.length > 0 && isFirstLoad.current) {
      flatListRef.current?.scrollToEnd({ animated: false });
      isFirstLoad.current = false;
    }
  }, [messages]);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    return () => showSubscription.remove();
  }, []);

  const loadMoreMessages = async () => {
    if (!hasMore || loadingMore || !lastDoc) return;

    isLoadingMore.current = true;
    setLoadingMore(true);
    const chatId = getChatId(currentUser.id, userId);

    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('createdAt', 'desc'),
      startAfter(lastDoc),
      limit(PAGE_SIZE),
    );

    const snapshot = await getDocs(q);
    const olderMsgs = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt:
          doc.data().createdAt?.toDate?.().toISOString() ??
          new Date().toISOString(),
      }))
      .reverse();

    setMessages((prev: any) => [...olderMsgs, ...prev]);
    setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
    setHasMore(snapshot.docs.length === PAGE_SIZE);
    isLoadingMore.current = false;
    setLoadingMore(false);
  };

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
  const renderItem = ({ item }: any) => {
    const isOwn = item.userId === currentUser?.id;

    return (
      <View
        style={[
          styles.messageRow,
          isOwn ? styles.messageRowRight : styles.messageRowLeft,
        ]}
      >
        {/*MESSAGE BUBBLE*/}
        <View
          style={[
            styles.messageBubble,
            isOwn ? styles.ownBubble : styles.otherBubble,
          ]}
        >
          <Text style={styles.message}>{item.message}</Text>
          <Text
            style={[
              styles.timestamp,
              {
                textAlign: 'right',
                color: isOwn ? 'rgba(255,255,255,0.5)' : '#475569',
              },
            ]}
          >
            {getTimeAgo(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  //METHOD FOR SEND MESSAGE
  const sendMessage = async () => {
    if (!message.trim() || !currentUser || !userId) return;
    const chatId = getChatId(currentUser?.id, userId);
    const tempId = Date.now().toString();

    const tempMessage = {
      id: tempId,
      userId: currentUser.id,
      message: message.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages((prev: any) => [...prev, tempMessage]);
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
    setMessage('');

    try {
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      const chatRef = doc(db, 'chats', chatId);

      await setDoc(
        chatRef,
        {
          participants: [currentUser.id, userId],
          lastMessage: tempMessage.message,
          lastMessageAt: serverTimestamp(),
        },
        { merge: true },
      );

      const docRef = await addDoc(messagesRef, {
        userId: currentUser.id,
        message: tempMessage.message,
        createdAt: serverTimestamp(),
        read: false,
      });

      setMessages((prev: any) =>
        prev.map((m: any) => (m.id === tempId ? { ...m, id: docRef.id } : m)),
      );

      // Push notification
      if (userId !== currentUser.id) {
        await sendPushNotification(
          userId,
          'New Message',
          `${currentUser.username}: ${tempMessage.message}`,
        );
      }
    } catch (err) {
      console.log('Error sending message:', err);

      setMessages((prev: any) => prev.filter((m: any) => m.id !== tempId));
      setMessage(tempMessage.message);
    }
  };

  //METHOD FOR CLEARING CHAT
  const clearChat = async () => {
    if (!currentUser?.id || !userId) return;

    setStatusModalLoading(true);
    setModalVisible(true);

    const chatId = getChatId(currentUser.id, userId);
    const messagesRef = collection(db, 'chats', chatId, 'messages');

    try {
      const snapshot = await getDocs(messagesRef);

      const batch = writeBatch(db);
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      await updateDoc(doc(db, 'chats', chatId), {
        lastMessage: '',
        lastMessageAt: serverTimestamp(),
      });

      setModalHeader('Success');
      setModalMessage('Chat cleared successfully.');
      setMessages([]);
      setStatusModalLoading(false);
      setModalVisible(true);
    } catch (err) {
      console.log('Error clearing chat:', err);
    }
  };

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
          <View style={styles.headerContainer}>
            <View style={styles.header}>
              {/*BACK BUTTON*/}
              <Pressable
                style={{ paddingRight: responsiveWidth(2.5) }}
                onPress={() => navigation.goBack()}
              >
                <Feather name={'arrow-left'} size={24} color={'#ffffff'} />
              </Pressable>
              {/*PROFILE PICTURE*/}
              {userImage ? (
                <Image
                  source={{ uri: userImage }}
                  style={styles.userImage}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={[styles.userImage, { backgroundColor: '#059669' }]}
                >
                  <Text style={styles.initials}>{getInitials(username)}</Text>
                </View>
              )}
              <Text style={styles.headerUsername}>{username}</Text>
            </View>
            <Pressable
              onPress={(event) => {
                // GET THE POSTION OF THE BUTTON ON THE SCREEN
                const { pageY, pageX } = event.nativeEvent;
                setDropdownPosition({
                  top: pageY,
                  right: responsiveWidth(100) - pageX,
                });
                setDropdownVisible(true);
              }}
            >
              <Feather name={'more-vertical'} size={24} color={'#ffffff'} />
            </Pressable>
          </View>

          {/*SEPARATOR LINE*/}
          <View style={styles.seperatorLine} />

          {/*MESSAGES LIST*/}
          {loading ? (
            <Loading />
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item: any) => item.id}
              contentContainerStyle={{
                padding: responsiveWidth(5),
                flexGrow: 1,
              }}
              // ✅ maintains scroll position when older messages are prepended
              maintainVisibleContentPosition={{
                minIndexForVisible: 0,
              }}
              // ✅ more reliable than onScroll for detecting top
              onScrollBeginDrag={({ nativeEvent }) => {
                if (
                  nativeEvent.contentOffset.y < 50 &&
                  hasMore &&
                  !isLoadingMore.current
                ) {
                  loadMoreMessages();
                }
              }}
              // ✅ also trigger when scroll ends near top
              onMomentumScrollEnd={({ nativeEvent }) => {
                if (
                  nativeEvent.contentOffset.y < 50 &&
                  hasMore &&
                  !isLoadingMore.current
                ) {
                  loadMoreMessages();
                }
              }}
              scrollEventThrottle={400}
              ListHeaderComponent={
                loadingMore ? (
                  <ActivityIndicator
                    color="#6366F1"
                    style={{ marginVertical: responsiveHeight(1) }}
                  />
                ) : null
              }
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No Messages yet</Text>
                </View>
              }
              keyboardShouldPersistTaps="handled"
              renderItem={renderItem}
            />
          )}

          {/*SEPARATOR LINE*/}
          <View style={styles.seperatorLine} />

          {/*COMMENT INPUT*/}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Message"
              placeholderTextColor="#475569"
              value={message}
              onChangeText={setMessage}
              multiline
            />
            <TouchableOpacity
              style={[styles.sendButton, !message.trim() && { opacity: 0.4 }]}
              disabled={!message.trim()}
              onPress={() => {
                sendMessage();
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
        loading={statusModalLoading}
        onPressButton={() => {
          setModalVisible(false);
        }}
      />
      {/*DROP DOWN MENU*/}
      <DropdownMenu
        visible={dropdownVisible}
        top={dropdownPosition.top}
        right={dropdownPosition.right}
        onClose={() => setDropdownVisible(false)}
        items={[
          {
            label: 'Clear Chat',
            onPress: () => setConfirmModalVisible(true),
          },
        ]}
      />
      {/*CONFIRM CLEAR CHATTING*/}
      <ConfirmModal
        visible={confirmModalVisible}
        title="Clear?"
        message="Are you sure you want to clear chat?"
        onConfirm={() => {
          setConfirmModalVisible(false);
          clearChat();
        }}
        onCancel={() => setConfirmModalVisible(false)}
      />
    </>
  );
};

export default MessageScreen;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerUsername: {
    fontSize: responsiveFontSize(2),
    fontFamily: 'Inter',
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: responsiveWidth(5),
    paddingTop: responsiveHeight(6),
    paddingBottom: responsiveHeight(2),
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
    color: '#475569',
    fontSize: responsiveFontSize(2.2),
    fontWeight: 'bold',
    fontFamily: 'Inter',
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

  messageRow: {
    flexDirection: 'row',
    marginBottom: responsiveHeight(2),
    alignItems: 'flex-end',
  },
  messageRowRight: {
    justifyContent: 'flex-end',
  },
  messageRowLeft: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    borderRadius: responsiveWidth(4),
    padding: responsiveWidth(2.5),
    marginHorizontal: responsiveWidth(2),
    minWidth: responsiveWidth(20),
  },
  ownBubble: {
    backgroundColor: '#6366F1',
    borderBottomRightRadius: 0,
  },
  otherBubble: {
    backgroundColor: '#1e293b',
    borderBottomLeftRadius: 0,
  },

  message: {
    color: '#ffffff',
    fontFamily: 'Inter',
    fontSize: responsiveFontSize(1.8),
  },

  timestamp: {
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
