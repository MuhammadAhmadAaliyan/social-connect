import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

//AUTH COMPONENTS
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

//SCREEN TYPES
import { RootStackParamList } from '../navigation/routesType';

//OTHER COMPONENTS
import Loading from '../utils/Loading';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ProfileScreen = () => {
  //HOOKS
  const [userData, setUserData] = useState<any>();
  const navigation = useNavigation<NavigationProp>();
  const [loading, setLoading] = useState(true);

  //FETCH USER PROFILE DATA FROM FIRESTORE
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const docRef = doc(db, 'users', user.uid);
        const snapShot = await getDoc(docRef);

        if (snapShot.exists()) {
          setUserData(snapShot.data());
        } else {
          console.log('No user found.');
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

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
      {/*HEADER*/}
      <View style={styles.header}>
        <Text style={styles.headerText}>Profile</Text>
        <Pressable
          style={styles.editButton}
          onPress={() => {
            navigation.navigate('EditProfile');
          }}
        >
          <Feather name="edit" size={30} color={'#ffffff'} />
        </Pressable>
      </View>
      {/*SEPERATOR LINE*/}
      <View style={styles.seperatorLine} />
      {/*MAIN AREA*/}
      <SafeAreaView style={styles.mainArea} edges={{ top: 'off' }}>
        {loading ? (
          <Loading />
        ) : (
          <ScrollView>
            {/*PROFILE PICTURE*/}
            <View style={{ paddingHorizontal: 20 }}>
              <Text style={styles.subText}>AVATAR</Text>
              {userData.userImage ? (
                <Image
                  source={{ uri: userData.userImage }}
                  resizeMode={'contain'}
                  style={[
                    styles.profileImage,
                    { backgroundColor: 'transparent' },
                  ]}
                />
              ) : (
                <View style={styles.profileImage}>
                  <Text style={styles.nameInitials}>
                    {getInitials(userData.username)}
                  </Text>
                </View>
              )}
            </View>
            {/*SEPERATOR LINE*/}
            <View style={[styles.seperatorLine, { marginTop: 16 }]} />
            {/*BASIC INFORMATION*/}
            <View style={{ paddingHorizontal: 20 }}>
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
            <View style={[styles.seperatorLine, { marginTop: 16 }]} />
            <View style={{ paddingHorizontal: 20 }}>
              <Text style={styles.subText}>ABOUT</Text>
              <Text style={styles.text}>Bio</Text>
              <View
                style={[
                  styles.infoFields,
                  { height: 'auto', marginBottom: 16 },
                ]}
              >
                <Text
                  style={[
                    styles.text,
                    { paddingVertical: 10 },
                    !userData.bio && { color: 'rgba(148, 163, 184, 0.3)' },
                  ]}
                >
                  {userData.bio ? userData.bio : 'No Bio'}
                </Text>
              </View>
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  header: {
    padding: 20,
    paddingTop: 50,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerText: {
    fontSize: 24,
    fontFamily: 'Inter',
    fontWeight: 'bold',
    color: '#ffffff',
    textAlignVertical: 'center',
  },
  editButton: {
    backgroundColor: '#6366F1',
    borderWidth: 0.5,
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
  mainArea: {
    flex: 1,
  },
  profileImage: {
    width: 120,
    height: 120,
    backgroundColor: '#059669',
    borderRadius: 60,
    alignSelf: 'center',
    marginVertical: 20,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameInitials: {
    fontFamily: 'Inter',
    fontSize: 50,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subText: {
    fontSize: 16,
    fontFamily: 'Inter',
    color: '#7C99AE',
    paddingTop: 10,
    fontWeight: 800,
  },
  text: {
    fontSize: 16,
    fontFamily: 'Inter',
    color: '#ffffff',
    paddingVertical: 20,
  },
  infoFields: {
    backgroundColor: '#1e293b',
    height: 50,
    borderWidth: 0.5,
    borderColor: '#7C99AE',
    borderRadius: 15,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
});
