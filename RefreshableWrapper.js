import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import LottieView from 'lottie-react-native';
import { StyleSheet, View } from 'react-native';
import {
	PanGestureHandler,
	NativeViewGestureHandler,
} from 'react-native-gesture-handler';
import Animated, {
	Extrapolate,
	interpolate,
	runOnJS,
	useAnimatedGestureHandler,
	useAnimatedScrollHandler,
	useAnimatedStyle,
	useDerivedValue,
	useSharedValue,
	withSpring,
	withTiming,
} from 'react-native-reanimated';

const RefreshableWrapper = ({
	managedLoading = false,
	isLoading,
	onRefresh,
	refreshHeight = 100,
	defaultAnimationEnabled,
	contentOffset,
	children,
	Loader = () => (
		<LottieView
			style={styles.lottie}
			autoPlay
			source={require('./refresh.json')}
		/>
	),
}) => {
	const panRef = useRef();
	const listWrapperRef = useRef();
	const isRefreshing = useSharedValue(false);
	const loaderOffsetY = useSharedValue(0);
	const listContentOffsetY = useSharedValue(0);
	const isLoaderActive = useSharedValue(false);

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
		}
	}, [isLoading]);

	const onListScroll = useAnimatedScrollHandler((event) => {
		listContentOffsetY.value = event.contentOffset.y;
	});

	const onPanGestureEvent = useAnimatedGestureHandler({
		onStart: (_) => {},
		onActive: (event, _) => {
			isLoaderActive.value = loaderOffsetY.value > 0;

			if (
				((listContentOffsetY.value <= 0 && event.velocityY >= 0) ||
					isLoaderActive.value) &&
				!isRefreshing.value
			) {
				loaderOffsetY.value = event.translationY;
			}
		},
		onEnd: (_) => {
			if (!isRefreshing.value) {
				if (loaderOffsetY.value >= refreshHeight && !isRefreshing.value) {
					isRefreshing.value = true;
					runOnJS(onRefresh)();
				} else {
					isLoaderActive.value = false;
					loaderOffsetY.value = withTiming(0);
				}
			}
		},
		onCancel: (_) => {
			isLoaderActive.value = false;
			loaderOffsetY.value = withTiming(0);
		},
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
				<Loader />
			</Animated.View>

			<PanGestureHandler
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
			</PanGestureHandler>
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
	lottie: {
		height: 50,
		width: 50,
	},
	loaderContainer: {
		position: 'absolute',
		alignItems: 'center',
		width: '100%',
	},
});

export default RefreshableWrapper;

RefreshableWrapper.defaultProps = {
	defaultAnimationEnabled: true,
};

RefreshableWrapper.propTypes = {
	isLoading: PropTypes.bool,
	refreshHeight: PropTypes.number,
	onRefresh: PropTypes.func,
	Loader: PropTypes.func,
	defaultAnimationEnabled: PropTypes.bool,
	contentOffset: PropTypes.object,
};
