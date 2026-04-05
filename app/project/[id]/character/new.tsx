import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  SegmentedButtons,
  Chip,
  IconButton,
  useTheme,
} from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useCharacterStore } from '../../../../src/stores/characterStore';
import type { PrimaryCharacter, BackgroundCharacter } from '../../../../src/types/character';

const PLACEHOLDER_COLORS = ['#C47B2B', '#5B8FBC', '#4A4A5A', '#C7657B', '#7A3B3B', '#8B6F47', '#5A8A5A', '#9B59B6'];

export default function NewCharacterScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const projectId = id ?? '';
  const addCharacter = useCharacterStore((s) => s.addCharacter);

  const [charType, setCharType] = useState<'primary' | 'background'>('primary');

  // Primary fields
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [traits, setTraits] = useState<string[]>([]);
  const [newTrait, setNewTrait] = useState('');
  const [motivations, setMotivations] = useState('');
  const [fears, setFears] = useState('');
  const [voice, setVoice] = useState('');
  const [backstory, setBackstory] = useState('');

  // Background fields
  const [briefDescription, setBriefDescription] = useState('');

  const canSubmit = name.trim().length > 0;

  const handleCreate = () => {
    if (!canSubmit) return;
    const color = PLACEHOLDER_COLORS[Math.floor(Math.random() * PLACEHOLDER_COLORS.length)];

    if (charType === 'primary') {
      addCharacter({
        projectId,
        name: name.trim(),
        type: 'primary',
        role: role.trim() || 'unassigned',
        appearance: {
          age, gender,
          ethnicity: '', height: '', build: '',
          hairColor: '', hairStyle: '', eyeColor: '',
          skinTone: '', distinguishingFeatures: '', clothing: '',
        },
        personality: { traits, motivations, fears, voice },
        backstory,
        relationships: '',
        notes: '',
        portraitPlaceholderColor: color,
      } as Omit<PrimaryCharacter, 'id' | 'createdAt'>);
    } else {
      addCharacter({
        projectId,
        name: name.trim(),
        type: 'background',
        briefDescription: briefDescription.trim(),
      } as Omit<BackgroundCharacter, 'id' | 'createdAt'>);
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  const addTrait = () => {
    const t = newTrait.trim();
    if (t && !traits.includes(t)) {
      setTraits([...traits, t]);
      setNewTrait('');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 4 }]}>
        <IconButton icon="close" onPress={() => router.back()} iconColor={colors.onSurface} />
        <Text variant="titleLarge" style={{ color: colors.onBackground, flex: 1 }}>
          New Character
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.typeToggle}>
          <SegmentedButtons
            value={charType}
            onValueChange={(v) => setCharType(v as 'primary' | 'background')}
            buttons={[
              { value: 'primary', label: 'Primary' },
              { value: 'background', label: 'Background' },
            ]}
          />
        </View>

        <TextInput
          label="Character Name"
          value={name}
          onChangeText={setName}
          mode="outlined"
          style={styles.input}
          outlineColor={colors.outline}
          activeOutlineColor={colors.primary}
          maxLength={60}
        />

        {charType === 'primary' ? (
          <>
            <TextInput
              label="Role"
              value={role}
              onChangeText={setRole}
              mode="outlined"
              style={styles.input}
              outlineColor={colors.outline}
              activeOutlineColor={colors.primary}
              placeholder="protagonist, antagonist, mentor..."
            />
            <View style={styles.row}>
              <TextInput label="Age" value={age} onChangeText={setAge} mode="outlined" style={[styles.input, styles.halfInput]} outlineColor={colors.outline} activeOutlineColor={colors.primary} />
              <TextInput label="Gender" value={gender} onChangeText={setGender} mode="outlined" style={[styles.input, styles.halfInput]} outlineColor={colors.outline} activeOutlineColor={colors.primary} />
            </View>

            <Text variant="labelLarge" style={[styles.sectionLabel, { color: colors.onSurfaceVariant }]}>
              Personality Traits
            </Text>
            <View style={styles.traitRow}>
              {traits.map((trait) => (
                <Chip
                  key={trait}
                  onClose={() => setTraits(traits.filter((t) => t !== trait))}
                  style={[styles.traitChip, { backgroundColor: colors.secondaryContainer }]}
                >
                  {trait}
                </Chip>
              ))}
            </View>
            <View style={styles.addTraitRow}>
              <TextInput
                label="Add trait"
                value={newTrait}
                onChangeText={setNewTrait}
                mode="outlined"
                style={[styles.input, { flex: 1 }]}
                outlineColor={colors.outline}
                activeOutlineColor={colors.primary}
                onSubmitEditing={addTrait}
                dense
              />
              <IconButton icon="plus" onPress={addTrait} iconColor={colors.primary} />
            </View>

            <TextInput label="Motivations" value={motivations} onChangeText={setMotivations} mode="outlined" style={styles.input} outlineColor={colors.outline} activeOutlineColor={colors.primary} multiline numberOfLines={2} />
            <TextInput label="Fears" value={fears} onChangeText={setFears} mode="outlined" style={styles.input} outlineColor={colors.outline} activeOutlineColor={colors.primary} multiline numberOfLines={2} />
            <TextInput label="Voice / Speaking Style" value={voice} onChangeText={setVoice} mode="outlined" style={styles.input} outlineColor={colors.outline} activeOutlineColor={colors.primary} multiline numberOfLines={2} />
            <TextInput label="Backstory" value={backstory} onChangeText={setBackstory} mode="outlined" style={styles.input} outlineColor={colors.outline} activeOutlineColor={colors.primary} multiline numberOfLines={4} />
          </>
        ) : (
          <TextInput
            label="Brief Description"
            value={briefDescription}
            onChangeText={setBriefDescription}
            mode="outlined"
            style={styles.input}
            outlineColor={colors.outline}
            activeOutlineColor={colors.primary}
            multiline
            numberOfLines={4}
            maxLength={300}
          />
        )}

        <View style={styles.buttonArea}>
          <Button
            mode="contained"
            onPress={handleCreate}
            disabled={!canSubmit}
            style={styles.createBtn}
            contentStyle={styles.createBtnContent}
            buttonColor={colors.primary}
            textColor={colors.onPrimary}
          >
            Create Character
          </Button>
        </View>
      </ScrollView>
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
  scrollContent: {
    paddingBottom: 40,
  },
  typeToggle: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  input: {
    marginHorizontal: 16,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
  },
  halfInput: {
    flex: 1,
    marginHorizontal: 0,
  },
  sectionLabel: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 6,
  },
  traitRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  traitChip: {
    borderRadius: 16,
  },
  addTraitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 4,
  },
  buttonArea: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  createBtn: {
    borderRadius: 24,
  },
  createBtnContent: {
    paddingVertical: 6,
  },
});
