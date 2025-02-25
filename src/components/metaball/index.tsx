/*
 * @author Vitali
 * @created at 2025
 */

import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Blur,
  ColorMatrix,
  Group,
  Paint,
  SweepGradient,
  vec,
} from '@shopify/react-native-skia';
import {
  Animated,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
} from 'react-native';
import {
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import Touchable, {useGestureHandler} from 'react-native-skia-gesture';
import {gestureHandlerRootHOC} from 'react-native-gesture-handler';
import View = Animated.View;

const RADIUS = 80;
const SPEED = 0.5;
const MATRIX = [
  // R, G, B, A, Bias (Offset)
  // prettier-ignore
  1, 0, 0, 0, 0,
  // prettier-ignore
  0, 1, 0, 0, 0,
  // prettier-ignore
  0, 0, 1, 0, 0,
  // prettier-ignore
  0, 0, 0, 60, -30,
];

const getRandomDirection = () => (Math.random() > 0.5 ? 1 : -1);
const clamp = (value: number, min: number, max: number) => {
  'worklet';
  return Math.max(min, Math.min(value, max));
};

const CircleItem = ({isReset, isLast, isMoving, isSticky, onAddCircle}) => {
  const {width: windowWidth, height: windowHeight} = useWindowDimensions();

  const cx = useSharedValue(windowWidth / 2);
  const cy = useSharedValue(windowHeight / 2);
  const context = useSharedValue({x: 0, y: 0});
  const speedX = useSharedValue(SPEED * getRandomDirection());
  const speedY = useSharedValue(SPEED * getRandomDirection());
  const sharedIsSticky = useSharedValue(isSticky);
  const sharedIsMoving = useSharedValue(isMoving);

  const minX = RADIUS;
  const maxX = windowWidth - RADIUS;
  const minY = RADIUS;
  const maxY = windowHeight - RADIUS;

  useDerivedValue(() => {
    if (!isMoving) return;

    cx.value += speedX.value;
    cy.value += speedY.value;

    if (cx.value - RADIUS <= 0 || cx.value + RADIUS >= windowWidth) {
      speedX.value *= -1;
    }
    if (cy.value - RADIUS <= 0 || cy.value + RADIUS >= windowHeight) {
      speedY.value *= -1;
    }
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {translateX: cx.value - RADIUS},
      {translateY: cy.value - RADIUS},
    ],
  }));

  useEffect(() => {
    sharedIsSticky.value = isSticky;
  }, [isSticky]);

  useEffect(() => {
    sharedIsMoving.value = isMoving;
  }, [isMoving]);

  useEffect(() => {
    if (!isReset) return;
    cx.value = withSpring(windowWidth / 2);
    cy.value = withSpring(windowHeight / 2);
  }, [isReset]);

  const gestureHandler = useGestureHandler({
    onStart: () => {
      'worklet';
      context.value = {x: cx.value, y: cy.value};
    },
    onActive: ({translationX, translationY}) => {
      'worklet';
      cx.value = clamp(context.value.x + translationX, minX, maxX);
      cy.value = clamp(context.value.y + translationY, minY, maxY);
    },
    onEnd: () => {
      'worklet';
      if (isLast && !sharedIsMoving.value) {
        runOnJS(onAddCircle)();
      }
      if (sharedIsSticky.value) {
        cx.value = withSpring(windowWidth / 2);
        cy.value = withSpring(windowHeight / 2);
      }
    },
  });

  return (
    <Touchable.Circle
      // @ts-ignore
      style={animatedStyle}
      {...gestureHandler}
      r={RADIUS}
      cx={cx}
      cy={cy}
    />
  );
};

function Metaball(): React.JSX.Element {
  const [circles, setCircles] = useState([{id: 1}, {id: 2}]);
  const [state, setState] = useState({
    isReset: false,
    isMoving: false,
    isSticky: true,
  });
  const resetTimeout = useRef<NodeJS.Timeout | null>(null);

  const addCircle = useCallback(() => {
    setCircles(prev => [...prev, {id: prev.length + 1}]);
  }, []);

  const resetCircles = useCallback(() => {
    setState({...state, isReset: true, isMoving: false});
    if (resetTimeout.current) clearTimeout(resetTimeout.current);
    resetTimeout.current = setTimeout(() => {
      setState(prev => ({...prev, isReset: false}));
      setCircles([{id: 1}, {id: 2}]);
    }, 500);
  }, []);

  const layer = useMemo(
    () => (
      <Paint>
        <Blur blur={25} />
        <ColorMatrix matrix={MATRIX} />
      </Paint>
    ),
    [],
  );

  return (
    <>
      <StatusBar backgroundColor={'#111'} />
      <Touchable.Canvas
        updateKey={circles.length}
        style={{flex: 1, backgroundColor: '#111'}}>
        <Group layer={layer}>
          {circles.map(({id}, idx, array) => (
            <CircleItem
              key={id}
              isLast={array.length - 2 === idx}
              onAddCircle={addCircle}
              isReset={state.isReset}
              isMoving={state.isMoving}
              isSticky={state.isSticky}
            />
          ))}
          <SweepGradient
            c={vec(0, 0)}
            colors={['#C80036', '#0C1844', '#C80036']}
          />
        </Group>
      </Touchable.Canvas>
      <View style={styles.buttonContainer}>
        <CustomButton title="Add" onPress={addCircle} />
        <CustomButton
          title="Sticky"
          isActive={state.isSticky}
          onPress={() =>
            setState(prev => ({...prev, isSticky: !prev.isSticky}))
          }
        />
        <CustomButton title="Reset" onPress={resetCircles} />
        <CustomButton
          title="Start / Stop"
          onPress={() =>
            setState(prev => ({...prev, isMoving: !prev.isMoving}))
          }
        />
      </View>
    </>
  );
}

const CustomButton = ({title, onPress, isActive = false}) => {
  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [
        styles.button,
        isActive && styles.activeButton,
        pressed && styles.pressedButton,
      ]}>
      <Text style={styles.buttonText}>{title}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  button: {
    backgroundColor: '#0C1844',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeButton: {
    backgroundColor: 'rgb(133, 8, 59)',
  },
  pressedButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default gestureHandlerRootHOC(Metaball);
