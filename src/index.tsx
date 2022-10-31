import React, { useEffect } from 'react';
import {
  NativeScrollEvent,
  StyleSheet,
  View,
  TransformsStyle,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import DefaultLoader from './loader';
import Animated, {
  Easing,
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedProps,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { HitSlop } from 'react-native-gesture-handler/lib/typescript/handlers/gestureHandlerCommon';

interface Props {
  isLoading: boolean;
  onRefresh: () => void;
  refreshHeight?: number;
  defaultAnimationEnabled?: boolean;
  contentOffset?: Animated.SharedValue<number>;
  children: JSX.Element;
  Loader?: ({
    animatedProps,
  }: {
    animatedProps?: Partial<{
      progress: number;
    }>;
  }) => JSX.Element | JSX.Element;
  bounces?: boolean;
  hitSlop?: HitSlop;
  managedLoading?: boolean;
  speed?: number;
  /**
   * @description: custom animation for Loader.
   * @param loading Is it in loading state.
   * @param offsetY Offset a to scroll down.
   * @param callback For stop progress animation.
   * @return CSS transform property animation.
   */
  onCustomAnimation: (
    loading: boolean,
    offsetY: number,
    callback: (flag?: boolean) => void
  ) => TransformsStyle['transform'];
}

const RefreshableWrapper: React.FC<Props> = ({
  isLoading,
  onRefresh,
  refreshHeight = 100,
  defaultAnimationEnabled,
  contentOffset,
  children,
  Loader = <DefaultLoader />,
  bounces = true,
  hitSlop,
  managedLoading = false,
  speed = 2000,
  onCustomAnimation,
}) => {
  const isRefreshing = useSharedValue(false);
  const loaderOffsetY = useSharedValue(0);
  const listContentOffsetY = useSharedValue(0);
  const isLoaderActive = useSharedValue(false);
  const progress = useSharedValue<number>(0);

  useEffect(() => {
    if (!isLoading) {
      loaderOffsetY.value = withTiming(0);
      isRefreshing.value = false;
      isLoaderActive.value = false;
    } else if (managedLoading) {
      // In managed mode, we want to start the animation
      // running when isLoading is set to true as well
      loaderOffsetY.value = withTiming(refreshHeight);
      isRefreshing.value = true;
      isLoaderActive.value = true;
      onProgressPlay();
    }
  }, [isLoading]);

  // start to play progress animation
  const onProgressPlay = () => {
    'worklet';
    progress.value = 0;
    progress.value = withRepeat(
      withTiming(1, {
        duration: speed,
        easing: Easing.linear,
      }),
      -1
    );
  };

  const onScroll = useAnimatedScrollHandler((event: NativeScrollEvent) => {
    const y = event.contentOffset.y;
    listContentOffsetY.value = y;
    // recover children component onScroll event
    if (children.props.onScroll) {
      runOnJS(children.props.onScroll)(event);
    }
  });

  const native = Gesture.Native();

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
        const progressVal = event.translationY / 1.2 / refreshHeight;
        progress.value = progressVal > 1 ? 1 : progressVal;
      }
    })
    .onEnd(() => {
      'worklet';
      if (!isRefreshing.value) {
        if (loaderOffsetY.value >= refreshHeight && !isRefreshing.value) {
          isRefreshing.value = true;
          onProgressPlay();
          runOnJS(onRefresh)();
        } else {
          isLoaderActive.value = false;
          loaderOffsetY.value = withTiming(0);
        }
      }
    });

  if (hitSlop !== undefined) {
    panGesture.hitSlop(hitSlop);
  }

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
              scale: isLoaderActive.value
                ? withSpring(1)
                : withTiming(0.01, undefined, (flag) => {
                    if (flag) {
                      // stop progress animation
                      progress.value = withDelay(300, withTiming(0));
                    }
                  }),
            },
          ]
        : onCustomAnimation
        ? onCustomAnimation(
            isLoaderActive.value,
            loaderOffsetY.value,
            (flag) => {
              if (flag) {
                // stop progress animation
                progress.value = withDelay(300, withTiming(0));
              }
            }
          )
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

  const animatedProps = useAnimatedProps(() => {
    return {
      progress: progress.value,
    };
  });

  return (
    <View style={styles.flex}>
      <Animated.View style={[styles.loaderContainer, loaderAnimation]}>
        {typeof Loader === 'function' ? (
          <Loader animatedProps={animatedProps} />
        ) : (
          Loader
        )}
      </Animated.View>

      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.flex, overscrollAnimation]}>
          <GestureDetector gesture={Gesture.Simultaneous(panGesture, native)}>
            {children &&
              React.cloneElement(children, {
                onScroll: onScroll,
                bounces: bounces,
              })}
          </GestureDetector>
        </Animated.View>
      </GestureDetector>
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
