import React from 'react';
import { screen, fireEvent } from '@testing-library/react-native';
import { CharacterCard } from '../../src/components/CharacterCard';
import { renderWithProviders } from '../helpers/render';
import { makeCharacter } from '../helpers/factories';

describe('CharacterCard', () => {
  it('renders the character name', () => {
    const character = makeCharacter({ name: 'Aria Stoneheart' });
    renderWithProviders(<CharacterCard character={character} onPress={jest.fn()} />);
    expect(screen.getByText('Aria Stoneheart')).toBeTruthy();
  });

  it('shows an AvatarInitials placeholder when imageUri is null', () => {
    const character = makeCharacter({ name: 'Aria Stoneheart', imageUri: null });
    renderWithProviders(<CharacterCard character={character} onPress={jest.fn()} />);
    // AvatarInitials renders "AS" initials
    expect(screen.getByText('AS')).toBeTruthy();
  });

  it('does not show AvatarInitials when imageUri is set', () => {
    const character = makeCharacter({
      name: 'Aria Stoneheart',
      imageUri: 'file:///portrait.png',
    });
    renderWithProviders(<CharacterCard character={character} onPress={jest.fn()} />);
    // Image is rendered instead of initials — "AS" initials should not appear
    expect(screen.queryByText('AS')).toBeNull();
  });

  it('calls onPress with the character id when pressed', () => {
    const onPress = jest.fn();
    const character = makeCharacter({ id: 'char-123' });
    renderWithProviders(<CharacterCard character={character} onPress={onPress} />);
    // Wrap entire card is a Pressable
    fireEvent.press(screen.getByText(character.name));
    expect(onPress).toHaveBeenCalledWith('char-123');
  });
});
