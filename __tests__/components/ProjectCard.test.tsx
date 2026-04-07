import React from 'react';
import { screen, fireEvent } from '@testing-library/react-native';
import { ProjectCard } from '../../src/components/ProjectCard';
import { renderWithProviders } from '../helpers/render';
import { makeProject } from '../helpers/factories';
import { resetAllStores } from '../helpers/store';

beforeEach(resetAllStores);

describe('ProjectCard', () => {
  it('renders the project title', () => {
    const project = makeProject({ title: 'The Lost Kingdom' });
    renderWithProviders(<ProjectCard project={project} onPress={jest.fn()} />);
    expect(screen.getByText('The Lost Kingdom')).toBeTruthy();
  });

  it('renders the premise', () => {
    const project = makeProject({ premise: 'A dragon-haunted realm.' });
    renderWithProviders(<ProjectCard project={project} onPress={jest.fn()} />);
    expect(screen.getByText('A dragon-haunted realm.')).toBeTruthy();
  });

  it('calls onPress with the project id when the card is pressed', () => {
    const onPress = jest.fn();
    const project = makeProject({ id: 'proj-42' });
    renderWithProviders(<ProjectCard project={project} onPress={onPress} />);
    fireEvent.press(screen.getByText(project.title));
    expect(onPress).toHaveBeenCalledWith('proj-42');
  });

  it('renders an updatedAt date in the footer', () => {
    // updatedAt = 0 → Jan 1, 1970
    const project = makeProject({ updatedAt: 0 });
    renderWithProviders(<ProjectCard project={project} onPress={jest.fn()} />);
    expect(screen.getByText(/Updated /)).toBeTruthy();
  });
});
