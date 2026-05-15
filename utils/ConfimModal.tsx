import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
  responsiveWidth,
  responsiveHeight,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal = ({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
}: ConfirmModalProps) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* HEADER */}
          <Text style={styles.title}>{title}</Text>

          {/* MESSAGE */}
          <Text style={styles.message}>{message}</Text>

          {/* BUTTONS */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.button} onPress={onCancel}>
              <Text style={[styles.buttonText, styles.cancelText]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={onConfirm}>
              <Text style={[styles.buttonText, styles.confirmText]}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ConfirmModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: responsiveWidth(8),
  },
  modalContainer: {
    backgroundColor: '#0F172A',
    borderRadius: responsiveWidth(4),
    overflow: 'hidden',
  },
  title: {
    fontFamily: 'Inter',
    fontSize: responsiveFontSize(2.4),
    fontWeight: '700',
    color: '#ffffff',
    paddingHorizontal: responsiveWidth(5),
    paddingTop: responsiveHeight(2.5),
    paddingBottom: responsiveHeight(1.5),
  },
  message: {
    fontFamily: 'Inter',
    fontSize: responsiveFontSize(2.1),
    color: '#7C99AE',
    paddingHorizontal: responsiveWidth(5),
    paddingVertical: responsiveHeight(2.5),
    lineHeight: responsiveFontSize(3.2),
  },
  buttonRow: {
    flexDirection: 'row',
  },
  button: {
    flex: 1,
    paddingVertical: responsiveHeight(1.8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontFamily: 'Inter',
    fontSize: responsiveFontSize(2.2),
    fontWeight: '600',
  },
  cancelText: {
    color: '#7C99AE',
  },
  confirmText: {
    color: '#6366F1',
  },
});
