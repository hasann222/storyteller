import React from 'react';
import { StyleSheet, View, Pressable, useWindowDimensions } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import type { Character } from '../types/character';
import { AvatarInitials } from './AvatarInitials';

interface CharacterCardProps {
  character: Character;
  onPress: (id: string) => void;
}

export function CharacterCard({ character, onPress }: CharacterCardProps) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  // 2 columns with 12px outer padding and 10px gap → each card = (width - 12*2 - 10) / 2
  const cardWidth = (width - 34) / 2;
  const cardHeight = cardWidth * 1.45;

  return (
    <Pressable
      onPress={() => onPress(character.id)}
      style={({ pressed }) => [
        styles.card,
        {
          width: cardWidth,
          height: cardHeight,
          backgroundColor: character.portraitPlaceholderColor,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      {character.imageUri ? (
        <Image
          source={{ uri: character.imageUri }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View style={styles.placeholderCenter}>
          <AvatarInitials name={character.name} size={56} color={character.portraitPlaceholderColor} />
        </View>
      )}

      {/* Gradient + name at bottom */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)']}
        style={styles.gradient}
      >
        <Text variant="titleSmall" numberOfLines={1} style={styles.nameText}>
          {character.name}
        </Text>
        {(character.age || character.sex) ? (
          <Text variant="labelSmall" numberOfLines={1} style={styles.subtitleText}>
            {[character.age, character.sex].filter(Boolean).join(' · ')}
          </Text>
        ) : null}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  placeholderCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 10,
    paddingBottom: 10,
    paddingTop: 40,
    justifyContent: 'flex-end',
  },
  nameText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  subtitleText: {
    color: 'rgba(255,255,255,0.75)',
    marginTop: 1,
  },
});
