import React from 'react';
import { screen } from '@testing-library/react-native';
import { CharacterLoadingOverlay } from '../../src/components/CharacterLoadingOverlay';
import { renderWithProviders } from '../helpers/render';

describe('CharacterLoadingOverlay', () => {
  it('returns null and renders nothing when visible is false', () => {
    renderWithProviders(<CharacterLoadingOverlay visible={false} />);
    // Component returns null early; content is absent (Provider wrapper still renders)
    expect(screen.queryByText('Your character arrives\u2026')).toBeNull();
  });

  it('renders the loading card when visible is true', () => {
    renderWithProviders(<CharacterLoadingOverlay visible />);
    expect(screen.getByText('Your character arrives…')).toBeTruthy();
  });

  it('renders the subtitle description', () => {
    renderWithProviders(<CharacterLoadingOverlay visible />);
    expect(screen.getByText(/Extracting details/i)).toBeTruthy();
  });

  it('renders the ✨ emoji', () => {
    renderWithProviders(<CharacterLoadingOverlay visible />);
    expect(screen.getByText('✨')).toBeTruthy();
  });
});
