import React, { useState, useRef } from 'react';
import { StyleSheet, View, Animated } from 'react-native';
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
  const fadeAnim = useRef(new Animated.Value(1)).current;

  if (!project) {
    return (
      <EmptyState title="Project not found" subtitle="This project may have been deleted" />
    );
  }

  const handleTabChange = (value: string) => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 80, useNativeDriver: true }).start(() => {
      setActiveTab(value as EditorTab);
      Animated.timing(fadeAnim, { toValue: 1, duration: 180, useNativeDriver: true }).start();
    });
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

      {/* Panel content */}
      <Animated.View style={[styles.body, { opacity: fadeAnim }]}>
        {activeTab === 'brainstorm' ? (
          <BrainstormChat projectId={id ?? ''} />
        ) : (
          <MasterDocument projectId={id ?? ''} />
        )}
      </Animated.View>
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
  },
});
