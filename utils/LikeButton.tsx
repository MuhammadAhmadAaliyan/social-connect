import { View, Text, Pressable, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import {
  responsiveFontSize,
  responsiveWidth,
} from 'react-native-responsive-dimensions';

interface LikeButtonProps {
  postId: string;
  liked: boolean;
  likeCount: number;
  onToggle: (postId: string) => void;
}

const LikeButton = ({
  postId,
  liked,
  likeCount,
  onToggle,
}: LikeButtonProps) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));

  const handlePress = () => {
    if (!liked) {
      scale.set(
        withSequence(
          ///withSpring(1.4, { damping: 10, stiffness: 300 }),
          withTiming(1.5, { duration: 250 }),
          withTiming(1, { duration: 100 }),
        ),
      );
    }
    onToggle(postId);
  };

  //FORMAT LIKES/UNLIKES COMMENTS COUNT
  const formatCount = (count: number): string => {
    if (count < 1000) {
      return count.toString(); // 999
    } else if (count < 1000000) {
      const result = count / 1000;
      return result % 1 === 0 ? `${result}K` : `${result.toFixed(1)}K`;
    } else if (count < 1000000000) {
      const result = count / 1000000;
      return result % 1 === 0 ? `${result}M` : `${result.toFixed(1)}M`;
    } else {
      const result = count / 1000000000;
      return result % 1 === 0 ? `${result}B` : `${result.toFixed(1)}B`;
    }
  };

  return (
    <View style={styles.likeAndCommentButton}>
      <Pressable onPress={handlePress}>
        <Animated.View style={animatedStyle}>
          <FontAwesome
            name={liked ? 'heart' : 'heart-o'}
            size={22}
            color={liked ? 'red' : '#ffffff'}
          />
        </Animated.View>
      </Pressable>
      <Text style={styles.counterText}>{formatCount(likeCount)}</Text>
    </View>
  );
};

export default LikeButton;

const styles = StyleSheet.create({
  likeAndCommentButton: {
    flexDirection: 'row',
    gap: responsiveWidth(4),
    alignItems: 'center',
  },
  counterText: {
    fontFamily: 'Inter',
    fontSize: responsiveFontSize(2),
    color: '#7C99AE',
  },
});
