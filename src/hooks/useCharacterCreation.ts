import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useCharacterStore } from '../stores/characterStore';
import {
  extractCharacterFromText,
  extractCharacterFromConversation,
  generateRandomCharacter,
  generateCharacterImage,
} from '../api/xai';
import { saveCharacterImage } from '../utils/imageStorage';

const PLACEHOLDER_COLORS = [
  '#C47B2B', '#5B8FBC', '#4A4A5A', '#C7657B',
  '#7A3B3B', '#8B6F47', '#5A8A5A', '#9B59B6',
];

function randomColor(): string {
  return PLACEHOLDER_COLORS[Math.floor(Math.random() * PLACEHOLDER_COLORS.length)];
}

export function useCharacterCreation(projectId: string) {
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();
  const addCharacter = useCharacterStore((s) => s.addCharacter);
  const updateCharacterImage = useCharacterStore((s) => s.updateCharacterImage);

  const saveAndNavigate = useCallback(
    async (extraction: {
      character_data: { name: string; age: string; sex: string; other: string };
      narrative_description: string;
      image_prompt: string;
    }) => {
      const charId = addCharacter({
        projectId,
        name: extraction.character_data.name,
        age: extraction.character_data.age,
        sex: extraction.character_data.sex,
        other: extraction.character_data.other,
        narrativeDescription: extraction.narrative_description,
        imagePrompt: extraction.image_prompt,
        imageUri: null,
        portraitPlaceholderColor: randomColor(),
      });

      // Generate image in background — don't block navigation
      generateCharacterImage(extraction.image_prompt)
        .then((b64) => {
          const uri = saveCharacterImage(charId, b64);
          updateCharacterImage(charId, uri);
        })
        .catch(() => {
          // Image generation failed — character still exists with placeholder
        });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace(`/project/${projectId}/character/${charId}`);
    },
    [projectId, addCharacter, updateCharacterImage, router],
  );

  const createFromText = useCallback(
    async (text: string, genre: string) => {
      setIsCreating(true);
      try {
        const extraction = await extractCharacterFromText(text, genre);
        await saveAndNavigate(extraction);
      } catch {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } finally {
        setIsCreating(false);
      }
    },
    [saveAndNavigate],
  );

  const createFromInterview = useCallback(
    async (
      messages: Array<{ role: 'user' | 'assistant'; content: string }>,
      genre: string,
    ) => {
      setIsCreating(true);
      try {
        const extraction = await extractCharacterFromConversation(messages, genre);
        await saveAndNavigate(extraction);
      } catch {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } finally {
        setIsCreating(false);
      }
    },
    [saveAndNavigate],
  );

  const createRandom = useCallback(
    async (genre: string) => {
      setIsCreating(true);
      try {
        const extraction = await generateRandomCharacter(genre);
        await saveAndNavigate(extraction);
      } catch {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } finally {
        setIsCreating(false);
      }
    },
    [saveAndNavigate],
  );

  return { createFromText, createFromInterview, createRandom, isCreating };
}
