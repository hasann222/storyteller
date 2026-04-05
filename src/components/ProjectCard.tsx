import React, { useState } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Card, Text, useTheme, Menu, IconButton, Portal, Dialog, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { format } from 'date-fns';
import * as Haptics from 'expo-haptics';
import type { Project } from '../types/project';
import { genreColors } from '../theme';
import { useProjectStore } from '../stores/projectStore';
import { useCharacterStore } from '../stores/characterStore';
import { useSceneStore } from '../stores/sceneStore';
import { useChatStore } from '../stores/chatStore';

interface ProjectCardProps {
  project: Project;
  onPress: (id: string) => void;
}

export function ProjectCard({ project, onPress }: ProjectCardProps) {
  const { colors } = useTheme();
  const accent = genreColors[project.genre] ?? colors.primary;
  const [menuVisible, setMenuVisible] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const deleteProject = useProjectStore((s) => s.deleteProject);
  const deleteCharactersByProject = useCharacterStore((s) => s.deleteCharactersByProject);
  const deleteScenesByProject = useSceneStore((s) => s.deleteScenesByProject);
  const deleteMessagesByProject = useChatStore((s) => s.deleteMessagesByProject);

  const handleDelete = () => {
    deleteCharactersByProject(project.id);
    deleteScenesByProject(project.id);
    deleteMessagesByProject(project.id);
    deleteProject(project.id);
    setConfirmDelete(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <>
      <Pressable onPress={() => onPress(project.id)}>
        <Card style={styles.card} mode="elevated">
          <LinearGradient
            colors={[accent, `${accent}CC`]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <Text
              variant="titleLarge"
              style={[styles.title, { color: '#FFFFFF' }]}
              numberOfLines={1}
            >
              {project.title}
            </Text>
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <IconButton
                  icon="dots-vertical"
                  iconColor="rgba(255,255,255,0.85)"
                  size={20}
                  onPress={(e) => {
                    e.stopPropagation?.();
                    setMenuVisible(true);
                  }}
                  style={styles.menuBtn}
                />
              }
            >
              <Menu.Item
                leadingIcon="delete-outline"
                onPress={() => {
                  setMenuVisible(false);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  setConfirmDelete(true);
                }}
                title="Delete project"
                titleStyle={{ color: colors.error }}
              />
            </Menu>
          </LinearGradient>

          <Card.Content style={styles.content}>
            <Text
              variant="bodyMedium"
              numberOfLines={3}
              style={{ color: colors.onSurface }}
            >
              {project.premise}
            </Text>
            <Text
              variant="labelSmall"
              style={[styles.meta, { color: colors.onSurfaceVariant }]}
            >
              Updated {format(project.updatedAt, 'MMM d, yyyy')}
            </Text>
          </Card.Content>
        </Card>
      </Pressable>

      <Portal>
        <Dialog visible={confirmDelete} onDismiss={() => setConfirmDelete(false)}>
          <Dialog.Title>Delete "{project.title}"?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              This will permanently delete the project along with all its characters, scenes, and chat history. This cannot be undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmDelete(false)}>Cancel</Button>
            <Button textColor={colors.error} onPress={handleDelete}>Delete</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    overflow: 'hidden',
  },
  header: {
    paddingLeft: 16,
    paddingRight: 4,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    marginRight: 4,
  },
  menuBtn: {
    margin: 0,
  },
  content: {
    paddingTop: 12,
    paddingBottom: 14,
  },
  meta: {
    marginTop: 8,
  },
});
