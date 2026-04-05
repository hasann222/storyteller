import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Text, FAB, IconButton, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useProjectStore } from '../src/stores/projectStore';
import { ProjectCard } from '../src/components/ProjectCard';
import { EmptyState } from '../src/components/EmptyState';
import type { Project } from '../src/types/project';

export default function ProjectHub() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const projects = useProjectStore((s) => s.projects);

  const sorted = [...projects].sort((a, b) => b.updatedAt - a.updatedAt);

  const handlePress = (id: string) => {
    router.push(`/project/${id}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.headerArea, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text variant="headlineMedium" style={{ color: colors.onBackground }}>
              Your Stories
            </Text>
            <Text
              variant="bodyMedium"
              style={{ color: colors.onSurfaceVariant, marginTop: 2 }}
            >
              {projects.length} {projects.length === 1 ? 'project' : 'projects'}
            </Text>
          </View>
          <IconButton
            icon="cog-outline"
            iconColor={colors.onSurfaceVariant}
            size={24}
            onPress={() => router.push('/settings')}
          />
        </View>
      </View>

      <FlatList<Project>
        data={sorted}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProjectCard project={item} onPress={handlePress} />
        )}
        contentContainerStyle={
          sorted.length === 0 ? styles.emptyContainer : styles.listContent
        }
        ListEmptyComponent={
          <EmptyState
            title="No stories yet"
            subtitle="Tap the + button to start your first project"
          />
        }
      />

      <FAB
        icon="plus"
        style={[
          styles.fab,
          {
            backgroundColor: colors.primary,
            bottom: insets.bottom + 16,
          },
        ]}
        color={colors.onPrimary}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push('/new-project');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerArea: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 100,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  fab: {
    position: 'absolute',
    right: 16,
    borderRadius: 28,
  },
});
