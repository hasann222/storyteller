import React from 'react';
import { screen, fireEvent } from '@testing-library/react-native';
import { CreationModeSheet } from '../../src/components/CreationModeSheet';
import { renderWithProviders } from '../helpers/render';

describe('CreationModeSheet', () => {
  it('does not render mode options when not visible', () => {
    renderWithProviders(
      <CreationModeSheet visible={false} onDismiss={jest.fn()} onSelect={jest.fn()} />,
    );
    expect(screen.queryByText('Standard')).toBeNull();
    expect(screen.queryByText('Interview')).toBeNull();
    expect(screen.queryByText('Random')).toBeNull();
  });

  it('renders all three mode options when visible', () => {
    renderWithProviders(
      <CreationModeSheet visible onDismiss={jest.fn()} onSelect={jest.fn()} />,
    );
    expect(screen.getByText('Standard')).toBeTruthy();
    expect(screen.getByText('Interview')).toBeTruthy();
    expect(screen.getByText('Random')).toBeTruthy();
  });

  it('renders the subtitle for each mode', () => {
    renderWithProviders(
      <CreationModeSheet visible onDismiss={jest.fn()} onSelect={jest.fn()} />,
    );
    expect(screen.getByText(/freeform description/i)).toBeTruthy();
    expect(screen.getByText(/guided conversation/i)).toBeTruthy();
    expect(screen.getByText(/completely original/i)).toBeTruthy();
  });

  it('calls onSelect("standard") when Standard is pressed', () => {
    const onSelect = jest.fn();
    renderWithProviders(
      <CreationModeSheet visible onDismiss={jest.fn()} onSelect={onSelect} />,
    );
    fireEvent.press(screen.getByText('Standard'));
    expect(onSelect).toHaveBeenCalledWith('standard');
  });

  it('calls onSelect("interview") when Interview is pressed', () => {
    const onSelect = jest.fn();
    renderWithProviders(
      <CreationModeSheet visible onDismiss={jest.fn()} onSelect={onSelect} />,
    );
    fireEvent.press(screen.getByText('Interview'));
    expect(onSelect).toHaveBeenCalledWith('interview');
  });

  it('calls onSelect("random") when Random is pressed', () => {
    const onSelect = jest.fn();
    renderWithProviders(
      <CreationModeSheet visible onDismiss={jest.fn()} onSelect={onSelect} />,
    );
    fireEvent.press(screen.getByText('Random'));
    expect(onSelect).toHaveBeenCalledWith('random');
  });
});
