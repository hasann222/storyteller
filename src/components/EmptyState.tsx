import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

interface EmptyStateProps {
  title: string;
  subtitle?: string;
}

export function EmptyState({ title, subtitle }: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text
        variant="headlineSmall"
        style={{ color: colors.onSurfaceVariant, textAlign: 'center' }}
      >
        {title}
      </Text>
      {subtitle ? (
        <Text
          variant="bodyMedium"
          style={[styles.subtitle, { color: colors.outline }]}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  subtitle: {
    marginTop: 8,
    textAlign: 'center',
  },
});
