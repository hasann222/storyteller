import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import {
  Text,
  SegmentedButtons,
  Switch,
  RadioButton,
  Button,
  IconButton,
  Divider,
  Portal,
  Dialog,
  Snackbar,
  TextInput,
  useTheme,
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';

import {
  useSettingsStore,
  getApiKey,
  setApiKey,
  deleteApiKey,
  type ThemeMode,
  type FontScale,
  type AiModel,
} from '../src/stores/settingsStore';
import { useProjectStore } from '../src/stores/projectStore';
import { useCharacterStore } from '../src/stores/characterStore';
import { useSceneStore } from '../src/stores/sceneStore';
import { useChatStore } from '../src/stores/chatStore';

const AI_MODELS: { value: AiModel; label: string; description: string }[] = [
  { value: 'grok-4-1-fast-reasoning', label: 'Grok 4.1 Fast Reasoning', description: '$0.20 / $0.50 per 1M tokens' },
  { value: 'grok-4-fast', label: 'Grok 4 Fast', description: '$0.50 / $1.50 per 1M tokens' },
  { value: 'grok-4', label: 'Grok 4', description: '$2 / $6 per 1M tokens' },
  { value: 'grok-4.20-reasoning', label: 'Grok 4.20 Reasoning', description: '$2 / $6 per 1M tokens' },
];

export default function SettingsScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const themeMode = useSettingsStore((s) => s.themeMode);
  const fontScale = useSettingsStore((s) => s.fontScale);
  const aiModel = useSettingsStore((s) => s.aiModel);
  const aiStreamingEnabled = useSettingsStore((s) => s.aiStreamingEnabled);
  const setThemeMode = useSettingsStore((s) => s.setThemeMode);
  const setFontScale = useSettingsStore((s) => s.setFontScale);
  const setAiModel = useSettingsStore((s) => s.setAiModel);
  const setAiStreamingEnabled = useSettingsStore((s) => s.setAiStreamingEnabled);

  // API key state
  const [apiKeyValue, setApiKeyValue] = useState('');
  const [apiKeyMasked, setApiKeyMasked] = useState(true);
  const [apiKeyLoaded, setApiKeyLoaded] = useState(false);

  // Dialog / snackbar state
  const [resetDialogVisible, setResetDialogVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  useEffect(() => {
    getApiKey().then((key) => {
      if (key) setApiKeyValue(key);
      setApiKeyLoaded(true);
    });
  }, []);

  const handleSaveApiKey = useCallback(async () => {
    const trimmed = apiKeyValue.trim();
    if (trimmed) {
      await setApiKey(trimmed);
      setSnackbarMessage('API key saved');
    } else {
      await deleteApiKey();
      setSnackbarMessage('API key removed');
    }
    setSnackbarVisible(true);
  }, [apiKeyValue]);

  // ── Export ──
  const handleExport = useCallback(async () => {
    try {
      const data = {
        version: 1,
        exportedAt: Date.now(),
        projects: useProjectStore.getState().projects,
        characters: useCharacterStore.getState().characters,
        scenes: useSceneStore.getState().scenes,
        messages: useChatStore.getState().messages,
      };
      const json = JSON.stringify(data, null, 2);
      const file = new File(Paths.cache, 'storyteller-backup.json');
      file.write(json);
      await Sharing.shareAsync(file.uri, {
        mimeType: 'application/json',
        dialogTitle: 'Export Storyteller Data',
      });
    } catch {
      setSnackbarMessage('Export failed');
      setSnackbarVisible(true);
    }
  }, []);

  // ── Import ──
  const handleImport = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets?.[0]) return;

      const fileUri = result.assets[0].uri;
      const importedFile = new File(fileUri);
      const raw = await importedFile.text();
      const data = JSON.parse(raw);
      if (!data || data.version !== 1) {
        setSnackbarMessage('Invalid backup file');
        setSnackbarVisible(true);
        return;
      }

      let pCount = 0, cCount = 0, sCount = 0, mCount = 0;

      // Upsert projects
      if (Array.isArray(data.projects)) {
        const existing = useProjectStore.getState().projects;
        const existingMap = new Map(existing.map((p) => [p.id, p]));
        for (const imported of data.projects) {
          const current = existingMap.get(imported.id);
          if (!current) {
            useProjectStore.setState((s) => ({ projects: [...s.projects, imported] }));
            pCount++;
          } else if (imported.updatedAt > current.updatedAt) {
            useProjectStore.getState().updateProject(imported.id, imported);
            pCount++;
          }
        }
      }

      // Upsert characters
      if (Array.isArray(data.characters)) {
        const existing = useCharacterStore.getState().characters;
        const existingMap = new Map(existing.map((c) => [c.id, c]));
        for (const imported of data.characters) {
          const current = existingMap.get(imported.id);
          if (!current) {
            useCharacterStore.setState((s) => ({ characters: [...s.characters, imported] }));
            cCount++;
          } else if (imported.createdAt > current.createdAt) {
            useCharacterStore.getState().updateCharacter(imported.id, imported);
            cCount++;
          }
        }
      }

      // Upsert scenes
      if (Array.isArray(data.scenes)) {
        const existing = useSceneStore.getState().scenes;
        const existingMap = new Map(existing.map((s) => [s.id, s]));
        for (const imported of data.scenes) {
          if (!existingMap.has(imported.id)) {
            useSceneStore.setState((s) => ({ scenes: [...s.scenes, imported] }));
            sCount++;
          }
        }
      }

      // Upsert messages
      if (Array.isArray(data.messages)) {
        const existing = useChatStore.getState().messages;
        const existingMap = new Map(existing.map((m) => [m.id, m]));
        for (const imported of data.messages) {
          if (!existingMap.has(imported.id)) {
            useChatStore.setState((s) => ({ messages: [...s.messages, imported] }));
            mCount++;
          }
        }
      }

      setSnackbarMessage(
        `Imported ${pCount} projects, ${cCount} characters, ${sCount} scenes, ${mCount} messages`
      );
      setSnackbarVisible(true);
    } catch {
      setSnackbarMessage('Import failed — invalid file');
      setSnackbarVisible(true);
    }
  }, []);

  // ── Reset ──
  const handleReset = useCallback(async () => {
    setResetDialogVisible(false);
    useProjectStore.setState({ projects: [] });
    useCharacterStore.setState({ characters: [] });
    useSceneStore.setState({ scenes: [] });
    useChatStore.setState({ messages: [] });
    useSettingsStore.setState({
      themeMode: 'light',
      fontScale: 'default',
      aiModel: 'grok-4-1-fast-reasoning',
      aiStreamingEnabled: false,
    });
    await deleteApiKey();
    setApiKeyValue('');
    setSnackbarMessage('All data cleared');
    setSnackbarVisible(true);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 4 }]}>
        <IconButton
          icon="arrow-left"
          iconColor={colors.onBackground}
          size={24}
          onPress={() => router.back()}
        />
        <Text variant="titleLarge" style={[styles.headerTitle, { color: colors.onBackground }]}>
          Settings
        </Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* ── Appearance ── */}
        <Text variant="titleSmall" style={[styles.sectionTitle, { color: colors.primary }]}>
          Appearance
        </Text>

        <Text variant="bodyMedium" style={[styles.label, { color: colors.onSurface }]}>
          Theme
        </Text>
        <SegmentedButtons
          value={themeMode}
          onValueChange={(v) => setThemeMode(v as ThemeMode)}
          buttons={[
            { value: 'light', label: 'Light' },
            { value: 'system', label: 'System' },
            { value: 'dark', label: 'Dark' },
          ]}
          style={styles.segmented}
        />

        <Text variant="bodyMedium" style={[styles.label, { color: colors.onSurface, marginTop: 16 }]}>
          Font Size
        </Text>
        <SegmentedButtons
          value={fontScale}
          onValueChange={(v) => setFontScale(v as FontScale)}
          buttons={[
            { value: 'small', label: 'Small' },
            { value: 'default', label: 'Default' },
            { value: 'large', label: 'Large' },
          ]}
          style={styles.segmented}
        />

        <Divider style={styles.divider} />

        {/* ── AI — Grok ── */}
        <Text variant="titleSmall" style={[styles.sectionTitle, { color: colors.primary }]}>
          AI — Grok
        </Text>

        <Text variant="bodyMedium" style={[styles.label, { color: colors.onSurface }]}>
          API Key
        </Text>
        <View style={styles.apiKeyRow}>
          <TextInput
            mode="outlined"
            value={apiKeyLoaded ? apiKeyValue : ''}
            onChangeText={setApiKeyValue}
            secureTextEntry={apiKeyMasked}
            placeholder="xai-..."
            right={
              <TextInput.Icon
                icon={apiKeyMasked ? 'eye-off' : 'eye'}
                onPress={() => setApiKeyMasked(!apiKeyMasked)}
              />
            }
            style={styles.apiKeyInput}
            dense
          />
          <Button
            mode="contained-tonal"
            onPress={handleSaveApiKey}
            style={styles.saveButton}
            compact
          >
            Save
          </Button>
        </View>

        <Text variant="bodyMedium" style={[styles.label, { color: colors.onSurface, marginTop: 16 }]}>
          Model
        </Text>
        <RadioButton.Group
          value={aiModel}
          onValueChange={(v) => setAiModel(v as AiModel)}
        >
          {AI_MODELS.map((m) => (
            <View key={m.value} style={styles.radioRow}>
              <RadioButton.Android value={m.value} />
              <View style={styles.radioTextContainer}>
                <Text variant="bodyMedium" style={{ color: colors.onSurface }}>
                  {m.label}
                </Text>
                <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                  {m.description}
                </Text>
              </View>
            </View>
          ))}
        </RadioButton.Group>

        <View style={styles.switchRow}>
          <Text variant="bodyMedium" style={{ color: colors.onSurface, flex: 1 }}>
            Streaming responses
          </Text>
          <Switch
            value={aiStreamingEnabled}
            onValueChange={setAiStreamingEnabled}
          />
        </View>

        <Divider style={styles.divider} />

        {/* ── Data Management ── */}
        <Text variant="titleSmall" style={[styles.sectionTitle, { color: colors.primary }]}>
          Data Management
        </Text>

        <Button
          mode="outlined"
          icon="export-variant"
          onPress={handleExport}
          style={styles.dataButton}
        >
          Export All Projects
        </Button>
        <Button
          mode="outlined"
          icon="import"
          onPress={handleImport}
          style={styles.dataButton}
        >
          Import Data
        </Button>
        <Button
          mode="outlined"
          icon="delete-outline"
          textColor={colors.error}
          onPress={() => setResetDialogVisible(true)}
          style={styles.dataButton}
        >
          Reset All Data
        </Button>

        <Divider style={styles.divider} />

        {/* ── About ── */}
        <Text variant="titleSmall" style={[styles.sectionTitle, { color: colors.primary }]}>
          About
        </Text>
        <Text variant="bodyMedium" style={{ color: colors.onSurface }}>
          Storyteller
        </Text>
        <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant, marginTop: 2 }}>
          Version 1.0.0
        </Text>
        <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant, marginTop: 2, marginBottom: 40 }}>
          A creative writing companion powered by AI.
        </Text>
      </ScrollView>

      {/* Reset confirmation dialog */}
      <Portal>
        <Dialog visible={resetDialogVisible} onDismiss={() => setResetDialogVisible(false)}>
          <Dialog.Title>Reset All Data</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              This will permanently delete all your projects, characters, scenes, chat history, and settings. This action cannot be undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setResetDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleReset} textColor={colors.error}>
              Reset Everything
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Snackbar */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
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
    paddingHorizontal: 4,
    paddingBottom: 4,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  label: {
    marginBottom: 8,
  },
  segmented: {
    marginBottom: 0,
  },
  divider: {
    marginVertical: 24,
  },
  apiKeyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  apiKeyInput: {
    flex: 1,
  },
  saveButton: {
    marginTop: 6,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  radioTextContainer: {
    flex: 1,
    marginLeft: 4,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  dataButton: {
    marginBottom: 12,
    alignSelf: 'stretch',
  },
});
