import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
} from 'react-native-reanimated';

export default function DefaultLoader() {
  const rotateValue = useSharedValue(0);
  const handleRotation = (value:any) => {
    'worklet';
    return `${value.value * 4 * Math.PI}rad`;
  };

  const rotateStyles = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: handleRotation(rotateValue) },
        { scale: rotateValue.value + 0.3 },
      ],
      opacity: rotateValue.value + 0.2,
      borderRadius: rotateValue.value * 20,
    };
  });

  useEffect(() => {
    rotateValue.value = withRepeat(withSpring(0.5), -1, true);
  }, []);

  return <Animated.View style={[styles.loader, rotateStyles]} />;
}
const styles = StyleSheet.create({
  loader: {
    height: 40,
    width: 40,
    backgroundColor: 'green',
    marginTop: 5,
  },
});
