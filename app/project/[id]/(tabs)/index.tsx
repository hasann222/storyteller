import React, { useState, useRef } from 'react';
import { StyleSheet, View, ScrollView, useWindowDimensions } from 'react-native';
import {
  Text,
  IconButton,
  SegmentedButtons,
  Portal,
  Dialog,
  Button,
  TextInput,
  useTheme,
} from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useProjectStore } from '../../../../src/stores/projectStore';
import { EmptyState } from '../../../../src/components/EmptyState';
import { BrainstormChat } from '../../../../src/components/BrainstormChat';
import { MasterDocument } from '../../../../src/components/MasterDocument';
import { genreColors } from '../../../../src/theme';

type EditorTab = 'brainstorm' | 'script';

export default function StudioScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const project = useProjectStore((s) => s.getProject(id ?? ''));
  const updateProject = useProjectStore((s) => s.updateProject);
  const accent = project ? (genreColors[project.genre] ?? colors.primary) : colors.primary;
  const { width } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState<EditorTab>('brainstorm');
  const scrollRef = useRef<ScrollView>(null);

  // System prompt dialog
  const [promptDialogVisible, setPromptDialogVisible] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState('');

  if (!project) {
    return (
      <EmptyState title="Project not found" subtitle="This project may have been deleted" />
    );
  }

  const handleTabChange = (value: string) => {
    const nextTab = value as EditorTab;
    setActiveTab(nextTab);
    scrollRef.current?.scrollTo({
      x: nextTab === 'brainstorm' ? 0 : width,
      animated: true,
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
        <IconButton
          icon="account-edit-outline"
          iconColor={colors.onSurfaceVariant}
          size={22}
          onPress={() => {
            setEditedPrompt(project.systemPrompt ?? '');
            setPromptDialogVisible(true);
          }}
        />
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

      {/* Both tabs kept alive — native horizontal scroll avoids transform matrices */}
      <View style={styles.body}>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onMomentumScrollEnd={(e) => {
            const x = e.nativeEvent.contentOffset.x;
            setActiveTab(x > width / 2 ? 'script' : 'brainstorm');
          }}
          style={{ flex: 1 }}
        >
          <View style={{ width, height: '100%' }}>
            <BrainstormChat projectId={id ?? ''} />
          </View>
          <View style={{ width, height: '100%' }}>
            <MasterDocument projectId={id ?? ''} />
          </View>
        </ScrollView>
      </View>

      {/* System Prompt Editor */}
      <Portal>
        <Dialog
          visible={promptDialogVisible}
          onDismiss={() => setPromptDialogVisible(false)}
          style={{ maxHeight: '80%' }}
        >
          <Dialog.Title>Persona</Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView style={{ maxHeight: 300, paddingHorizontal: 24 }}>
              <TextInput
                mode="outlined"
                multiline
                value={editedPrompt}
                onChangeText={setEditedPrompt}
                numberOfLines={8}
                style={{ marginVertical: 8 }}
              />
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setPromptDialogVisible(false)}>Cancel</Button>
            <Button
              onPress={() => {
                updateProject(id ?? '', { systemPrompt: editedPrompt });
                setPromptDialogVisible(false);
              }}
            >
              Save
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
