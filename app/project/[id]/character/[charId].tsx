import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Alert,
  useWindowDimensions,
  Pressable,
} from 'react-native';
import { Text, IconButton, Button, Divider, useTheme, ActivityIndicator } from 'react-native-paper';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useCharacterStore } from '../../../../src/stores/characterStore';
import { AvatarInitials } from '../../../../src/components/AvatarInitials';
import { generateCharacterImage } from '../../../../src/api/xai';
import { saveCharacterImage } from '../../../../src/utils/imageStorage';
import { CharacterCopySheet } from '../../../../src/components/CharacterCopySheet';

export default function CharacterDetailScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { charId } = useLocalSearchParams<{ charId: string }>();
  const character = useCharacterStore((s) => s.getCharacter(charId ?? ''));
  const deleteCharacter = useCharacterStore((s) => s.deleteCharacter);
  const updateCharacterImage = useCharacterStore((s) => s.updateCharacterImage);

  const [isRegenerating, setIsRegenerating] = useState(false);
  const [copySheetVisible, setCopySheetVisible] = useState(false);

  const portraitHeight = width * (16 / 9);

  if (!character) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text
          variant="bodyLarge"
          style={{ textAlign: 'center', marginTop: 100, color: colors.onSurfaceVariant }}
        >
          Character not found
        </Text>
      </View>
    );
  }

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

  const handleRegenerateImage = async () => {
    if (!character.imagePrompt) return;
    setIsRegenerating(true);
    try {
      const b64 = await generateCharacterImage(character.imagePrompt);
      const uri = saveCharacterImage(character.id, b64);
      updateCharacterImage(character.id, uri);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Floating back button */}
      <View style={[styles.floatingHeader, { paddingTop: insets.top + 4 }]}>
        <IconButton
          icon="arrow-left"
          onPress={() => router.back()}
          iconColor="#FFFFFF"
          style={styles.headerButton}
        />
        <View style={{ flex: 1 }} />
        <IconButton
          icon="content-copy"
          onPress={() => setCopySheetVisible(true)}
          iconColor="#FFFFFF"
          style={styles.headerButton}
        />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        bounces={false}
      >
        {/* Portrait area */}
        <View style={[styles.portraitContainer, { width, height: portraitHeight }]}>
          {character.imageUri ? (
            <Image
              source={{ uri: character.imageUri }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              transition={300}
            />
          ) : (
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: character.portraitPlaceholderColor, justifyContent: 'center', alignItems: 'center' },
              ]}
            >
              <AvatarInitials name={character.name} size={120} color={character.portraitPlaceholderColor} />
            </View>
          )}

          {/* Gradient fade at bottom */}
          <LinearGradient
            colors={['transparent', colors.background]}
            style={styles.gradient}
          />

          {/* Name overlay at bottom of portrait */}
          <View style={styles.nameOverlay}>
            <Text variant="headlineMedium" style={styles.nameText}>
              {character.name}
            </Text>
            {(character.age || character.sex) && (
              <Text variant="bodyLarge" style={styles.subtitleText}>
                {[character.age, character.sex].filter(Boolean).join(' · ')}
              </Text>
            )}
          </View>
        </View>

        {/* Narrative description */}
        {character.narrativeDescription ? (
          <View style={styles.section}>
            <Text
              variant="bodyLarge"
              style={{ color: colors.onSurface, lineHeight: 24, fontStyle: 'italic' }}
            >
              {character.narrativeDescription}
            </Text>
          </View>
        ) : null}

        {/* Other details */}
        {character.other ? (
          <View style={styles.section}>
            <Text variant="labelLarge" style={{ color: colors.onSurfaceVariant, marginBottom: 8 }}>
              Details
            </Text>
            <Text variant="bodyMedium" style={{ color: colors.onSurface, lineHeight: 22 }}>
              {character.other}
            </Text>
          </View>
        ) : null}

        {/* Actions */}
        <Divider style={styles.divider} />
        <View style={styles.actions}>
          {character.imagePrompt ? (
            <Button
              mode="outlined"
              onPress={handleRegenerateImage}
              disabled={isRegenerating}
              icon={isRegenerating ? undefined : 'image-refresh-outline'}
              style={styles.actionBtn}
            >
              {isRegenerating ? 'Generating…' : 'Regenerate Portrait'}
            </Button>
          ) : null}
          <Button
            mode="outlined"
            textColor={colors.error}
            onPress={handleDelete}
            icon="delete-outline"
            style={[styles.actionBtn, { borderColor: colors.error }]}
          >
            Delete
          </Button>
        </View>
      </ScrollView>

      <CharacterCopySheet
        visible={copySheetVisible}
        characterId={character.id}
        currentProjectId={character.projectId}
        onDismiss={() => setCopySheetVisible(false)}
        onCopied={() => setCopySheetVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    zIndex: 10,
  },
  headerButton: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 20,
  },
  scroll: {
    flex: 1,
  },
  portraitContainer: {
    position: 'relative',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 160,
  },
  nameOverlay: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 20,
  },
  nameText: {
    color: '#FFFFFF',
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  subtitleText: {
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  divider: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 16,
  },
  actions: {
    paddingHorizontal: 20,
    gap: 10,
  },
  actionBtn: {
    borderRadius: 12,
  },
});
