import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { FAB, useTheme } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useCharacterStore } from '../../../src/stores/characterStore';
import { useProjectStore } from '../../../src/stores/projectStore';
import { CharacterCard } from '../../../src/components/CharacterCard';
import { EmptyState } from '../../../src/components/EmptyState';
import { CreationModeSheet } from '../../../src/components/CreationModeSheet';
import { CharacterLoadingOverlay } from '../../../src/components/CharacterLoadingOverlay';
import { useCharacterCreation } from '../../../src/hooks/useCharacterCreation';
import type { Character } from '../../../src/types/character';

export default function CharactersScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const projectId = id ?? '';
  const project = useProjectStore((s) => s.getProject(projectId));
  const genre = project?.genre ?? 'fantasy';
  const allCharacters = useCharacterStore((s) => s.characters);
  const characters = useMemo(
    () => allCharacters.filter((c) => c.projectId === projectId),
    [allCharacters, projectId]
  );

  const [sheetVisible, setSheetVisible] = useState(false);
  const { createRandom, isCreating } = useCharacterCreation(projectId);

  const handlePress = (charId: string) => {
    router.push(`/project/${projectId}/character/${charId}`);
  };

  const handleModeSelect = (mode: 'standard' | 'interview' | 'random') => {
    setSheetVisible(false);
    if (mode === 'standard') {
      router.push(`/project/${projectId}/character/standard`);
    } else if (mode === 'interview') {
      router.push(`/project/${projectId}/character/interview`);
    } else {
      createRandom(genre);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {characters.length === 0 ? (
        <EmptyState
          title="No characters yet"
          subtitle="Tap the + button to create your first character"
        />
      ) : (
        <FlatList<Character>
          data={characters}
          keyExtractor={(item) => item.id}
          numColumns={2}
          renderItem={({ item }) => (
            <CharacterCard character={item} onPress={handlePress} />
          )}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
        />
      )}

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
          setSheetVisible(true);
        }}
      />

      <CreationModeSheet
        visible={sheetVisible}
        onDismiss={() => setSheetVisible(false)}
        onSelect={handleModeSelect}
      />

      <CharacterLoadingOverlay visible={isCreating} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 100,
    gap: 10,
  },
  row: {
    justifyContent: 'space-between',
  },
  fab: {
    position: 'absolute',
    right: 16,
    borderRadius: 28,
  },
});
