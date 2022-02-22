import * as React from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  FlatListProps,
  Dimensions,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useSharedValue } from 'react-native-reanimated';
import RefreshableWrapper from 'react-native-fresh-refresh';
import EmptyComponent from './components/EmptyComponent';
import ListItem from './components/ListItem';
import DefaultLoader from './components/DefaultLoader';

type Item = string;

const AnimatedFlatlist =
  Animated.createAnimatedComponent<FlatListProps<Item>>(FlatList);

const { width } = Dimensions.get('screen');

const data: Item[] = ['1', '2', '3', '4', '5', '6'];

export default function App() {
  const contentOffset = useSharedValue(0);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [listData, setListData] = React.useState<string[]>([]);

  const refreshSimulationHandler = () => {
    setListData([]);
    setIsLoading(true);
    setTimeout(async () => {
      setListData(data);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <GestureHandlerRootView style={styles.root}>
      <View style={styles.container}>
        <View style={styles.header} />
        <RefreshableWrapper
          contentOffset={contentOffset}
          Loader={() => <DefaultLoader />}
          isLoading={isLoading}
          onRefresh={() => {
            refreshSimulationHandler();
          }}
        >
          <AnimatedFlatlist
            data={listData}
            bounces={false}
            keyExtractor={(item: string) => item}
            renderItem={({ item }) => {
              return <ListItem item={item} />;
            }}
            style={styles.scrollList}
            contentContainerStyle={styles.contenContainer}
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
            ListEmptyComponent={() => <EmptyComponent />}
          />
        </RefreshableWrapper>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: { width, height: 100, backgroundColor: 'grey' },
  contenContainer: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    paddingBottom: 100,
    alignItems: 'center',
    backgroundColor:"white"
  },
  scrollList: { width, paddingTop: 0 },
});
