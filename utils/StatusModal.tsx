import {
  View,
  Text,
  Modal,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import {
  responsiveWidth,
  responsiveHeight,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';

type InputFieldProps = {
  modalVisible: boolean;
  loading: boolean;
  modalHeader: string;
  modalMessage: string;
  onPressButton: () => void;
};

export default function StatusModal({
  modalVisible,
  loading,
  modalHeader,
  modalMessage,
  onPressButton,
}: InputFieldProps) {
  return (
    <Modal transparent visible={modalVisible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {loading ? (
            <View>
              <ActivityIndicator size={60} color={'#6366F1'} />
              <Text style={styles.modalText}>Please wait...</Text>
            </View>
          ) : (
            <View>
              <Text style={styles.modalHeader}>{modalHeader}</Text>
              <Text style={styles.modalText}>{modalMessage}</Text>
              <Pressable style={styles.modalButton} onPress={onPressButton}>
                <Text style={styles.modalButtonText}>OK</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: responsiveWidth(5),
  },

  modalContainer: {
    backgroundColor: '#0F172A',
    padding: responsiveWidth(5),
    borderRadius: responsiveWidth(4),
    alignItems: 'center',
  },

  modalText: {
    fontFamily: 'Inter',
    fontSize: responsiveFontSize(2.4),
    color: '#7C99AE',
    marginTop: responsiveHeight(3),
  },

  modalHeader: {
    fontSize: responsiveFontSize(3),
    fontFamily: 'Inter',
    fontWeight: 'bold',
    color: '#ffffff',
  },

  modalButtonText: {
    fontFamily: 'Inter',
    fontSize: responsiveFontSize(2.4),
    color: '#6366F1',
    fontWeight: 'bold',
  },

  modalButton: {
    width: '100%',
    paddingTop: responsiveHeight(3),
    paddingHorizontal: responsiveWidth(4),
    alignSelf: 'flex-end',
  },
});
