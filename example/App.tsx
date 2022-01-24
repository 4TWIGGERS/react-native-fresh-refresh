import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import TabOneScreen from './screens/TabOneScreen';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TabOneScreen />
    </GestureHandlerRootView>
  );
}
