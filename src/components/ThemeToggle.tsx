import { useRef, useState } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { FAB, useTheme } from 'react-native-paper';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { useLibraryStore } from '../store/libraryStore';
import { ThemeType, themeBackgroundColors } from '../theme';

const { width, height } = Dimensions.get('window');
const MAX_RADIUS = Math.sqrt(width * width + height * height);

export const ThemeToggle = () => {
  const { colors } = useTheme();
  const themeMode = useLibraryStore((state) => state.themeMode);
  const setThemeMode = useLibraryStore((state) => state.setThemeMode);

  const buttonRef = useRef<any>(null);
  const [waveColor, setWaveColor] = useState('#FFFFFF');
  
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const buttonX = useSharedValue(0);
  const buttonY = useSharedValue(0);

  const themeConfig: Record<ThemeType, { icon: string; next: ThemeType }> = {
    light: { icon: 'white-balance-sunny', next: 'dark' },
    dark: { icon: 'weather-night', next: 'warm' },
    warm: { icon: 'coffee', next: 'light' },
  };

  const currentConfig = themeConfig[themeMode];

  const handlePress = () => {
    const nextTheme = currentConfig.next;
    const nextColor = themeBackgroundColors[nextTheme] || '#FFFFFF';

    buttonRef.current?.measure((fx: number, fy: number, w: number, h: number, px: number, py: number) => {
      buttonX.value = px + w / 2;
      buttonY.value = py + h / 2;

      setWaveColor(nextColor);
      opacity.value = 1;

      scale.value = withTiming(1, {
        duration: 600,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }, (finished) => {
        if (finished) {
          runOnJS(setThemeMode)(nextTheme);
          runOnJS(resetWave)();
        }
      });
    });
  };

  const resetWave = () => {
    opacity.value = 0;
    scale.value = 0;
  };

  const animatedWaveStyle = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      width: MAX_RADIUS * 2,
      height: MAX_RADIUS * 2,
      borderRadius: MAX_RADIUS,
      backgroundColor: waveColor,
      top: buttonY.value - MAX_RADIUS,
      left: buttonX.value - MAX_RADIUS,
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
      zIndex: 9999,
      pointerEvents: 'none',
    };
  });

  return (
    <>
      <FAB
        ref={buttonRef}
        icon={currentConfig.icon}
        style={[styles.fab, { backgroundColor: colors.primary }]}
        color={colors.onPrimary}
        onPress={handlePress}
        size="medium"
      />
      <Animated.View style={animatedWaveStyle} />
    </>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    left: 16,
    bottom: 24,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 100,
  },
});