/**
 * NewProject.test.tsx — integration tests for app/new-project.tsx
 *
 * Uses the real projectStore. Verifies form validation, store mutation,
 * and navigation calls after submission.
 */
import React from 'react';
import { TextInput as RNTextInput } from 'react-native';
import { screen, fireEvent } from '@testing-library/react-native';
import { IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import NewProject from '../../app/new-project';
import { useProjectStore } from '../../src/stores/projectStore';
import { renderWithProviders } from '../helpers/render';
import { resetAllStores } from '../helpers/store';

beforeEach(() => {
  resetAllStores();
  jest.clearAllMocks();
});

function renderNew() {
  return renderWithProviders(<NewProject />);
}

// ── Form validation ───────────────────────────────────────────────────────────

describe('NewProject — form validation', () => {
  it('Create button is disabled when form is empty', () => {
    renderNew();
    // Paper Button with disabled=true renders as non-pressable
    expect(screen.getByText('Create Project')).toBeTruthy();
    // Confirm the Paper Button prop directly
    // The button text is inside a Paper Button with disabled={true}
    // RNTL doesn't expose Paper props directly; instead we confirm pressing
    // the disabled button has no side effect (no navigation)
    fireEvent.press(screen.getByText('Create Project'));
    expect(useProjectStore.getState().projects).toHaveLength(0);
  });

  it('Create button does nothing when only title is set (no genre)', () => {
    const { UNSAFE_getAllByType } = renderNew();
    const inputs = UNSAFE_getAllByType(RNTextInput);
    fireEvent.changeText(inputs[0], 'My Story');
    fireEvent.press(screen.getByText('Create Project'));
    expect(useProjectStore.getState().projects).toHaveLength(0);
  });

  it('Create button enabled and functional when title + genre are both set', () => {
    const router = (useRouter as jest.Mock)();
    const { UNSAFE_getAllByType } = renderNew();
    const inputs = UNSAFE_getAllByType(RNTextInput);

    fireEvent.changeText(inputs[0], 'The Iron Throne');
    fireEvent.press(screen.getByText('fantasy'));
    fireEvent.press(screen.getByText('Create Project'));

    expect(useProjectStore.getState().projects).toHaveLength(1);
    expect(router.replace).toHaveBeenCalled();
  });
});

// ── Submission ────────────────────────────────────────────────────────────────

describe('NewProject — submission', () => {
  it('adds a project with the correct title to the store', () => {
    const { UNSAFE_getAllByType } = renderNew();
    const inputs = UNSAFE_getAllByType(RNTextInput);

    fireEvent.changeText(inputs[0], 'Realm of Shadows');
    fireEvent.press(screen.getByText('sci-fi'));
    fireEvent.press(screen.getByText('Create Project'));

    const projects = useProjectStore.getState().projects;
    expect(projects).toHaveLength(1);
    expect(projects[0].title).toBe('Realm of Shadows');
    expect(projects[0].genre).toBe('sci-fi');
  });

  it('navigates to the new project page with the correct id after submit', () => {
    const router = (useRouter as jest.Mock)();
    const { UNSAFE_getAllByType } = renderNew();
    const inputs = UNSAFE_getAllByType(RNTextInput);

    fireEvent.changeText(inputs[0], 'Stardust Chronicles');
    fireEvent.press(screen.getByText('fantasy'));
    fireEvent.press(screen.getByText('Create Project'));

    const newId = useProjectStore.getState().projects[0].id;
    expect(router.replace).toHaveBeenCalledWith(`/project/${newId}`);
  });

  it('stores the optional premise when provided', () => {
    const { UNSAFE_getAllByType } = renderNew();
    const inputs = UNSAFE_getAllByType(RNTextInput);

    fireEvent.changeText(inputs[0], 'The Final War');
    fireEvent.changeText(inputs[1], 'A galaxy-spanning conflict.');
    fireEvent.press(screen.getByText('fantasy'));
    fireEvent.press(screen.getByText('Create Project'));

    expect(useProjectStore.getState().projects[0].premise).toBe('A galaxy-spanning conflict.');
  });

  it('back button calls router.back()', () => {
    const router = (useRouter as jest.Mock)();
    const { UNSAFE_getByType } = renderNew();
    UNSAFE_getByType(IconButton).props.onPress();
    expect(router.back).toHaveBeenCalled();
  });
});
