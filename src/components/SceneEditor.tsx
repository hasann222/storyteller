import React, { useState } from 'react';
import { StyleSheet, View, TextInput, ScrollView } from 'react-native';
import { Text, Chip, useTheme, IconButton, Portal, Dialog, Button } from 'react-native-paper';
import type { SceneBlock } from '../types/scene';
import { useSceneStore } from '../stores/sceneStore';

interface SceneEditorProps {
  scene: SceneBlock;
  index: number;
  onClose: () => void;
}

export function SceneEditor({ scene, index, onClose }: SceneEditorProps) {
  const { colors } = useTheme();
  const [showMeta, setShowMeta] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const updateScene = useSceneStore((s) => s.updateScene);
  const deleteScene = useSceneStore((s) => s.deleteScene);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Toolbar */}
      <View style={[styles.toolbar, { borderBottomColor: colors.outlineVariant }]}>
        <IconButton
          icon="arrow-left"
          size={22}
          iconColor={colors.onSurface}
          onPress={onClose}
          style={styles.backBtn}
        />
        <View
          style={[styles.numberBadge, { backgroundColor: colors.primaryContainer }]}
        >
          <Text
            variant="labelSmall"
            style={{ color: colors.onPrimaryContainer, fontWeight: '700' }}
          >
            {index + 1}
          </Text>
        </View>
        <Text
          variant="titleMedium"
          style={{ flex: 1, color: colors.onSurface }}
          numberOfLines={1}
        >
          {scene.title}
        </Text>
        <IconButton
          icon="delete-outline"
          size={20}
          iconColor={colors.error}
          onPress={() => setConfirmDelete(true)}
        />
      </View>

      {/* Scrollable editor body */}
      <ScrollView
        style={styles.scrollBody}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="always"
      >
        {/* Title input */}
        <TextInput
          style={[styles.titleInput, { color: colors.onSurface, borderColor: colors.outlineVariant }]}
          value={scene.title}
          onChangeText={(text) => updateScene(scene.id, { title: text })}
          placeholder="Scene title"
          placeholderTextColor={colors.onSurfaceVariant}
        />

        {/* Narration input */}
        <TextInput
          style={[styles.narrationInput, { color: colors.onSurface, borderColor: colors.outlineVariant }]}
          value={scene.narration}
          onChangeText={(text) => updateScene(scene.id, { narration: text })}
          multiline
          placeholder="Write your scene narration..."
          placeholderTextColor={colors.onSurfaceVariant}
          textAlignVertical="top"
        />

        {/* Visual Metadata */}
        <View style={styles.metaSection}>
          <Chip
            icon={showMeta ? 'eye-off' : 'eye'}
            onPress={() => setShowMeta(!showMeta)}
            compact
            style={{ alignSelf: 'flex-start' }}
            textStyle={{ fontSize: 11 }}
          >
            Visual Metadata
          </Chip>

          {showMeta && (
            <View
              style={[styles.metaBlock, { backgroundColor: colors.surfaceVariant }]}
            >
              <MetaLine label="Image Prompt" value={scene.visualPromptMeta.imagePrompt} />
              <MetaLine label="Video Prompt" value={scene.visualPromptMeta.videoPrompt} />
              <MetaLine label="Camera" value={scene.visualPromptMeta.cameraDirection} />
              <MetaLine label="Lighting" value={scene.visualPromptMeta.lighting} />
              <MetaLine label="Mood" value={scene.visualPromptMeta.mood} />
            </View>
          )}
        </View>
      </ScrollView>

      {/* Delete confirmation dialog */}
      <Portal>
        <Dialog visible={confirmDelete} onDismiss={() => setConfirmDelete(false)}>
          <Dialog.Title>Delete Scene</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Delete &quot;{scene.title}&quot;? This cannot be undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmDelete(false)}>Cancel</Button>
            <Button
              textColor={colors.error}
              onPress={() => {
                deleteScene(scene.id);
                setConfirmDelete(false);
                onClose();
              }}
            >
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

function MetaLine({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.metaLine}>
      <Text
        variant="labelSmall"
        style={{ color: colors.primary, fontWeight: '700', minWidth: 80 }}
      >
        {label}
      </Text>
      <Text
        variant="bodySmall"
        style={{ color: colors.onSurfaceVariant, flex: 1, fontFamily: 'monospace' }}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 4,
  },
  backBtn: {
    margin: 0,
  },
  numberBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
  },
  titleInput: {
    fontSize: 18,
    fontWeight: '600',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  narrationInput: {
    fontSize: 14,
    lineHeight: 22,
    minHeight: 200,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  metaSection: {
    marginTop: 16,
    gap: 8,
  },
  metaBlock: {
    borderRadius: 8,
    padding: 10,
    gap: 4,
  },
  metaLine: {
    flexDirection: 'row',
    gap: 8,
  },
});
