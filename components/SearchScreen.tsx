import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import { collection, getDocs } from 'firebase/firestore';
import {
  responsiveWidth,
  responsiveHeight,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import { db } from '../firebase';
import { optimizeImageUrl } from '../utils/optimizedImageUrl';
import { RootStackParamList } from '../navigation/routesType';

//OTHER COMPONENTS

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

//USER RESULT ITEM
const UserSearchItem = ({ item }: any) => {
  const navigation = useNavigation<NavigationProp>();

  const getInitials = (name: string) => {
    if (!name) return '';
    const words = name.trim().split(' ');
    if (words.length === 1) return words[0][0].toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  };

  return (
    <Pressable
      style={styles.resultItem}
      onPress={() => navigation.navigate('ViewProfile', { userId: item.id })}
    >
      {item.userImage ? (
        <Image
          source={{ uri: optimizeImageUrl(item.userImage) }}
          style={styles.avatar}
          contentFit="cover"
          cachePolicy="memory-disk"
        />
      ) : (
        <View style={[styles.avatar, { backgroundColor: '#059669' }]}>
          <Text style={styles.initials}>{getInitials(item.username)}</Text>
        </View>
      )}
      <View style={styles.resultInfo}>
        <Text style={styles.resultName}>{item.username}</Text>
        <Text style={styles.resultSub} numberOfLines={1}>
          {item.bio || 'No bio yet'}
        </Text>
      </View>
      <Feather
        name="chevron-right"
        size={responsiveWidth(4.5)}
        color="#475569"
      />
    </Pressable>
  );
};

//POST RESULT ITEM
const PostSearchItem = ({ item }: any) => {
  const navigation = useNavigation<NavigationProp>();
  return (
    <Pressable
      style={styles.resultItem}
      onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
    >
      <View style={styles.postIconContainer}>
        <Feather name="file-text" size={responsiveWidth(5)} color="#6366F1" />
      </View>
      <View style={styles.resultInfo}>
        <Text style={styles.resultName} numberOfLines={1}>
          {item.postText}
        </Text>
        <Text style={styles.resultSub}>
          {item.postImages?.length > 0
            ? `${item.postImages.length} image(s)`
            : 'Text post'}
        </Text>
      </View>
      <Feather
        name="chevron-right"
        size={responsiveWidth(4.5)}
        color="#475569"
      />
    </Pressable>
  );
};

const SearchScreen = () => {
  const [searchText, setSearchText] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  //SEARCH USERS AND POSTS
  const searchUsersAndPosts = async (text: string) => {
    if (!text.trim()) {
      setUsers([]);
      setPosts([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setSearched(true);

    const lower = text.toLowerCase();

    // FETCH ALL AND FILTER CLIENT SIDE
    const [usersSnap, postsSnap] = await Promise.all([
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'posts')),
    ]);

    const filteredUsers = usersSnap.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((user: any) => user.username?.toLowerCase().includes(lower));

    const filteredPosts = postsSnap.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((post: any) => post.postText?.toLowerCase().includes(lower));

    setUsers(filteredUsers);
    setPosts(filteredPosts);
    setLoading(false);
  };

  // DEBOUNCED SEARCH
  useEffect(() => {
    const timeout = setTimeout(() => {
      searchUsersAndPosts(searchText);
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchText]);

  //BUILD FLATLIST DATA
  const listData = [
    ...(users.length > 0
      ? [{ type: 'header', title: 'Users', id: 'header-users' }]
      : []),
    ...users.map((u) => ({ type: 'user', ...u })),
    ...(posts.length > 0
      ? [{ type: 'header', title: 'Posts', id: 'header-posts' }]
      : []),
    ...posts.map((p) => ({ type: 'post', ...p })),
  ];

  return (
    <>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: '#0F172A' }}
        edges={{ bottom: 'off' }}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerText}>Search</Text>
        </View>
        {/*SEPERATOR LINE*/}
        <View style={styles.seperatorLine} />
        {/* SEARCH BAR */}
        <View style={styles.searchContainer}>
          <Feather name="search" size={responsiveWidth(4.5)} color="#475569" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users or posts..."
            placeholderTextColor="#475569"
            value={searchText}
            onChangeText={setSearchText}
            autoCapitalize="none"
          />
          {searchText.length > 0 && (
            <Pressable onPress={() => setSearchText('')}>
              <Feather name="x" size={responsiveWidth(4.5)} color="#475569" />
            </Pressable>
          )}
        </View>

        {/* RESULTS */}
        {loading ? (
          <ActivityIndicator
            color="#6366F1"
            style={{ marginTop: responsiveHeight(5) }}
          />
        ) : (
          <FlatList
            data={listData}
            keyboardShouldPersistTaps={'handled'}
            keyExtractor={(item: any) => item.id ?? item.title}
            contentContainerStyle={{ padding: responsiveWidth(4), flexGrow: 1 }}
            renderItem={({ item }: any) => {
              if (item.type === 'header') {
                return <Text style={styles.sectionHeader}>{item.title}</Text>;
              }
              if (item.type === 'user') {
                return <UserSearchItem item={item} />;
              }
              if (item.type === 'post') {
                return <PostSearchItem item={item} />;
              }
              return null;
            }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                {searched ? (
                  <>
                    <Feather
                      name="search"
                      size={responsiveWidth(12)}
                      color="#1e293b"
                    />
                    <Text style={styles.emptyText}>No results found</Text>
                    <Text style={styles.emptySubText}>
                      Try searching with a different keyword
                    </Text>
                  </>
                ) : (
                  <>
                    <Feather
                      name="search"
                      size={responsiveWidth(12)}
                      color="#1e293b"
                    />
                    <Text style={styles.emptyText}>
                      Search for users or posts
                    </Text>
                    <Text style={styles.emptySubText}>
                      Type something to get started
                    </Text>
                  </>
                )}
              </View>
            }
          />
        )}
      </SafeAreaView>
    </>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  header: {
    padding: responsiveWidth(5),
    paddingTop: responsiveHeight(6),
    paddingBottom: responsiveHeight(2),
  },

  headerText: {
    fontSize: responsiveFontSize(3),
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    textAlignVertical: 'center',
  },

  seperatorLine: {
    borderBottomWidth: responsiveWidth(0.15),
    borderColor: '#1e293b',
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    marginHorizontal: responsiveWidth(4),
    borderRadius: responsiveWidth(4),
    paddingHorizontal: responsiveWidth(3),
    marginBottom: responsiveHeight(2),
    gap: responsiveWidth(2.5),
    borderWidth: responsiveWidth(0.1),
    borderColor: '#334155',
    marginTop: responsiveHeight(4),
    height: responsiveHeight(6.5),
  },

  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontFamily: 'Inter-Regular',
    fontSize: responsiveFontSize(1.8),
  },

  sectionHeader: {
    fontSize: responsiveFontSize(1.6),
    fontFamily: 'Inter-Bold',
    color: '#475569',
    marginTop: responsiveHeight(1),
    marginBottom: responsiveHeight(1),
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: responsiveWidth(3),
    padding: responsiveWidth(3.5),
    marginBottom: responsiveHeight(1.2),
    gap: responsiveWidth(3),
  },

  avatar: {
    width: responsiveWidth(12),
    height: responsiveWidth(12),
    borderRadius: responsiveWidth(6),
    justifyContent: 'center',
    alignItems: 'center',
  },

  initials: {
    color: '#ffffff',
    fontFamily: 'Inter-SemiBold',
    fontSize: responsiveFontSize(1.8),
  },

  resultInfo: {
    flex: 1,
  },

  resultName: {
    color: '#ffffff',
    fontFamily: 'Inter-SemiBold',
    fontSize: responsiveFontSize(1.8),
  },

  resultSub: {
    color: '#475569',
    fontFamily: 'Inter-Regular',
    fontSize: responsiveFontSize(1.5),
    marginTop: responsiveHeight(0.3),
  },

  postIconContainer: {
    width: responsiveWidth(12),
    height: responsiveWidth(12),
    borderRadius: responsiveWidth(3),
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: responsiveHeight(1.5),
  },

  emptyText: {
    color: '#ffffff',
    fontFamily: 'Inter-Bold',
    fontSize: responsiveFontSize(2),
  },

  emptySubText: {
    color: '#475569',
    fontFamily: 'Inter-Regular',
    fontSize: responsiveFontSize(1.7),
  },
});
