import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated } from 'react-native';
import { Text, Portal, useTheme } from 'react-native-paper';

interface CharacterLoadingOverlayProps {
  visible: boolean;
}

export function CharacterLoadingOverlay({ visible }: CharacterLoadingOverlayProps) {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0)).current;
  const dotScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(dotScale, { toValue: 1.2, duration: 700, useNativeDriver: true }),
          Animated.timing(dotScale, { toValue: 0.8, duration: 700, useNativeDriver: true }),
        ]),
      ).start();
    } else {
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start();
    }
  }, [visible, opacity, dotScale]);

  if (!visible) return null;

  return (
    <Portal>
      <Animated.View style={[styles.overlay, { opacity }]}>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Animated.View style={{ transform: [{ scale: dotScale }] }}>
            <Text style={styles.icon}>✨</Text>
          </Animated.View>
          <Text variant="titleMedium" style={[styles.title, { color: colors.onSurface }]}>
            Your character arrives…
          </Text>
          <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant, textAlign: 'center' }}>
            Extracting details and generating portrait
          </Text>
        </View>
      </Animated.View>
    </Portal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  card: {
    paddingHorizontal: 36,
    paddingVertical: 32,
    borderRadius: 20,
    alignItems: 'center',
    gap: 12,
    elevation: 8,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontWeight: '600',
  },
});
