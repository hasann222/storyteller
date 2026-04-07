/**
 * StandardCreation.test.tsx — integration tests for
 * app/project/[id]/character/standard.tsx
 *
 * Mocks the xAI API module at the module boundary and uses real
 * characterStore + projectStore. Verifies: finish/refine button gating,
 * successful character creation flow, error handling.
 */
import React from 'react';
import { TextInput as RNTextInput } from 'react-native';
import { screen, fireEvent, waitFor } from '@testing-library/react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import StandardCreationScreen from '../../app/project/[id]/character/standard';
import { useProjectStore } from '../../src/stores/projectStore';
import { useCharacterStore } from '../../src/stores/characterStore';
import { renderWithProviders } from '../helpers/render';
import { resetAllStores } from '../helpers/store';
import { makeProject } from '../helpers/factories';

// ── Mock xAI API at the module boundary ───────────────────────────────────────
jest.mock('../../src/api/xai', () => ({
  ...jest.requireActual('../../src/api/xai'),
  extractCharacterFromText: jest.fn(),
  refineCharacterText: jest.fn(),
  generateCharacterImage: jest.fn(() => Promise.resolve('')),
}));

import {
  extractCharacterFromText,
  refineCharacterText,
} from '../../src/api/xai';

// ── Constants ─────────────────────────────────────────────────────────────────

const PROJECT_ID = 'proj-standard-1';

const EXTRACTION_RESULT = {
  character_data: {
    name: 'Kira Dawnblade',
    age: '25',
    sex: 'female',
    other: 'A swift elven archer.',
  },
  narrative_description: 'Kira emerged from the Silverwood with an arrow already nocked.',
  image_prompt: 'Elven archer, silver bow, forest backdrop, dawn light.',
};

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  resetAllStores();
  jest.clearAllMocks();
  // Inject the project id the screen reads from URL params
  (useLocalSearchParams as jest.Mock).mockReturnValue({ id: PROJECT_ID });
  // Seed a project so genre is available
  useProjectStore.setState({
    projects: [makeProject({ id: PROJECT_ID, genre: 'fantasy' })],
  });
});

function renderStandard() {
  return renderWithProviders(<StandardCreationScreen />);
}

// ── Button gating ─────────────────────────────────────────────────────────────

describe('StandardCreation — button gating', () => {
  it('Finish button does nothing when text is empty', () => {
    const router = (useRouter as jest.Mock)();
    renderStandard();
    fireEvent.press(screen.getByText('Finish'));
    expect(extractCharacterFromText).not.toHaveBeenCalled();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it('Finish button does nothing when text is shorter than 20 chars', () => {
    const router = (useRouter as jest.Mock)();
    const { UNSAFE_getAllByType } = renderStandard();
    const inputs = UNSAFE_getAllByType(RNTextInput);
    fireEvent.changeText(inputs[0], 'Too short');
    fireEvent.press(screen.getByText('Finish'));
    expect(extractCharacterFromText).not.toHaveBeenCalled();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it('Refine button does nothing when text is shorter than 20 chars', () => {
    const { UNSAFE_getAllByType } = renderStandard();
    const inputs = UNSAFE_getAllByType(RNTextInput);
    fireEvent.changeText(inputs[0], 'Short');
    fireEvent.press(screen.getByText('Refine'));
    expect(refineCharacterText).not.toHaveBeenCalled();
  });
});

// ── Successful finish flow ────────────────────────────────────────────────────

describe('StandardCreation — successful finish', () => {
  it('calls extractCharacterFromText with the text and genre', async () => {
    (extractCharacterFromText as jest.Mock).mockResolvedValueOnce(EXTRACTION_RESULT);
    const { UNSAFE_getAllByType } = renderStandard();
    const inputs = UNSAFE_getAllByType(RNTextInput);

    fireEvent.changeText(inputs[0], 'A grizzled dwarven blacksmith with a broken past.');
    fireEvent.press(screen.getByText('Finish'));

    await waitFor(() => {
      expect(extractCharacterFromText).toHaveBeenCalledWith(
        'A grizzled dwarven blacksmith with a broken past.',
        'fantasy',
      );
    });
  });

  it('adds the character to characterStore after successful extraction', async () => {
    (extractCharacterFromText as jest.Mock).mockResolvedValueOnce(EXTRACTION_RESULT);
    const { UNSAFE_getAllByType } = renderStandard();
    const inputs = UNSAFE_getAllByType(RNTextInput);

    fireEvent.changeText(inputs[0], 'A swift and silent forest ranger with keen eyes.');
    fireEvent.press(screen.getByText('Finish'));

    await waitFor(() => {
      const chars = useCharacterStore.getState().characters;
      expect(chars).toHaveLength(1);
      expect(chars[0].name).toBe('Kira Dawnblade');
      expect(chars[0].projectId).toBe(PROJECT_ID);
    });
  });

  it('navigates to the character detail page after creation', async () => {
    const router = (useRouter as jest.Mock)();
    (extractCharacterFromText as jest.Mock).mockResolvedValueOnce(EXTRACTION_RESULT);
    const { UNSAFE_getAllByType } = renderStandard();
    const inputs = UNSAFE_getAllByType(RNTextInput);

    fireEvent.changeText(inputs[0], 'A swift and silent forest ranger with keen eyes.');
    fireEvent.press(screen.getByText('Finish'));

    await waitFor(() => {
      expect(router.replace).toHaveBeenCalled();
      const [[path]] = (router.replace as jest.Mock).mock.calls;
      expect(path).toMatch(new RegExp(`/project/${PROJECT_ID}/character/.+`));
    });
  });
});

// ── Refine flow ───────────────────────────────────────────────────────────────

describe('StandardCreation — refine flow', () => {
  it('updates the textarea with refined text on success', async () => {
    (refineCharacterText as jest.Mock).mockResolvedValueOnce(
      'Your character is a wise and weathered traveler with silver-streaked hair.',
    );
    const { UNSAFE_getAllByType } = renderStandard();
    const inputs = UNSAFE_getAllByType(RNTextInput);

    fireEvent.changeText(inputs[0], 'An old man who has seen much of the world.');
    fireEvent.press(screen.getByText('Refine'));

    await waitFor(() => {
      expect(screen.getByDisplayValue(
        'Your character is a wise and weathered traveler with silver-streaked hair.',
      )).toBeTruthy();
    });
  });
});

// ── Error path ────────────────────────────────────────────────────────────────

describe('StandardCreation — error path', () => {
  it('does not navigate when extraction fails', async () => {
    const router = (useRouter as jest.Mock)();
    (extractCharacterFromText as jest.Mock).mockRejectedValueOnce(
      new Error('No API key configured'),
    );
    const { UNSAFE_getAllByType } = renderStandard();
    const inputs = UNSAFE_getAllByType(RNTextInput);

    fireEvent.changeText(inputs[0], 'A mysterious sorcerer with violet eyes and a crooked staff.');
    fireEvent.press(screen.getByText('Finish'));

    await waitFor(() => {
      expect(useCharacterStore.getState().characters).toHaveLength(0);
    });
    expect(router.replace).not.toHaveBeenCalled();
  });
});
