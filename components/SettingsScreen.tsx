import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';
import { clearCurrentUser } from '../redux/slices/userSlice';
import { AppDispatch } from '../redux/store';
import { useDispatch } from 'react-redux';

//AUTH COMPONENTS
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

//OTHER COMPONENTS
import ConfirmModal from '../utils/ConfimModal';

const SettingsScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [modalVisible, setModalVisible] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      dispatch(clearCurrentUser());
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      <SafeAreaView
        style={{ flex: 1 }}
        edges={{ top: 'additive', bottom: 'additive' }}
      >
        {/*HEADER*/}
        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerText}>Settings</Text>
          </View>
        </View>
        {/*SEPARATOR LINE*/}
        <View style={styles.seperatorLine} />
        <View style={{ flex: 1, justifyContent: 'center' }}>
          {/*LOGOUT BUTTON*/}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => {
              setModalVisible(true);
            }}
          >
            <MaterialIcons name={'logout'} size={30} color={'red'} />
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      <ConfirmModal
        visible={modalVisible}
        title="Confirmation"
        message="Are you sure you want to logout?"
        onConfirm={() => {
          setModalVisible(false);
          handleLogout();
        }}
        onCancel={() => setModalVisible(false)}
      />
    </>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  header: {
    padding: responsiveWidth(5),
    paddingTop: responsiveHeight(6),
    paddingBottom: responsiveHeight(2),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    fontSize: responsiveFontSize(3),
    fontFamily: 'Inter',
    fontWeight: 'bold',
    color: '#ffffff',
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
  logoutButton: {
    borderWidth: responsiveWidth(0.1),
    borderColor: '#7C99AE',
    backgroundColor: '#1e293b',
    height: responsiveHeight(7.5),
    padding: responsiveWidth(2),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: responsiveWidth(5),
    marginVertical: responsiveHeight(2.5),
    gap: responsiveWidth(4),
    marginHorizontal: responsiveWidth(5),
  },
  logoutButtonText: {
    fontSize: responsiveFontSize(2.4),
    fontFamily: 'Inter',
    fontWeight: 'bold',
    color: 'red',
  },
});
