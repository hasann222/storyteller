import React, { useState } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Card, Chip, Text, IconButton, Menu, Snackbar, useTheme } from 'react-native-paper';
import type { Character, PrimaryCharacter } from '../types/character';
import { AvatarInitials } from './AvatarInitials';
import { CharacterCopySheet } from './CharacterCopySheet';

interface CharacterCardProps {
  character: Character;
  onPress: (id: string) => void;
}

export function CharacterCard({ character, onPress }: CharacterCardProps) {
  const { colors } = useTheme();
  const [menuVisible, setMenuVisible] = useState(false);
  const [copySheetVisible, setCopySheetVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const menuAnchor = (
    <IconButton
      icon="dots-vertical"
      iconColor={colors.onSurfaceVariant}
      size={20}
      onPress={() => setMenuVisible(true)}
    />
  );

  if (character.type === 'background') {
    return (
      <>
        <Pressable onPress={() => onPress(character.id)}>
          <Card style={styles.bgCard} mode="elevated">
            <Card.Content style={styles.bgContent}>
              <AvatarInitials name={character.name} size={36} color={colors.secondary} />
              <View style={styles.bgText}>
                <Text variant="titleSmall" style={{ color: colors.onSurface }}>
                  {character.name}
                </Text>
                <Text
                  variant="bodySmall"
                  numberOfLines={2}
                  style={{ color: colors.onSurfaceVariant }}
                >
                  {character.briefDescription}
                </Text>
              </View>
              <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={menuAnchor}
              >
                <Menu.Item
                  leadingIcon="content-copy"
                  title="Copy to another project…"
                  onPress={() => {
                    setMenuVisible(false);
                    setCopySheetVisible(true);
                  }}
                />
              </Menu>
            </Card.Content>
          </Card>
        </Pressable>
        <CharacterCopySheet
          visible={copySheetVisible}
          characterId={character.id}
          currentProjectId={character.projectId}
          onDismiss={() => setCopySheetVisible(false)}
          onCopied={(title) => {
            setCopySheetVisible(false);
            setSnackbarMessage(`Copied to "${title}"`);
            setSnackbarVisible(true);
          }}
        />
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={2500}
        >
          {snackbarMessage}
        </Snackbar>
      </>
    );
  }

  const primary = character as PrimaryCharacter;

  return (
    <>
      <Pressable onPress={() => onPress(character.id)}>
        <Card style={styles.primaryCard} mode="elevated">
          <Card.Content style={styles.primaryContent}>
            <AvatarInitials
              name={primary.name}
              size={56}
              color={primary.portraitPlaceholderColor}
            />
            <View style={styles.primaryInfo}>
              <Text variant="titleMedium" style={{ color: colors.onSurface }}>
                {primary.name}
              </Text>
              <Text
                variant="labelSmall"
                style={{
                  color: colors.onSurfaceVariant,
                  textTransform: 'capitalize',
                  marginTop: 2,
                }}
              >
                {primary.role}
              </Text>
              <View style={styles.traitRow}>
                {primary.personality.traits.slice(0, 3).map((trait) => (
                  <Chip
                    key={trait}
                    compact
                    textStyle={styles.traitText}
                    style={[styles.traitChip, { backgroundColor: colors.secondaryContainer }]}
                  >
                    {trait}
                  </Chip>
                ))}
              </View>
            </View>
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={menuAnchor}
            >
              <Menu.Item
                leadingIcon="content-copy"
                title="Copy to another project…"
                onPress={() => {
                  setMenuVisible(false);
                  setCopySheetVisible(true);
                }}
              />
            </Menu>
          </Card.Content>
        </Card>
      </Pressable>
      <CharacterCopySheet
        visible={copySheetVisible}
        characterId={character.id}
        currentProjectId={character.projectId}
        onDismiss={() => setCopySheetVisible(false)}
        onCopied={(title) => {
          setCopySheetVisible(false);
          setSnackbarMessage(`Copied to "${title}"`);
          setSnackbarVisible(true);
        }}
      />
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2500}
      >
        {snackbarMessage}
      </Snackbar>
    </>
  );
}

const styles = StyleSheet.create({
  primaryCard: {
    marginHorizontal: 16,
    marginVertical: 6,
  },
  primaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
  },
  primaryInfo: {
    flex: 1,
  },
  traitRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  traitChip: {
    height: 26,
  },
  traitText: {
    fontSize: 11,
  },
  bgCard: {
    marginHorizontal: 16,
    marginVertical: 4,
  },
  bgContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  bgText: {
    flex: 1,
  },
});
