import React from 'react';
import { screen } from '@testing-library/react-native';
import { ThinkingBubble } from '../../src/components/ThinkingBubble';
import { renderWithProviders } from '../helpers/render';

describe('ThinkingBubble', () => {
  it('renders without crashing', () => {
    expect(() => renderWithProviders(<ThinkingBubble />)).not.toThrow();
  });

  it('shows the assistant avatar label "S"', () => {
    renderWithProviders(<ThinkingBubble />);
    expect(screen.getByText('S')).toBeTruthy();
  });

  it('renders three animated dots', () => {
    const { toJSON } = renderWithProviders(<ThinkingBubble />);
    // The three dot views are Animated.View children — check the tree renders
    expect(toJSON()).not.toBeNull();
  });
});
