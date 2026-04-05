import React, { useState } from 'react';
import { StyleSheet, View, KeyboardAvoidingView, Platform } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  IconButton,
  useTheme,
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GenrePicker } from '../src/components/GenrePicker';
import { useProjectStore } from '../src/stores/projectStore';
import type { Genre } from '../src/types/project';

export default function NewProject() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const addProject = useProjectStore((s) => s.addProject);

  const [title, setTitle] = useState('');
  const [premise, setPremise] = useState('');
  const [genre, setGenre] = useState<string | null>(null);

  const canSubmit = title.trim().length > 0 && genre !== null;

  const handleCreate = () => {
    if (!canSubmit || !genre) return;
    const id = addProject(title.trim(), premise.trim(), genre);
    router.replace(`/project/${id}`);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <IconButton
          icon="close"
          onPress={() => router.back()}
          iconColor={colors.onSurface}
        />
        <Text variant="titleLarge" style={{ color: colors.onBackground, flex: 1 }}>
          New Project
        </Text>
      </View>

      <View style={styles.form}>
        <TextInput
          label="Story Title"
          value={title}
          onChangeText={setTitle}
          mode="outlined"
          style={styles.input}
          outlineColor={colors.outline}
          activeOutlineColor={colors.primary}
          maxLength={80}
        />

        <TextInput
          label="Premise (optional)"
          value={premise}
          onChangeText={setPremise}
          mode="outlined"
          style={[styles.input, styles.premiseInput]}
          outlineColor={colors.outline}
          activeOutlineColor={colors.primary}
          multiline
          numberOfLines={4}
          maxLength={500}
        />

        <Text
          variant="labelLarge"
          style={[styles.sectionLabel, { color: colors.onSurfaceVariant }]}
        >
          Genre
        </Text>
        <View style={styles.genreRow}>
          <GenrePicker selected={genre} onSelect={setGenre} />
        </View>

        <View style={styles.buttonArea}>
          <Button
            mode="contained"
            onPress={handleCreate}
            disabled={!canSubmit}
            style={styles.createButton}
            contentStyle={styles.createButtonContent}
            buttonColor={colors.primary}
            textColor={colors.onPrimary}
          >
            Create Project
          </Button>
        </View>
      </View>
    </KeyboardAvoidingView>
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
  form: {
    flex: 1,
    paddingTop: 8,
  },
  input: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  premiseInput: {
    minHeight: 100,
  },
  sectionLabel: {
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 4,
  },
  genreRow: {
    flexShrink: 0,
  },
  buttonArea: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  createButton: {
    borderRadius: 24,
  },
  createButtonContent: {
    paddingVertical: 6,
  },
});
