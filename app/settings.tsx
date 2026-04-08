import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Alert, Pressable } from 'react-native';
import {
  Text,
  SegmentedButtons,
  RadioButton,
  Button,
  IconButton,
  Divider,
  Portal,
  Dialog,
  Snackbar,
  TextInput,
  Chip,
  ActivityIndicator,
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
  getMgmtKey,
  setMgmtKey,
  deleteMgmtKey,
  DEFAULT_INTERVIEW_PROMPT,
  DEFAULT_EXTRACT_INTERVIEW_PROMPT,
  DEFAULT_EXTRACT_STANDARD_PROMPT,
  DEFAULT_REFINE_PROMPT,
  DEFAULT_RANDOM_CHARACTER_PROMPT,
  type ThemeMode,
  type FontScale,
  type AiModel,
} from '../src/stores/settingsStore';
import { useProjectStore } from '../src/stores/projectStore';
import { useCharacterStore } from '../src/stores/characterStore';
import { useSceneStore } from '../src/stores/sceneStore';
import { useChatStore } from '../src/stores/chatStore';
import {
  fetchApiKeyInfo,
  fetchCreditBalance,
  fetchLanguageModels,
  type ApiKeyInfo,
  type LanguageModel,
} from '../src/api/xai';

/** Models we support — used to filter live API response + provide fallback labels */
const SUPPORTED_MODELS: { value: AiModel; fallbackLabel: string }[] = [
  { value: 'grok-4-1-fast-reasoning', fallbackLabel: 'Grok 4.1 Fast Reasoning' },
  { value: 'grok-4-fast', fallbackLabel: 'Grok 4 Fast' },
  { value: 'grok-4', fallbackLabel: 'Grok 4' },
  { value: 'grok-4.20-reasoning', fallbackLabel: 'Grok 4.20 Reasoning' },
];

/** Convert xAI price (USD cents per 100M tokens) → $/1M tokens string */
function formatTokenPrice(centsPerHundredMillion: number): string {
  const dollarsPerMillion = centsPerHundredMillion / 100 / 100;
  return dollarsPerMillion < 0.01
    ? `$${dollarsPerMillion.toFixed(3)}`
    : `$${dollarsPerMillion.toFixed(2)}`;
}

type KeyStatus = 'unknown' | 'loading' | 'active' | 'blocked' | 'disabled' | 'error';

