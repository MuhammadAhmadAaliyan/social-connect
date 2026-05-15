import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from 'react-native-responsive-dimensions';

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
            <View style={{ paddingHorizontal: responsiveWidth(5) }}>
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
    fontFamily: 'Inter',
    fontSize: responsiveFontSize(5),
    fontWeight: 'bold',
    color: '#ffffff',
  },

  subText: {
    fontSize: responsiveFontSize(2),
    fontFamily: 'Inter',
    color: '#7C99AE',
    paddingTop: responsiveHeight(1.2),
    fontWeight: '800',
  },

  text: {
    fontSize: responsiveFontSize(2),
    fontFamily: 'Inter',
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
});
