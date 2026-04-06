import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Text, Portal, Modal, useTheme } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

type CreationMode = 'standard' | 'interview' | 'random';

interface CreationModeSheetProps {
  visible: boolean;
  onDismiss: () => void;
  onSelect: (mode: CreationMode) => void;
}

const modes: { key: CreationMode; icon: string; title: string; subtitle: string }[] = [
  {
    key: 'standard',
    icon: 'text-box-outline',
    title: 'Standard',
    subtitle: 'Write a freeform description and let AI fill in the gaps',
  },
  {
    key: 'interview',
    icon: 'chat-processing-outline',
    title: 'Interview',
    subtitle: 'Co-create through a guided conversation with AI',
  },
  {
    key: 'random',
    icon: 'dice-multiple-outline',
    title: 'Random',
    subtitle: 'Generate a completely original character instantly',
  },
];

export function CreationModeSheet({ visible, onDismiss, onSelect }: CreationModeSheetProps) {
  const { colors } = useTheme();

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[styles.modal, { backgroundColor: colors.surface }]}
      >
        <Text variant="titleMedium" style={[styles.title, { color: colors.onSurface }]}>
          Create a character
        </Text>

        {modes.map((mode) => (
          <Pressable
            key={mode.key}
            onPress={() => onSelect(mode.key)}
            style={({ pressed }) => [
              styles.row,
              pressed && { backgroundColor: colors.surfaceVariant },
            ]}
          >
            <View style={[styles.iconCircle, { backgroundColor: colors.primaryContainer }]}>
              <MaterialCommunityIcons
                name={mode.icon as any}
                size={24}
                color={colors.onPrimaryContainer}
              />
            </View>
            <View style={styles.textContainer}>
              <Text variant="bodyLarge" style={{ color: colors.onSurface }}>
                {mode.title}
              </Text>
              <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                {mode.subtitle}
              </Text>
            </View>
          </Pressable>
        ))}
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: {
    margin: 24,
    borderRadius: 16,
    padding: 20,
  },
  title: {
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 14,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
});
