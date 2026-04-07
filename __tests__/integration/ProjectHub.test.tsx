/**
 * ProjectHub.test.tsx — integration tests for app/index.tsx
 *
 * Uses the real projectStore (no mock) and the expo-router mock from jest.setup.ts.
 * Verifies: empty state, project list rendering, sort order, and navigation.
 */
import React from 'react';
import { screen, fireEvent } from '@testing-library/react-native';
import { FAB, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import ProjectHub from '../../app/index';
import { useProjectStore } from '../../src/stores/projectStore';
import { renderWithProviders } from '../helpers/render';
import { resetAllStores } from '../helpers/store';
import { makeProject } from '../helpers/factories';

beforeEach(() => {
  resetAllStores();
  jest.clearAllMocks();
});

function renderHub() {
  return renderWithProviders(<ProjectHub />);
}

// ── Empty state ───────────────────────────────────────────────────────────────

describe('ProjectHub — empty state', () => {
  it('shows the empty state title when there are no projects', () => {
    renderHub();
    expect(screen.getByText('No stories yet')).toBeTruthy();
  });

  it('shows 0 projects in the counter', () => {
    renderHub();
    expect(screen.getByText('0 projects')).toBeTruthy();
  });
});

// ── Project list ──────────────────────────────────────────────────────────────

describe('ProjectHub — project list', () => {
  it('renders a project card after seeding the store', () => {
    useProjectStore.setState({
      projects: [makeProject({ title: 'The Obsidian Gate' })],
    });
    renderHub();
    expect(screen.getByText('The Obsidian Gate')).toBeTruthy();
  });

  it('shows singular "1 project" count', () => {
    useProjectStore.setState({ projects: [makeProject()] });
    renderHub();
    expect(screen.getByText('1 project')).toBeTruthy();
  });

  it('shows plural "N projects" count for multiple projects', () => {
    useProjectStore.setState({
      projects: [makeProject(), makeProject(), makeProject()],
    });
    renderHub();
    expect(screen.getByText('3 projects')).toBeTruthy();
  });

  it('renders projects sorted by updatedAt descending (newest first)', () => {
    useProjectStore.setState({
      projects: [
        makeProject({ title: 'Older Story', updatedAt: 1_000 }),
        makeProject({ title: 'Newer Story', updatedAt: 9_000 }),
      ],
    });
    renderHub();
    const titles = screen
      .getAllByText(/Older Story|Newer Story/)
      .map((el) => el.props.children as string);
    expect(titles[0]).toBe('Newer Story');
    expect(titles[1]).toBe('Older Story');
  });
});

// ── Navigation ────────────────────────────────────────────────────────────────

describe('ProjectHub — navigation', () => {
  it('FAB press navigates to /new-project', () => {
    const router = (useRouter as jest.Mock)();
    const { UNSAFE_getByType } = renderHub();
    UNSAFE_getByType(FAB).props.onPress();
    expect(router.push).toHaveBeenCalledWith('/new-project');
  });

  it('settings icon press navigates to /settings', () => {
    const router = (useRouter as jest.Mock)();
    const { UNSAFE_getByType } = renderHub();
    UNSAFE_getByType(IconButton).props.onPress();
    expect(router.push).toHaveBeenCalledWith('/settings');
  });
});
