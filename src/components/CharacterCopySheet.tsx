import React from 'react';
import { FlatList, StyleSheet, View, Pressable } from 'react-native';
import { Text, Portal, Modal, Button, useTheme } from 'react-native-paper';
import { useProjectStore } from '../stores/projectStore';
import { useCharacterStore } from '../stores/characterStore';
import type { Project } from '../types/project';

interface CharacterCopySheetProps {
  visible: boolean;
  characterId: string;
  currentProjectId: string;
  onDismiss: () => void;
  onCopied: (targetProjectTitle: string) => void;
}

export function CharacterCopySheet({
  visible,
  characterId,
  currentProjectId,
  onDismiss,
  onCopied,
}: CharacterCopySheetProps) {
  const { colors } = useTheme();
  const projects = useProjectStore((s) => s.projects);
  const copyCharacter = useCharacterStore((s) => s.copyCharacterToProject);

  const otherProjects = projects.filter((p) => p.id !== currentProjectId);

  const handleSelect = (project: Project) => {
    copyCharacter(characterId, project.id);
    onCopied(project.title);
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[styles.modal, { backgroundColor: colors.surface }]}
      >
        <Text variant="titleMedium" style={[styles.title, { color: colors.onSurface }]}>
          Copy to project
        </Text>

        {otherProjects.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant, textAlign: 'center' }}>
              No other projects available.{'\n'}Create another project first.
            </Text>
            <Button mode="text" onPress={onDismiss} style={{ marginTop: 16 }}>
              Close
            </Button>
          </View>
        ) : (
          <FlatList
            data={otherProjects}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => handleSelect(item)}
                style={styles.projectRow}
              >
                <Text variant="bodyLarge" style={{ color: colors.onSurface }}>
                  {item.title}
                </Text>
                <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant, textTransform: 'capitalize' }}>
                  {item.genre}
                </Text>
              </Pressable>
            )}
            style={styles.list}
          />
        )}
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: {
    margin: 24,
    borderRadius: 16,
    padding: 20,
    maxHeight: '60%',
  },
  title: {
    marginBottom: 12,
  },
  list: {
    flexGrow: 0,
  },
  projectRow: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  emptyContainer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
});
