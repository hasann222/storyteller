import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, Platform, Keyboard, BackHandler } from 'react-native';
import { Text, Badge, Snackbar, FAB, useTheme, Button, Portal, Dialog, IconButton } from 'react-native-paper';
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSceneStore } from '../stores/sceneStore';
import { SceneBlockCard } from './SceneBlockCard';
import { SceneEditor } from './SceneEditor';
import { EmptyState } from './EmptyState';
import type { SceneBlock } from '../types/scene';

interface MasterDocumentProps {
  projectId: string;
}

export function MasterDocument({ projectId }: MasterDocumentProps) {
  const { colors } = useTheme();
  const { bottom: bottomInset } = useSafeAreaInsets();
  const allScenes = useSceneStore((s) => s.scenes);
  const reorderScenes = useSceneStore((s) => s.reorderScenes);
  const addScene = useSceneStore((s) => s.addScene);
  const deleteScenes = useSceneStore((s) => s.deleteScenes);
  const scenes = useMemo(
    () =>
      allScenes
        .filter((s) => s.projectId === projectId)
        .sort((a, b) => a.order - b.order),
    [allScenes, projectId]
  );
  const [snackbar, setSnackbar] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const isSelecting = selectedIds.size > 0;
  const [keyboardPad, setKeyboardPad] = useState(0);

  // Editor mode: which scene is being edited (null = list mode)
  const [editingId, setEditingId] = useState<string | null>(null);
  const editingScene = useMemo(
    () => (editingId ? scenes.find((s) => s.id === editingId) : null),
    [editingId, scenes]
  );
  const editingIndex = useMemo(
    () => (editingId ? scenes.findIndex((s) => s.id === editingId) : -1),
    [editingId, scenes]
  );

  // Close editor if the scene was deleted
  useEffect(() => {
    if (editingId && !scenes.some((s) => s.id === editingId)) {
      setEditingId(null);
    }
  }, [editingId, scenes]);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const show = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardPad(Math.max(0, e.endCoordinates.height - bottomInset));
    });
    const hide = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardPad(0);
    });
    return () => { show.remove(); hide.remove(); };
  }, [bottomInset]);

  // Intercept Android back when inside the scene editor so it closes
  // the editor instead of navigating back to the project hub.
  useEffect(() => {
    if (!editingId) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      setEditingId(null);
      return true; // consumed — prevents default router.back()
    });
    return () => sub.remove();
  }, [editingId]);

  const handleEnterSelect = useCallback((id: string) => {
    setSelectedIds(new Set([id]));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }, []);

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    Haptics.selectionAsync();
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedIds(new Set(scenes.map((s) => s.id)));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [scenes]);

  const handleCancelSelect = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const handleDeleteSelected = useCallback(() => {
    const ids = Array.from(selectedIds);
    deleteScenes(ids);
    setSelectedIds(new Set());
    setConfirmBulkDelete(false);
    setSnackbar(`${ids.length} scene${ids.length > 1 ? 's' : ''} deleted`);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [selectedIds, deleteScenes]);

  const handleDragEnd = useCallback(
    ({ from, to }: { from: number; to: number }) => {
      if (from !== to) {
        reorderScenes(projectId, from, to);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    },
    [projectId, reorderScenes]
  );

  const handleAddScene = () => {
    const nextOrder = scenes.length;
    addScene({
      projectId,
      order: nextOrder,
      title: `Scene ${nextOrder + 1}`,
      narration: '',
      visualPromptMeta: {
        imagePrompt: '',
        videoPrompt: '',
        cameraDirection: '',
        lighting: '',
        mood: '',
      },
      characterIds: [],
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const renderItem = useCallback(
    ({ item, drag, isActive, getIndex }: RenderItemParams<SceneBlock>) => (
      <ScaleDecorator>
        <SceneBlockCard
          scene={item}
          index={getIndex() ?? 0}
          drag={isSelecting ? undefined : drag}
          isActive={isActive}
          isSelecting={isSelecting}
          isSelected={selectedIds.has(item.id)}
          onSelect={handleToggleSelect}
          onEnterSelect={handleEnterSelect}
          onOpen={() => setEditingId(item.id)}
        />
      </ScaleDecorator>
    ),
    [isSelecting, selectedIds, handleToggleSelect, handleEnterSelect]
  );

  // ─── Editor mode ───
  if (editingScene) {
    return (
      <SceneEditor
        scene={editingScene}
        index={editingIndex}
        onClose={() => setEditingId(null)}
      />
    );
  }

  // ─── List mode ───
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header — normal or selection toolbar */}
      {isSelecting ? (
        <View style={[styles.selectionBar, { borderBottomColor: colors.outlineVariant }]}>
          <Text variant="titleSmall" style={[styles.selectionCount, { color: colors.primary }]}>
            {selectedIds.size} selected
          </Text>
          <Button
            compact
            mode="text"
            onPress={handleSelectAll}
            textColor={colors.onSurfaceVariant}
          >
            All
          </Button>
          <Button
            compact
            mode="contained"
            buttonColor={colors.errorContainer}
            textColor={colors.error}
            onPress={() => setConfirmBulkDelete(true)}
            icon="delete-sweep"
          >
            Delete
          </Button>
          <IconButton
            icon="close"
            size={20}
            iconColor={colors.onSurfaceVariant}
            onPress={handleCancelSelect}
            style={styles.closeBtn}
          />
        </View>
      ) : (
        <View style={styles.header}>
          <Text variant="titleMedium" style={{ color: colors.onBackground }}>
            Master Document
          </Text>
          <Badge style={{ backgroundColor: colors.primaryContainer }}>
            {scenes.length}
          </Badge>
        </View>
      )}

      {scenes.length === 0 ? (
        <View style={styles.emptyWrap}>
          <EmptyState
            title="No scenes yet"
            subtitle="Add your first scene to start building the narrative"
          />
        </View>
      ) : (
        <DraggableFlatList<SceneBlock>
          data={scenes}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          onDragEnd={handleDragEnd}
          onDragBegin={() =>
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
          }
          contentContainerStyle={{ paddingBottom: 80 + keyboardPad }}
          activationDistance={15}
          dragItemOverflow
          autoscrollThreshold={80}
          keyboardShouldPersistTaps="handled"
        />
      )}

      {/* Floating Add Scene Button — hidden during selection */}
      {!isSelecting && (
        <FAB
          icon="plus"
          label="Add Scene"
          onPress={handleAddScene}
          style={[styles.fab, { backgroundColor: colors.primaryContainer }]}
          color={colors.onPrimaryContainer}
        />
      )}

      {/* Bulk delete confirmation */}
      <Portal>
        <Dialog visible={confirmBulkDelete} onDismiss={() => setConfirmBulkDelete(false)}>
          <Dialog.Title>Delete {selectedIds.size} Scene{selectedIds.size > 1 ? 's' : ''}?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              This will permanently remove {selectedIds.size} scene{selectedIds.size > 1 ? 's' : ''} from your script. This cannot be undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmBulkDelete(false)}>Cancel</Button>
            <Button textColor={colors.error} onPress={handleDeleteSelected}>
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar
        visible={!!snackbar}
        onDismiss={() => setSnackbar('')}
        duration={2000}
      >
        {snackbar}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  selectionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
    gap: 4,
  },
  selectionCount: {
    flex: 1,
    fontWeight: '700',
  },
  closeBtn: {
    margin: 0,
  },
  emptyWrap: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});
