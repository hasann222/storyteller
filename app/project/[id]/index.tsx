import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Text, IconButton, SegmentedButtons, useTheme } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useProjectStore } from '../../../src/stores/projectStore';
import { EmptyState } from '../../../src/components/EmptyState';
import { BrainstormChat } from '../../../src/components/BrainstormChat';
import { MasterDocument } from '../../../src/components/MasterDocument';
import { genreColors } from '../../../src/theme';

type EditorTab = 'brainstorm' | 'script';

export default function StudioScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const project = useProjectStore((s) => s.getProject(id ?? ''));
  const accent = project ? (genreColors[project.genre] ?? colors.primary) : colors.primary;
  const [activeTab, setActiveTab] = useState<EditorTab>('brainstorm');

  if (!project) {
    return (
      <EmptyState title="Project not found" subtitle="This project may have been deleted" />
    );
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value as EditorTab);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 4 }]}>
        <IconButton
          icon="arrow-left"
          onPress={() => router.back()}
          iconColor={colors.onSurface}
        />
        <View style={styles.headerText}>
          <Text variant="titleLarge" numberOfLines={1} style={{ color: colors.onBackground }}>
            {project.title}
          </Text>
          <Text
            variant="labelSmall"
            style={{ color: accent, textTransform: 'capitalize' }}
          >
            {project.genre}
          </Text>
        </View>
      </View>

      {/* Segmented Tabs */}
      <View style={styles.tabBar}>
        <SegmentedButtons
          value={activeTab}
          onValueChange={handleTabChange}
          buttons={[
            {
              value: 'brainstorm',
              label: 'Brainstorm',
              icon: 'chat-outline',
            },
            {
              value: 'script',
              label: 'Script',
              icon: 'script-text-outline',
            },
          ]}
          density="medium"
        />
      </View>

      {/* Panel content — conditional render to avoid native transforms */}
      <View style={styles.body}>
        {activeTab === 'brainstorm' ? (
          <Animated.View key="brainstorm" entering={FadeIn.duration(200)} exiting={FadeOut.duration(120)} style={{ flex: 1 }}>
            <BrainstormChat projectId={id ?? ''} />
          </Animated.View>
        ) : (
          <Animated.View key="script" entering={FadeIn.duration(200)} exiting={FadeOut.duration(120)} style={{ flex: 1 }}>
            <MasterDocument projectId={id ?? ''} />
          </Animated.View>
        )}
      </View>
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
    paddingRight: 16,
  },
  headerText: {
    flex: 1,
  },
  tabBar: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  body: {
    flex: 1,
    overflow: 'hidden',
  },
});
