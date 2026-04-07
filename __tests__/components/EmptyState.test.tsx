import React from 'react';
import { screen } from '@testing-library/react-native';
import { EmptyState } from '../../src/components/EmptyState';
import { renderWithProviders } from '../helpers/render';

describe('EmptyState', () => {
  it('renders the title', () => {
    renderWithProviders(<EmptyState title="No characters yet" />);
    expect(screen.getByText('No characters yet')).toBeTruthy();
  });

  it('renders the subtitle when provided', () => {
    renderWithProviders(
      <EmptyState title="Nothing here" subtitle="Tap + to get started" />,
    );
    expect(screen.getByText('Tap + to get started')).toBeTruthy();
  });

  it('does not render a subtitle element when subtitle is omitted', () => {
    renderWithProviders(<EmptyState title="Empty" />);
    expect(screen.queryByText(/subtitle/i)).toBeNull();
  });
});
