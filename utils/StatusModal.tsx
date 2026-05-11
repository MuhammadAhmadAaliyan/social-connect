import {
  View,
  Text,
  Modal,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

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
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: '#0F172A',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  modalText: {
    fontFamily: 'Inter',
    fontSize: 20,
    color: '#7C99AE',
    marginTop: 30,
  },
  modalHeader: {
    fontSize: 25,
    fontFamily: 'Inter',
    fontWeight: 'bold',
    color: '#ffffff',
  },
  modalButtonText: {
    fontFamily: 'Inter',
    fontSize: 20,
    color: '#6366F1',
    fontWeight: 'bold',
  },
  modalButton: {
    width: '100%',
    paddingTop: 25,
    paddingHorizontal: 15,
    alignSelf: 'flex-end',
  },
});
