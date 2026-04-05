import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Card, Chip, Text, useTheme } from 'react-native-paper';
import type { Character, PrimaryCharacter } from '../types/character';
import { AvatarInitials } from './AvatarInitials';

interface CharacterCardProps {
  character: Character;
  onPress: (id: string) => void;
}

export function CharacterCard({ character, onPress }: CharacterCardProps) {
  const { colors } = useTheme();

  if (character.type === 'background') {
    return (
      <Animated.View entering={FadeInUp.duration(300).delay(50)}>
      <Pressable
        onPress={() => onPress(character.id)}
        style={({ pressed }) => pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }}
      >
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
          </Card.Content>
        </Card>
      </Pressable>
      </Animated.View>
    );
  }

  const primary = character as PrimaryCharacter;

  return (
    <Animated.View entering={FadeInUp.duration(300).delay(50)}>
    <Pressable
      onPress={() => onPress(character.id)}
      style={({ pressed }) => pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }}
    >
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
        </Card.Content>
      </Card>
    </Pressable>
    </Animated.View>
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
