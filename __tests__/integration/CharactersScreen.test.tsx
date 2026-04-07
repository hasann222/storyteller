/**
 * CharactersScreen.test.tsx — integration tests for
 * app/project/[id]/(tabs)/characters.tsx
 *
 * Injects the project id via the useGlobalSearchParams mock and uses real
 * projectStore + characterStore. Verifies: empty state, character cards,
 * sheet open, mode-based navigation, and character detail navigation.
 */
import React from 'react';
import { screen, fireEvent } from '@testing-library/react-native';
import { useGlobalSearchParams, useRouter } from 'expo-router';
import CharactersScreen from '../../app/project/[id]/(tabs)/characters';
import { useProjectStore } from '../../src/stores/projectStore';
import { useCharacterStore } from '../../src/stores/characterStore';
import { renderWithProviders } from '../helpers/render';
import { resetAllStores } from '../helpers/store';
import { makeProject, makeCharacter } from '../helpers/factories';

const PROJECT_ID = 'proj-integration-1';

beforeEach(() => {
  resetAllStores();
  jest.clearAllMocks();
  // Inject the project id that the screen reads from the URL params
  (useGlobalSearchParams as jest.Mock).mockReturnValue({ id: PROJECT_ID });
  // Seed a project so genre resolves correctly
  useProjectStore.setState({
    projects: [makeProject({ id: PROJECT_ID, genre: 'fantasy' })],
  });
});

function renderChars() {
  return renderWithProviders(<CharactersScreen />);
}

// ── Empty state ───────────────────────────────────────────────────────────────

describe('CharactersScreen — empty state', () => {
  it('shows empty state when there are no characters for the project', () => {
    renderChars();
    expect(screen.getByText('No characters yet')).toBeTruthy();
  });

  it('does not show empty state when characters exist', () => {
    useCharacterStore.setState({
      characters: [makeCharacter({ projectId: PROJECT_ID })],
    });
    renderChars();
    expect(screen.queryByText('No characters yet')).toBeNull();
  });
});

// ── Character list ────────────────────────────────────────────────────────────

describe('CharactersScreen — character list', () => {
  it('renders a character card with the correct name', () => {
    useCharacterStore.setState({
      characters: [makeCharacter({ projectId: PROJECT_ID, name: 'Aria Stoneheart' })],
    });
    renderChars();
    expect(screen.getByText('Aria Stoneheart')).toBeTruthy();
  });

  it('renders only characters belonging to the current project', () => {
    useCharacterStore.setState({
      characters: [
        makeCharacter({ projectId: PROJECT_ID, name: 'In Project' }),
        makeCharacter({ projectId: 'other-project', name: 'Other Project' }),
      ],
    });
    renderChars();
    expect(screen.getByText('In Project')).toBeTruthy();
    expect(screen.queryByText('Other Project')).toBeNull();
  });

  it('character card press navigates to the character detail screen', () => {
    const router = (useRouter as jest.Mock)();
    const charId = 'char-99';
    useCharacterStore.setState({
      characters: [makeCharacter({ id: charId, projectId: PROJECT_ID, name: 'Zephyr' })],
    });
    renderChars();
    fireEvent.press(screen.getByText('Zephyr'));
    expect(router.push).toHaveBeenCalledWith(
      `/project/${PROJECT_ID}/character/${charId}`,
    );
  });
});

// ── FAB and creation sheet ────────────────────────────────────────────────────

describe('CharactersScreen — creation sheet', () => {
  it('FAB tap opens the creation mode sheet', () => {
    renderChars();
    expect(screen.queryByText('Standard')).toBeNull();
    // react-native-paper FAB renders with testID="fab"
    fireEvent.press(screen.getByTestId('fab'));
    // After pressing FAB, setSheetVisible(true) triggers; CreationModeSheet appears
    expect(screen.getByText('Standard')).toBeTruthy();
  });

  it('selecting Standard mode navigates to the standard creation screen', () => {
    const router = (useRouter as jest.Mock)();
    renderChars();
    fireEvent.press(screen.getByTestId('fab'));
    fireEvent.press(screen.getByText('Standard'));
    expect(router.push).toHaveBeenCalledWith(
      `/project/${PROJECT_ID}/character/standard`,
    );
  });

  it('selecting Interview mode navigates to the interview creation screen', () => {
    const router = (useRouter as jest.Mock)();
    renderChars();
    fireEvent.press(screen.getByTestId('fab'));
    fireEvent.press(screen.getByText('Interview'));
    expect(router.push).toHaveBeenCalledWith(
      `/project/${PROJECT_ID}/character/interview`,
    );
  });
});
