import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, Alert } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Chip,
  IconButton,
  Snackbar,
  Divider,
  useTheme,
} from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useCharacterStore } from '../../../../src/stores/characterStore';
import { AvatarInitials } from '../../../../src/components/AvatarInitials';
import type { PrimaryCharacter, BackgroundCharacter } from '../../../../src/types/character';

export default function CharacterDetailScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id, charId } = useLocalSearchParams<{ id: string; charId: string }>();
  const character = useCharacterStore((s) => s.getCharacter(charId ?? ''));
  const updateCharacter = useCharacterStore((s) => s.updateCharacter);
  const deleteCharacter = useCharacterStore((s) => s.deleteCharacter);

  const [snackVisible, setSnackVisible] = useState(false);

  // Primary character editable fields
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [ethnicity, setEthnicity] = useState('');
  const [height, setHeight] = useState('');
  const [build, setBuild] = useState('');
  const [hairColor, setHairColor] = useState('');
  const [hairStyle, setHairStyle] = useState('');
  const [eyeColor, setEyeColor] = useState('');
  const [skinTone, setSkinTone] = useState('');
  const [distinguishingFeatures, setDistinguishingFeatures] = useState('');
  const [clothing, setClothing] = useState('');
  const [traits, setTraits] = useState<string[]>([]);
  const [newTrait, setNewTrait] = useState('');
  const [motivations, setMotivations] = useState('');
  const [fears, setFears] = useState('');
  const [voice, setVoice] = useState('');
  const [backstory, setBackstory] = useState('');
  const [relationships, setRelationships] = useState('');
  const [notes, setNotes] = useState('');

  // Background character fields
  const [briefDescription, setBriefDescription] = useState('');

  useEffect(() => {
    if (!character) return;
    setName(character.name);
    if (character.type === 'primary') {
      const p = character as PrimaryCharacter;
      setRole(p.role);
      setAge(p.appearance.age);
      setGender(p.appearance.gender);
      setEthnicity(p.appearance.ethnicity);
      setHeight(p.appearance.height);
      setBuild(p.appearance.build);
      setHairColor(p.appearance.hairColor);
      setHairStyle(p.appearance.hairStyle);
      setEyeColor(p.appearance.eyeColor);
      setSkinTone(p.appearance.skinTone);
      setDistinguishingFeatures(p.appearance.distinguishingFeatures);
      setClothing(p.appearance.clothing);
      setTraits([...p.personality.traits]);
      setMotivations(p.personality.motivations);
      setFears(p.personality.fears);
      setVoice(p.personality.voice);
      setBackstory(p.backstory);
      setRelationships(p.relationships);
      setNotes(p.notes);
    } else {
      setBriefDescription((character as BackgroundCharacter).briefDescription);
    }
  }, [character?.id]);

  if (!character) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text variant="bodyLarge" style={{ textAlign: 'center', marginTop: 100, color: colors.onSurfaceVariant }}>
          Character not found
        </Text>
      </View>
    );
  }

  const handleSave = () => {
    if (character.type === 'primary') {
      updateCharacter(character.id, {
        name: name.trim(),
        role,
        appearance: {
          age, gender, ethnicity, height, build,
          hairColor, hairStyle, eyeColor, skinTone,
          distinguishingFeatures, clothing,
        },
        personality: { traits, motivations, fears, voice },
        backstory,
        relationships,
        notes,
      } as Partial<PrimaryCharacter>);
    } else {
      updateCharacter(character.id, {
        name: name.trim(),
        briefDescription: briefDescription.trim(),
      } as Partial<BackgroundCharacter>);
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  const handleDelete = () => {
    Alert.alert('Delete Character', `Are you sure you want to delete "${character.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteCharacter(character.id);
          router.back();
        },
      },
    ]);
  };

  const addTrait = () => {
    const t = newTrait.trim();
    if (t && !traits.includes(t)) {
      setTraits([...traits, t]);
      setNewTrait('');
    }
  };

  const removeTrait = (trait: string) => {
    setTraits(traits.filter((t) => t !== trait));
  };

  const isPrimary = character.type === 'primary';
  const avatarColor = isPrimary
    ? (character as PrimaryCharacter).portraitPlaceholderColor
    : colors.secondary;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 4 }]}>
        <IconButton icon="arrow-left" onPress={() => router.back()} iconColor={colors.onSurface} />
        <View style={{ flex: 1 }} />
        <Button mode="contained" onPress={handleSave} buttonColor={colors.primary} textColor={colors.onPrimary}>
          Save
        </Button>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Avatar and Name */}
        <View style={styles.avatarSection}>
          <AvatarInitials name={name || 'N'} size={72} color={avatarColor} />
          <Button
            mode="outlined"
            onPress={() => setSnackVisible(true)}
            style={styles.envisionBtn}
            textColor={colors.primary}
          >
            Envision Portrait
          </Button>
        </View>

        {isPrimary ? (
          <>
            {/* Identity */}
            <SectionHeader title="Identity" colors={colors} />
            <TextInput label="Name" value={name} onChangeText={setName} mode="outlined" style={styles.input} outlineColor={colors.outline} activeOutlineColor={colors.primary} />
            <TextInput label="Role" value={role} onChangeText={setRole} mode="outlined" style={styles.input} outlineColor={colors.outline} activeOutlineColor={colors.primary} placeholder="protagonist, antagonist, mentor..." />
            <View style={styles.row}>
              <TextInput label="Age" value={age} onChangeText={setAge} mode="outlined" style={[styles.input, styles.halfInput]} outlineColor={colors.outline} activeOutlineColor={colors.primary} />
              <TextInput label="Gender" value={gender} onChangeText={setGender} mode="outlined" style={[styles.input, styles.halfInput]} outlineColor={colors.outline} activeOutlineColor={colors.primary} />
            </View>

            {/* Appearance */}
            <SectionHeader title="Appearance" colors={colors} />
            <TextInput label="Ethnicity" value={ethnicity} onChangeText={setEthnicity} mode="outlined" style={styles.input} outlineColor={colors.outline} activeOutlineColor={colors.primary} />
            <View style={styles.row}>
              <TextInput label="Height" value={height} onChangeText={setHeight} mode="outlined" style={[styles.input, styles.halfInput]} outlineColor={colors.outline} activeOutlineColor={colors.primary} />
              <TextInput label="Build" value={build} onChangeText={setBuild} mode="outlined" style={[styles.input, styles.halfInput]} outlineColor={colors.outline} activeOutlineColor={colors.primary} />
            </View>
            <View style={styles.row}>
              <TextInput label="Hair Color" value={hairColor} onChangeText={setHairColor} mode="outlined" style={[styles.input, styles.halfInput]} outlineColor={colors.outline} activeOutlineColor={colors.primary} />
              <TextInput label="Hair Style" value={hairStyle} onChangeText={setHairStyle} mode="outlined" style={[styles.input, styles.halfInput]} outlineColor={colors.outline} activeOutlineColor={colors.primary} />
            </View>
            <View style={styles.row}>
              <TextInput label="Eye Color" value={eyeColor} onChangeText={setEyeColor} mode="outlined" style={[styles.input, styles.halfInput]} outlineColor={colors.outline} activeOutlineColor={colors.primary} />
              <TextInput label="Skin Tone" value={skinTone} onChangeText={setSkinTone} mode="outlined" style={[styles.input, styles.halfInput]} outlineColor={colors.outline} activeOutlineColor={colors.primary} />
            </View>
            <TextInput label="Distinguishing Features" value={distinguishingFeatures} onChangeText={setDistinguishingFeatures} mode="outlined" style={styles.input} outlineColor={colors.outline} activeOutlineColor={colors.primary} multiline numberOfLines={3} />
            <TextInput label="Clothing" value={clothing} onChangeText={setClothing} mode="outlined" style={styles.input} outlineColor={colors.outline} activeOutlineColor={colors.primary} multiline numberOfLines={3} />

            {/* Personality */}
            <SectionHeader title="Personality" colors={colors} />
            <Text variant="labelMedium" style={[styles.fieldLabel, { color: colors.onSurfaceVariant }]}>
              Traits
            </Text>
            <View style={styles.traitRow}>
              {traits.map((trait) => (
                <Chip
                  key={trait}
                  onClose={() => removeTrait(trait)}
                  style={[styles.traitChip, { backgroundColor: colors.secondaryContainer }]}
                  closeIconAccessibilityLabel="Remove"
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
            <TextInput label="Motivations" value={motivations} onChangeText={setMotivations} mode="outlined" style={styles.input} outlineColor={colors.outline} activeOutlineColor={colors.primary} multiline numberOfLines={3} />
            <TextInput label="Fears" value={fears} onChangeText={setFears} mode="outlined" style={styles.input} outlineColor={colors.outline} activeOutlineColor={colors.primary} multiline numberOfLines={3} />
            <TextInput label="Voice / Speaking Style" value={voice} onChangeText={setVoice} mode="outlined" style={styles.input} outlineColor={colors.outline} activeOutlineColor={colors.primary} multiline numberOfLines={2} />

            {/* Backstory */}
            <SectionHeader title="Backstory" colors={colors} />
            <TextInput label="Backstory" value={backstory} onChangeText={setBackstory} mode="outlined" style={styles.input} outlineColor={colors.outline} activeOutlineColor={colors.primary} multiline numberOfLines={5} />

            {/* Relationships */}
            <SectionHeader title="Relationships" colors={colors} />
            <TextInput label="Relationships" value={relationships} onChangeText={setRelationships} mode="outlined" style={styles.input} outlineColor={colors.outline} activeOutlineColor={colors.primary} multiline numberOfLines={3} />

            {/* Notes */}
            <SectionHeader title="Notes" colors={colors} />
            <TextInput label="Notes" value={notes} onChangeText={setNotes} mode="outlined" style={styles.input} outlineColor={colors.outline} activeOutlineColor={colors.primary} multiline numberOfLines={3} />
          </>
        ) : (
          <>
            <SectionHeader title="Details" colors={colors} />
            <TextInput label="Name" value={name} onChangeText={setName} mode="outlined" style={styles.input} outlineColor={colors.outline} activeOutlineColor={colors.primary} />
            <TextInput label="Brief Description" value={briefDescription} onChangeText={setBriefDescription} mode="outlined" style={styles.input} outlineColor={colors.outline} activeOutlineColor={colors.primary} multiline numberOfLines={4} />
          </>
        )}

        <Divider style={styles.divider} />
        <Button mode="outlined" textColor={colors.error} onPress={handleDelete} style={styles.deleteBtn}>
          Delete Character
        </Button>
        <View style={{ height: 40 }} />
      </ScrollView>

      <Snackbar visible={snackVisible} onDismiss={() => setSnackVisible(false)} duration={2000}>
        Portrait generation coming in Zone 2
      </Snackbar>
    </View>
  );
}

function SectionHeader({ title, colors }: { title: string; colors: any }) {
  return (
    <Text variant="titleMedium" style={[styles_section.header, { color: colors.primary }]}>
      {title}
    </Text>
  );
}

const styles_section = StyleSheet.create({
  header: {
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 8,
  },
});

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
  scrollContent: {
    paddingBottom: 32,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  envisionBtn: {
    borderRadius: 20,
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
  fieldLabel: {
    marginHorizontal: 16,
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
  divider: {
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 16,
  },
  deleteBtn: {
    marginHorizontal: 16,
    borderColor: '#BA4949',
  },
});