export default function SettingsScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const themeMode = useSettingsStore((s) => s.themeMode);
  const fontScale = useSettingsStore((s) => s.fontScale);
  const aiModel = useSettingsStore((s) => s.aiModel);
  const setThemeMode = useSettingsStore((s) => s.setThemeMode);
  const setFontScale = useSettingsStore((s) => s.setFontScale);
  const setAiModel = useSettingsStore((s) => s.setAiModel);

  // Character prompt state
  const interviewPrompt = useSettingsStore((s) => s.interviewPrompt);
  const extractInterviewPrompt = useSettingsStore((s) => s.extractInterviewPrompt);
  const extractStandardPrompt = useSettingsStore((s) => s.extractStandardPrompt);
  const refinePrompt = useSettingsStore((s) => s.refinePrompt);
  const randomCharacterPrompt = useSettingsStore((s) => s.randomCharacterPrompt);
  const setInterviewPrompt = useSettingsStore((s) => s.setInterviewPrompt);
  const setExtractInterviewPrompt = useSettingsStore((s) => s.setExtractInterviewPrompt);
  const setExtractStandardPrompt = useSettingsStore((s) => s.setExtractStandardPrompt);
  const setRefinePrompt = useSettingsStore((s) => s.setRefinePrompt);
  const setRandomCharacterPrompt = useSettingsStore((s) => s.setRandomCharacterPrompt);
  const resetCharacterPrompts = useSettingsStore((s) => s.resetCharacterPrompts);
  const [promptSectionOpen, setPromptSectionOpen] = useState(false);
  const [expandedPrompt, setExpandedPrompt] = useState<string | null>(null);

  // API key state
  const [apiKeyValue, setApiKeyValue] = useState('');
  const [apiKeyMasked, setApiKeyMasked] = useState(true);
  const [apiKeyLoaded, setApiKeyLoaded] = useState(false);

  // Management key state
  const [mgmtKeyValue, setMgmtKeyValue] = useState('');
  const [mgmtKeyMasked, setMgmtKeyMasked] = useState(true);
  const [mgmtKeyLoaded, setMgmtKeyLoaded] = useState(false);

  // Key health state
  const [keyStatus, setKeyStatus] = useState<KeyStatus>('unknown');
  const [creditBalance, setCreditBalance] = useState<string | null>(null);

  // Live model pricing
  const [liveModels, setLiveModels] = useState<LanguageModel[] | null>(null);
  const [modelsLoading, setModelsLoading] = useState(false);

  // Dialog / snackbar state
  const [resetDialogVisible, setResetDialogVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const cachedTeamId = useSettingsStore((s) => s.cachedTeamId);
  const setCachedTeamId = useSettingsStore((s) => s.setCachedTeamId);

  /** Fetch key health, cache team_id, fetch balance + models */
  const refreshKeyHealth = useCallback(async (key?: string) => {
    const apiKey = key ?? (await getApiKey());
    if (!apiKey) {
      setKeyStatus('unknown');
      setCreditBalance(null);
      setLiveModels(null);
      return;
    }
    setKeyStatus('loading');
    setModelsLoading(true);
    try {
      const [info, models] = await Promise.all([
        fetchApiKeyInfo(),
        fetchLanguageModels(),
      ]);
      setLiveModels(models);
      setModelsLoading(false);

      // Cache team_id
      setCachedTeamId(info.team_id);

      if (info.api_key_blocked || info.team_blocked) {
        setKeyStatus('blocked');
        setCreditBalance(null);
        return;
      }
      if (info.api_key_disabled) {
        setKeyStatus('disabled');
        setCreditBalance(null);
        return;
      }
      setKeyStatus('active');

      // Fetch balance using management key
      try {
        const mgmtKey = await getMgmtKey();
        if (mgmtKey) {
          const balance = await fetchCreditBalance(info.team_id, mgmtKey);
          const dollars = balance.totalCents / 100;
          setCreditBalance(`$${dollars.toFixed(2)}`);
        } else {
          setCreditBalance(null);
        }
      } catch {
        setCreditBalance(null);
      }
    } catch {
      setKeyStatus('error');
      setCreditBalance(null);
      setModelsLoading(false);
    }
  }, [setCachedTeamId]);

  // Keep a ref to the latest refreshKeyHealth so the mount-only effect can call
  // it without listing it as a dependency (which would cause the effect to re-run
  // every time store state changes, overwriting whatever the user is typing).
  const refreshKeyHealthRef = React.useRef(refreshKeyHealth);
  refreshKeyHealthRef.current = refreshKeyHealth;

  useEffect(() => {
    getApiKey().then((key) => {
      if (key) {
        setApiKeyValue(key);
        refreshKeyHealthRef.current(key);
      }
      setApiKeyLoaded(true);
    });
    getMgmtKey().then((key) => {
      if (key) setMgmtKeyValue(key);
      setMgmtKeyLoaded(true);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveMgmtKey = useCallback(async () => {
    const trimmed = mgmtKeyValue.trim();
    if (trimmed) {
      await setMgmtKey(trimmed);
      setSnackbarMessage('Management key saved');
      // Refresh balance immediately if we have a team_id and active key
      const teamId = cachedTeamId;
      if (teamId && keyStatus === 'active') {
        try {
          const balance = await fetchCreditBalance(teamId, trimmed);
          const dollars = balance.totalCents / 100;
          setCreditBalance(`$${dollars.toFixed(2)}`);
        } catch {
          setCreditBalance(null);
        }
      }
    } else {
      await deleteMgmtKey();
      setCreditBalance(null);
      setSnackbarMessage('Management key removed');
    }
    setSnackbarVisible(true);
  }, [mgmtKeyValue, cachedTeamId, keyStatus]);

  const handleSaveApiKey = useCallback(async () => {
    const trimmed = apiKeyValue.trim();
    if (trimmed) {
      await setApiKey(trimmed);
      setSnackbarMessage('API key saved');
      refreshKeyHealth(trimmed);
    } else {
      await deleteApiKey();
      setCachedTeamId(null);
      setKeyStatus('unknown');
      setCreditBalance(null);
      setLiveModels(null);
      setSnackbarMessage('API key removed');
    }
    setSnackbarVisible(true);
  }, [apiKeyValue, refreshKeyHealth, setCachedTeamId]);

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
            useCharacterStore.setState((s) => ({
              characters: s.characters.map((c) => c.id === imported.id ? imported : c),
            }));
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
      fontScale: 'default',
      aiModel: 'grok-4-1-fast-reasoning',
      cachedTeamId: null,
    });
    await deleteApiKey();
    await deleteMgmtKey();
    setApiKeyValue('');
    setMgmtKeyValue('');
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

        {/* Key status + credit balance */}
        {keyStatus !== 'unknown' && (
          <View style={styles.keyInfoRow}>
            {keyStatus === 'loading' ? (
              <ActivityIndicator size={14} style={{ marginRight: 8 }} />
            ) : (
              <Chip
                compact
                mode="flat"
                icon={
                  keyStatus === 'active' ? 'check-circle' :
                  keyStatus === 'blocked' ? 'close-circle' :
                  keyStatus === 'disabled' ? 'alert-circle' :
                  'help-circle'
                }
                style={{
                  backgroundColor:
                    keyStatus === 'active' ? '#1B5E2020' :
                    keyStatus === 'blocked' ? '#B7121220' :
                    keyStatus === 'disabled' ? '#E6510020' :
                    colors.surfaceVariant,
                }}
                textStyle={{
                  color:
                    keyStatus === 'active' ? '#1B5E20' :
                    keyStatus === 'blocked' ? '#B71212' :
                    keyStatus === 'disabled' ? '#E65100' :
                    colors.onSurfaceVariant,
                  fontSize: 12,
                }}
              >
                {keyStatus === 'active' ? 'Active' :
                 keyStatus === 'blocked' ? 'Blocked' :
                 keyStatus === 'disabled' ? 'Disabled' :
                 'Error'}
              </Chip>
            )}
            {creditBalance && keyStatus === 'active' && (
              <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant, marginLeft: 12 }}>
                {creditBalance} credit remaining
              </Text>
            )}
          </View>
        )}

        <Text variant="bodyMedium" style={[styles.label, { color: colors.onSurface, marginTop: 16 }]}>
          Management Key
        </Text>
        <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant, marginBottom: 6 }}>
          Optional. Required to show credit balance.
        </Text>
        <View style={styles.apiKeyRow}>
          <TextInput
            mode="outlined"
            value={mgmtKeyLoaded ? mgmtKeyValue : ''}
            onChangeText={setMgmtKeyValue}
            secureTextEntry={mgmtKeyMasked}
            placeholder="xai-mgmt-..."
            right={
              <TextInput.Icon
                icon={mgmtKeyMasked ? 'eye-off' : 'eye'}
                onPress={() => setMgmtKeyMasked(!mgmtKeyMasked)}
              />
            }
            style={styles.apiKeyInput}
            dense
          />
          <Button
            mode="contained-tonal"
            onPress={handleSaveMgmtKey}
            style={styles.saveButton}
            compact
          >
            Save
          </Button>
        </View>

        <Text variant="bodyMedium" style={[styles.label, { color: colors.onSurface, marginTop: 16 }]}>
          Model
        </Text>
        {modelsLoading && <ActivityIndicator size={16} style={{ alignSelf: 'flex-start', marginBottom: 8 }} />}
        <RadioButton.Group
          value={aiModel}
          onValueChange={(v) => setAiModel(v as AiModel)}
        >
          {SUPPORTED_MODELS.map((m) => {
            const live = liveModels?.find((lm) => lm.id === m.value || lm.aliases?.includes(m.value));
            const label = m.fallbackLabel;
            const description = live
              ? `${formatTokenPrice(live.prompt_text_token_price)} / ${formatTokenPrice(live.completion_text_token_price)} per 1M tokens`
              : undefined;
            return (
              <View key={m.value} style={styles.radioRow}>
                <RadioButton.Android value={m.value} />
                <View style={styles.radioTextContainer}>
                  <Text variant="bodyMedium" style={{ color: colors.onSurface }}>
                    {label}
                  </Text>
                  {description && (
                    <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                      {description}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </RadioButton.Group>

        <Divider style={styles.divider} />

        {/* ── Character Prompts ── */}
        <Pressable
          onPress={() => setPromptSectionOpen(!promptSectionOpen)}
          style={styles.collapsibleHeader}
        >
          <Text variant="titleSmall" style={[styles.sectionTitle, { color: colors.primary, marginBottom: 0 }]}>
            Character Prompts
          </Text>
          <IconButton
            icon={promptSectionOpen ? 'chevron-up' : 'chevron-down'}
            iconColor={colors.primary}
            size={20}
          />
        </Pressable>
        {promptSectionOpen && (
          <View style={styles.promptSection}>
            <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant, marginBottom: 12 }}>
              Customize the system prompts used during character creation. Use {'{{genre}}'} as a placeholder for the project genre.
            </Text>

            {([
              { key: 'interview', label: 'Interview Prompt', value: interviewPrompt, setter: setInterviewPrompt, defaultVal: DEFAULT_INTERVIEW_PROMPT },
              { key: 'extractInterview', label: 'Extract from Interview', value: extractInterviewPrompt, setter: setExtractInterviewPrompt, defaultVal: DEFAULT_EXTRACT_INTERVIEW_PROMPT },
              { key: 'extractStandard', label: 'Extract from Standard', value: extractStandardPrompt, setter: setExtractStandardPrompt, defaultVal: DEFAULT_EXTRACT_STANDARD_PROMPT },
              { key: 'refine', label: 'Refine Prompt', value: refinePrompt, setter: setRefinePrompt, defaultVal: DEFAULT_REFINE_PROMPT },
              { key: 'random', label: 'Random Character Prompt', value: randomCharacterPrompt, setter: setRandomCharacterPrompt, defaultVal: DEFAULT_RANDOM_CHARACTER_PROMPT },
            ] as const).map((item) => {
              const isExpanded = expandedPrompt === item.key;
              const isModified = item.value !== item.defaultVal;
              return (
                <View key={item.key} style={styles.promptItem}>
                  <Pressable
                    onPress={() => setExpandedPrompt(isExpanded ? null : item.key)}
                    style={styles.promptLabelRow}
                  >
                    <Text variant="bodyMedium" style={{ color: colors.onSurface, flex: 1 }}>
                      {item.label}
                      {isModified ? ' •' : ''}
                    </Text>
                    <IconButton
                      icon={isExpanded ? 'chevron-up' : 'chevron-down'}
                      iconColor={colors.onSurfaceVariant}
                      size={18}
                    />
                  </Pressable>
                  {isExpanded && (
                    <TextInput
                      mode="outlined"
                      multiline
                      value={item.value}
                      onChangeText={item.setter}
                      style={styles.promptInput}
                      numberOfLines={6}
                      dense
                    />
                  )}
                </View>
              );
            })}

            <Button
              mode="outlined"
              onPress={() => {
                resetCharacterPrompts();
                setSnackbarMessage('Character prompts reset to defaults');
                setSnackbarVisible(true);
              }}
              icon="restore"
              style={{ marginTop: 8 }}
            >
              Reset to Defaults
            </Button>
          </View>
        )}

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
  keyInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
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
  collapsibleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  promptSection: {
    marginBottom: 4,
  },
  promptItem: {
    marginBottom: 6,
  },
  promptLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  promptInput: {
    marginTop: 4,
    minHeight: 120,
  },
});
