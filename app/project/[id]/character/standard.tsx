import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, IconButton, useTheme, ActivityIndicator } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useProjectStore } from '../../../../src/stores/projectStore';
import { refineCharacterText } from '../../../../src/api/xai';
import { useCharacterCreation } from '../../../../src/hooks/useCharacterCreation';
import { CharacterLoadingOverlay } from '../../../../src/components/CharacterLoadingOverlay';

export default function StandardCreationScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const projectId = id ?? '';
  const project = useProjectStore((s) => s.getProject(projectId));
  const genre = project?.genre ?? 'fantasy';

  const [text, setText] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const { createFromText, isCreating } = useCharacterCreation(projectId);

  const canRefine = text.trim().length >= 20;
  const canFinish = text.trim().length >= 20;

  const handleRefine = async () => {
    if (!canRefine) return;
    setIsRefining(true);
    try {
      const refined = await refineCharacterText(text.trim(), genre);
      if (refined) setText(refined);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsRefining(false);
    }
  };

  const handleFinish = () => {
    if (!canFinish) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    createFromText(text.trim(), genre);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 4 }]}>
        <IconButton icon="arrow-left" onPress={() => router.back()} iconColor={colors.onSurface} />
        <Text variant="titleLarge" style={[styles.headerTitle, { color: colors.onBackground }]}>
          Describe your character
        </Text>
        <View style={{ width: 48 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.body}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top + 60}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant, marginBottom: 12 }}>
            Write anything about your character — rough notes, bullet points, or full prose. AI will
            fill in the gaps when you finish.
          </Text>

          <TextInput
            mode="outlined"
            multiline
            placeholder="A grizzled dwarven blacksmith with a secret past..."
            value={text}
            onChangeText={setText}
            style={styles.textInput}
            contentStyle={styles.textInputContent}
            disabled={isRefining}
          />
        </ScrollView>

        {/* Bottom actions */}
        <View style={[styles.actions, { paddingBottom: insets.bottom + 12 }]}>
          <Button
            mode="outlined"
            onPress={handleRefine}
            disabled={!canRefine || isRefining}
            icon={isRefining ? undefined : 'auto-fix'}
            style={styles.actionButton}
          >
            {isRefining ? 'Refining…' : 'Refine'}
          </Button>
          <Button
            mode="contained"
            onPress={handleFinish}
            disabled={!canFinish || isCreating}
            icon="check"
            style={styles.actionButton}
          >
            Finish
          </Button>
        </View>
      </KeyboardAvoidingView>

      <CharacterLoadingOverlay visible={isCreating} />
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
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  body: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 8,
    flexGrow: 1,
  },
  textInput: {
    flex: 1,
    minHeight: 200,
  },
  textInputContent: {
    paddingTop: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  actionButton: {
    flex: 1,
  },
});
