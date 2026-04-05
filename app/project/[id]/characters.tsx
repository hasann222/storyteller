import React, { useMemo } from 'react';
import { SectionList, StyleSheet, View } from 'react-native';
import { Text, FAB, Snackbar, useTheme } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useCharacterStore } from '../../../src/stores/characterStore';
import { CharacterCard } from '../../../src/components/CharacterCard';
import { EmptyState } from '../../../src/components/EmptyState';
import type { Character } from '../../../src/types/character';

export default function CharactersScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const projectId = id ?? '';
  const allCharacters = useCharacterStore((s) => s.characters);
  const primary = useMemo(
    () => allCharacters.filter((c) => c.projectId === projectId && c.type === 'primary'),
    [allCharacters, projectId]
  );
  const background = useMemo(
    () => allCharacters.filter((c) => c.projectId === projectId && c.type === 'background'),
    [allCharacters, projectId]
  );
  const [snackVisible, setSnackVisible] = React.useState(false);

  const sections = [
    ...(primary.length > 0
      ? [{ title: `Primary Characters (${primary.length})`, data: primary as Character[] }]
      : []),
    ...(background.length > 0
      ? [{ title: `Background Characters (${background.length})`, data: background as Character[] }]
      : []),
  ];

  const handlePress = (charId: string) => {
    router.push(`/project/${projectId}/character/${charId}`);
  };

  const isEmpty = primary.length === 0 && background.length === 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {isEmpty ? (
        <EmptyState
          title="No characters yet"
          subtitle="Tap the + button to create your first character"
        />
      ) : (
        <SectionList<Character>
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CharacterCard character={item} onPress={handlePress} />
          )}
          renderSectionHeader={({ section: { title } }) => (
            <Text
              variant="labelLarge"
              style={[styles.sectionHeader, { color: colors.onSurfaceVariant }]}
            >
              {title}
            </Text>
          )}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={false}
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
          router.push(`/project/${projectId}/character/new`);
        }}
      />

      <Snackbar
        visible={snackVisible}
        onDismiss={() => setSnackVisible(false)}
        duration={2000}
      >
        Portrait generation coming in Zone 2
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  listContent: {
    paddingBottom: 100,
  },
  fab: {
    position: 'absolute',
    right: 16,
    borderRadius: 28,
  },
});
