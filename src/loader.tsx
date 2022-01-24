import React from 'react';
import { StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';

export default function ComponentName() {
  return <Animated.View style={styles.loader} />;
}
const styles = StyleSheet.create({
  loader: {
    height: 50,
    width: 50,
    backgroundColor: 'red',
  },
});
