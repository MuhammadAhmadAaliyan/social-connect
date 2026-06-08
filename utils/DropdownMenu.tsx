// utils/DropdownMenu.tsx
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
} from 'react-native';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';

interface MenuItem {
  label: string;
  onPress: () => void;
  color?: string;
}

interface DropdownMenuProps {
  visible: boolean;
  onClose: () => void;
  items: MenuItem[];
  top?: number;
  right?: number;
}

const DropdownMenu = ({
  visible,
  onClose,
  items,
  top = responsiveHeight(12),
  right = responsiveWidth(4),
}: DropdownMenuProps) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.menuContainer, { top, right }]}>
              {items.map((item, index) => (
                <View key={index}>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => {
                      onClose();
                      item.onPress();
                    }}
                  >
                    <Text
                      style={[
                        styles.menuText,
                        { color: item.color || '#ffffff' },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default DropdownMenu;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  menuContainer: {
    position: 'absolute',
    backgroundColor: '#1e293b',
    borderRadius: responsiveWidth(3),
    paddingVertical: responsiveHeight(1),
    minWidth: responsiveWidth(45),
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: responsiveWidth(4),
    paddingVertical: responsiveHeight(1.5),
    gap: responsiveWidth(3),
  },
  menuText: {
    fontSize: responsiveFontSize(1.8),
    fontFamily: 'Inter-Regular',
    color: '#ffffff',
  },
});
