import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import DefaultLoader from './loader';
import Animated, {
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

interface Props {
  isLoading: boolean;
  onRefresh: () => void;
  refreshHeight?: number;
  defaultAnimationEnabled?: boolean;
  contentOffset?: Animated.SharedValue<number>;
  children: JSX.Element;
  Loader?: () => JSX.Element | JSX.Element;
}

const RefreshableWrapper: React.FC<Props> = ({
  isLoading,
  onRefresh,
  refreshHeight = 100,
  defaultAnimationEnabled,
  contentOffset,
  children,
  Loader = <DefaultLoader />,
}) => {
  const isRefreshing = useSharedValue(false);
  const loaderOffsetY = useSharedValue(0);
  const listContentOffsetY = useSharedValue(0);
  const isLoaderActive = useSharedValue(false);

  useEffect(() => {
    if (!isLoading) {
      loaderOffsetY.value = withTiming(0);
      isRefreshing.value = false;
      isLoaderActive.value = false;
    }
  }, [isLoading]);

  const onListScroll = useAnimatedScrollHandler(
    (event: { contentOffset: { y: number } }) => {
      const y = event.contentOffset.y;
      listContentOffsetY.value = y;
    }
  );

  const panGesture = Gesture.Pan()
    .onChange((event) => {
      'worklet';
      isLoaderActive.value = loaderOffsetY.value > 0;

      if (
        ((listContentOffsetY.value <= 0 && event.velocityY >= 0) ||
          isLoaderActive.value) &&
        !isRefreshing.value
      ) {
        loaderOffsetY.value = event.translationY;
      }
    })
    .onEnd(() => {
      'worklet';
      if (!isRefreshing.value) {
        if (loaderOffsetY.value >= refreshHeight && !isRefreshing.value) {
          isRefreshing.value = true;
          runOnJS(onRefresh)();
        } else {
          isLoaderActive.value = false;
          loaderOffsetY.value = withTiming(0);
        }
      }
    });

  useDerivedValue(() => {
    if (contentOffset) {
      contentOffset.value = loaderOffsetY.value;
    }
  }, [loaderOffsetY]);

  const loaderAnimation = useAnimatedStyle(() => {
    return {
      height: refreshHeight,
      transform: defaultAnimationEnabled
        ? [
            {
              translateY: isLoaderActive.value
                ? interpolate(
                    loaderOffsetY.value,
                    [0, refreshHeight - 20],
                    [-10, 10],
                    Extrapolate.CLAMP
                  )
                : withTiming(-10),
            },
            {
              scale: isLoaderActive.value ? withSpring(1) : withTiming(0.01),
            },
          ]
        : undefined,
    };
  });

  const overscrollAnimation = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: isLoaderActive.value
            ? isRefreshing.value
              ? withTiming(refreshHeight)
              : interpolate(
                  loaderOffsetY.value,
                  [0, refreshHeight],
                  [0, refreshHeight],
                  Extrapolate.CLAMP
                )
            : withTiming(0),
        },
      ],
    };
  });

  return (
    <View style={styles.flex}>
      <Animated.View style={[styles.loaderContainer, loaderAnimation]}>
        {typeof Loader === 'function' ? <Loader /> : Loader}
      </Animated.View>

      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.flex, overscrollAnimation]}>
          {children &&
            React.cloneElement(children, {
              onScroll: onListScroll,
              bounces: false,
            })}
        </Animated.View>
      </GestureDetector>

      {/* <PanGestureHandler
        ref={panRef}
        simultaneousHandlers={listWrapperRef}
        onGestureEvent={onPanGestureEvent}
      >
        <Animated.View style={[styles.flex, overscrollAnimation]}>
          <NativeViewGestureHandler
            ref={listWrapperRef}
            simultaneousHandlers={panRef}
          >
            {children &&
              React.cloneElement(children, {
                onScroll: onListScroll,
                bounces: false,
              })}
          </NativeViewGestureHandler>
        </Animated.View>
      </PanGestureHandler> */}
    </View>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  contenContainer: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  loaderContainer: {
    position: 'absolute',
    alignItems: 'center',
    width: '100%',
  },
});

export default RefreshableWrapper;
