import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

//AUTH COMPONENTS
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

//SCREEN TYPES
import { RootStackParamList } from '../navigation/routesType';

//OTHER COMPONENTS
import Loading from '../utils/Loading';
import BackButton from '../utils/BackButton';
import StatusModal from '../utils/StatusModal';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ViewProfileScreen = ({ route }: any) => {
  //HOOKS
  const [userData, setUserData] = useState<any>();
  const navigation = useNavigation<NavigationProp>();
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalHeader, setModalHeader] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  const userId = route.params?.userId;

  //FETCH USER PROFILE DATA FROM FIRESTORE
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        if (!userId) {
          throw new Error();
        }

        const docRef = doc(db, 'users', userId);
        const snapShot = await getDoc(docRef);

        if (snapShot.exists()) {
          setUserData(snapShot.data());
        } else {
          console.log('No user found.');
        }
      } catch (err) {
        setModalHeader('Error');
        setModalMessage('Unable to load profile. Try again later');
        setModalVisible(true);
        setLoading(false);
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
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
    </>
  );
};

export default ViewProfileScreen;

const styles = StyleSheet.create({
  header: {
    padding: 20,
    paddingTop: 50,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    fontFamily: 'Inter',
    fontWeight: 'bold',
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
