import React, { useMemo, useState } from 'react';
import { StyleSheet, View, Pressable, TextInput } from 'react-native';
import { Card, Text, Chip, useTheme, IconButton, Portal, Dialog, Button } from 'react-native-paper';
import type { SceneBlock } from '../types/scene';
import { useSceneStore } from '../stores/sceneStore';

interface SceneBlockCardProps {
  scene: SceneBlock;
  index: number;
  drag?: () => void;
  isActive?: boolean;
  isSelecting?: boolean;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  onEnterSelect?: (id: string) => void;
}

function SceneBlockCardInner({
  scene,
  index,
  drag,
  isActive,
  isSelecting,
  isSelected,
  onSelect,
  onEnterSelect,
}: SceneBlockCardProps) {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [showMeta, setShowMeta] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const updateScene = useSceneStore((s) => s.updateScene);
  const deleteScene = useSceneStore((s) => s.deleteScene);

  return (
    <Card
      style={[
        styles.card,
        {
          borderLeftColor: isSelected ? colors.primary : colors.primary,
          borderLeftWidth: isSelected ? 4 : 4,
          opacity: isActive ? 0.9 : 1,
          elevation: isActive ? 6 : 1,
          backgroundColor: isSelected ? colors.primaryContainer : undefined,
        },
      ]}
      mode="elevated"
    >
      <View style={styles.row}>
        {/* Drag handle / selection checkbox */}
        <Pressable
          onLongPress={!isSelecting ? drag : undefined}
          onPress={isSelecting ? () => onSelect?.(scene.id) : undefined}
          style={styles.dragHandle}
        >
          <IconButton
            icon={
              isSelecting
                ? isSelected
                  ? 'check-circle'
                  : 'circle-outline'
                : 'drag'
            }
            size={20}
            iconColor={
              isSelecting
                ? isSelected
                  ? colors.primary
                  : colors.outline
                : colors.outline
            }
          />
        </Pressable>

        <Pressable
          style={styles.content}
          onPress={() => {
            if (isSelecting) {
              onSelect?.(scene.id);
            } else {
              setExpanded(!expanded);
            }
          }}
          onLongPress={() => {
            if (!isSelecting) {
              onEnterSelect?.(scene.id);
            }
          }}
        >
          {/* Scene number + title */}
          <View style={styles.titleRow}>
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
              variant="titleSmall"
              style={{ flex: 1, color: colors.onSurface }}
              numberOfLines={1}
            >
              {scene.title}
            </Text>
            {expanded && (
              <IconButton
                icon="delete-outline"
                size={18}
                iconColor={colors.error}
                onPress={() => setConfirmDelete(true)}
                style={styles.expandBtn}
              />
            )}
            <IconButton
              icon={expanded ? 'chevron-up' : 'chevron-down'}
              size={18}
              iconColor={colors.outline}
              onPress={() => setExpanded(!expanded)}
              style={styles.expandBtn}
            />
          </View>

          {/* Narration preview/full */}
          {expanded ? (
            <TextInput
              style={[
                styles.narrationInput,
                { color: colors.onSurface, borderColor: colors.outlineVariant },
              ]}
              value={scene.narration}
              onChangeText={(text) => updateScene(scene.id, { narration: text })}
              multiline
              placeholder="Write your scene narration..."
              placeholderTextColor={colors.onSurfaceVariant}
              textAlignVertical="top"
            />
          ) : (
            <Text
              variant="bodySmall"
              style={{ color: colors.onSurfaceVariant, marginTop: 4 }}
              numberOfLines={2}
            >
              {scene.narration}
            </Text>
          )}

          {/* Visual Metadata (expanded) */}
          {expanded && (
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
                  style={[
                    styles.metaBlock,
                    { backgroundColor: colors.surfaceVariant },
                  ]}
                >
                  <MetaLine label="Image Prompt" value={scene.visualPromptMeta.imagePrompt} />
                  <MetaLine label="Video Prompt" value={scene.visualPromptMeta.videoPrompt} />
                  <MetaLine label="Camera" value={scene.visualPromptMeta.cameraDirection} />
                  <MetaLine label="Lighting" value={scene.visualPromptMeta.lighting} />
                  <MetaLine label="Mood" value={scene.visualPromptMeta.mood} />
                </View>
              )}
            </View>
          )}
        </Pressable>
      </View>

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
              }}
            >
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </Card>
  );
}

export const SceneBlockCard = React.memo(SceneBlockCardInner);

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
  card: {
    marginHorizontal: 16,
    marginVertical: 6,
    borderLeftWidth: 4,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  dragHandle: {
    paddingTop: 8,
    paddingLeft: 2,
  },
  content: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  numberBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandBtn: {
    margin: 0,
  },
  narrationInput: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    minHeight: 80,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
  },
  metaSection: {
    marginTop: 12,
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
