# react-native-fresh-refresh

> Custom pull to refresh Component

<br>

<img width="300" src="https://github.com/4TWIGGERS/react-native-fresh-refresh/blob/main/gif/fresh.png">


## Note ❗

`react-native-gesture-handler` supported by Expo 44 has a bug which breaks fresh refresh

If you are using `react-native-gesture-handler` version below 2 please install `react-native-fresh-refresh` 1.1.0

<br>

### Usage

## Step 1

### Installation

Use `yarn`

```sh
yarn add react-native-fresh-refresh
```

or `npm`

```sh
npm i -S react-native-fresh-refresh
```

## Prerequisites

You are going to need to have `react-native-reanimated` v2 and `react-native-gesture-handler` installed in your project.

## Step 2

```jsx
import RefreshableWrapper from 'react-native-fresh-refresh';
```

## Step 3

Create Animated List or regular View to use pull to refresh

```jsx
const AnimatedFlatlist = Animated.createAnimatedComponent(FlatList);
```

## usage

You can disable default styles of loader container passing prop `defaultAnimationEnabled={false}`

Pass Reanimated sharedValue to get overdrag Y-Offset

```jsx
const contentOffset = useSharedValue(0);
```

```jsx
<RefreshableWrapper
	defaultAnimationEnabled={false}
	contentOffset={contentOffset}
	Loader={() => ({
		<YourAwsomeComponent />
	})}
	isLoading={isLoading}
  bounces
	onRefresh={() => {
		refreshHandler();
	}}
>
	<AnimatedFlatlist />
</RefreshableWrapper>
```



## Example

```jsx
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, Dimensions } from 'react-native';
import Animated from 'react-native-reanimated';
import RefreshableWrapper from 'react-native-fresh-refresh';
import LottieView from 'lottie-react-native';

const AnimatedFlatlist = Animated.createAnimatedComponent(FlatList);
const data = ['1', '2', '3', '4', '5', '6'];
const { width } = Dimensions.get('screen');

const EmptyComponent = (props) => {
  return (
    <View>
      <Text>LIST EMPTY COMPONENT</Text>
    </View>
  );
};
const ListItem = (props) => {
  return (
    <View style={{ height: 200 }}>
      <Text>LIST Item COMPONENT</Text>
      <Text> {props.item}</Text>
    </View>
  );
};

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [listData, setListData] = useState([]);

  const refreshSimulationHandler = () => {
    setListData([]);
    setIsLoading(true);
    setTimeout(async () => {
      setListData(data);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <StatusBar style='auto' />
      <View style={styles.header} />
      <RefreshableWrapper
        contentOffset={contentOffset}
        Loader={() => <YourAwsomeComponent />}
        isLoading={isLoading}
        onRefresh={() => {
          refreshSimulationHandler();
        }}
        bounces
      >
        <AnimatedFlatlist
          data={listData}
          keyExtractor={(item) => item}
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: { width, height: 100, backgroundColor: 'grey' },
  contenContainer: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    paddingBottom: 100,
    alignItems: 'center',
  },
  lottie: {
    width: 50,
    height: 50,
  },
  scrollList: { width, paddingTop: 20 },
});
```

<img width="300" src="https://github.com/4TWIGGERS/react-native-fresh-refresh/blob/main/gif/refresh.gif">



## Hire us

Contact us at hello@4twiggers.com
