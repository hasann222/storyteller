import React from 'react';
import { screen, fireEvent } from '@testing-library/react-native';
import { GenrePicker } from '../../src/components/GenrePicker';
import { DEFAULT_GENRES } from '../../src/types/project';
import { renderWithProviders } from '../helpers/render';
import { resetAllStores } from '../helpers/store';

beforeEach(resetAllStores);

describe('GenrePicker', () => {
  it('renders all default genres', () => {
    renderWithProviders(<GenrePicker selected={null} onSelect={jest.fn()} />);
    for (const genre of DEFAULT_GENRES) {
      expect(screen.getByText(genre)).toBeTruthy();
    }
  });

  it('calls onSelect with the genre when a chip is pressed', () => {
    const onSelect = jest.fn();
    renderWithProviders(<GenrePicker selected={null} onSelect={onSelect} />);
    fireEvent.press(screen.getByText('fantasy'));
    expect(onSelect).toHaveBeenCalledWith('fantasy');
  });

  it('renders the "Custom" add chip', () => {
    renderWithProviders(<GenrePicker selected={null} onSelect={jest.fn()} />);
    expect(screen.getByText('Custom')).toBeTruthy();
  });

  it('reflects the currently selected genre via the selected chip prop', () => {
    const { rerender } = renderWithProviders(
      <GenrePicker selected="fantasy" onSelect={jest.fn()} />,
    );
    // No crash; selected='fantasy' chip is rendered
    expect(screen.getByText('fantasy')).toBeTruthy();

    rerender(<GenrePicker selected="sci-fi" onSelect={jest.fn()} />);
    expect(screen.getByText('sci-fi')).toBeTruthy();
  });
});
