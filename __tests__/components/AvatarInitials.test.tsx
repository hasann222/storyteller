import React from 'react';
import { screen } from '@testing-library/react-native';
import { AvatarInitials } from '../../src/components/AvatarInitials';
import { renderWithProviders } from '../helpers/render';

describe('AvatarInitials', () => {
  it('renders the first two initials from a full name', () => {
    renderWithProviders(<AvatarInitials name="Aria Stoneheart" color="#C47B2B" />);
    expect(screen.getByText('AS')).toBeTruthy();
  });

  it('renders a single initial when the name has one word', () => {
    renderWithProviders(<AvatarInitials name="Aria" color="#C47B2B" />);
    expect(screen.getByText('A')).toBeTruthy();
  });

  it('uppercases the initials', () => {
    renderWithProviders(<AvatarInitials name="aria stoneheart" color="#C47B2B" />);
    expect(screen.getByText('AS')).toBeTruthy();
  });

  it('limits initials to two characters even with a longer name', () => {
    renderWithProviders(
      <AvatarInitials name="Lady Aria Stoneheart of the North" color="#C47B2B" />,
    );
    expect(screen.getByText('LA')).toBeTruthy();
  });

  it('applies the provided color as backgroundColor', () => {
    const { toJSON } = renderWithProviders(
      <AvatarInitials name="Aria" color="#FF0000" />,
    );
    const json = JSON.stringify(toJSON());
    expect(json).toContain('#FF0000');
  });
});
