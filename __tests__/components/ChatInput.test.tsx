import React from 'react';
import { screen, fireEvent } from '@testing-library/react-native';
import { ChatInput } from '../../src/components/ChatInput';
import { renderWithProviders } from '../helpers/render';

beforeEach(() => jest.clearAllMocks());

describe('ChatInput — idle state', () => {
  it('renders a text input with the placeholder', () => {
    renderWithProviders(<ChatInput onSend={jest.fn()} />);
    expect(screen.getByPlaceholderText('Message...')).toBeTruthy();
  });

  it('send button is disabled when input is empty', () => {
    renderWithProviders(<ChatInput onSend={jest.fn()} />);
    const btn = screen.getByRole('button');
    // IconButton with disabled=true renders as disabled
    expect(btn.props.disabled ?? btn.props.accessibilityState?.disabled).toBeTruthy();
  });

  it('calls onSend with trimmed text when send is pressed', () => {
    const onSend = jest.fn();
    renderWithProviders(<ChatInput onSend={onSend} />);
    const input = screen.getByPlaceholderText('Message...');
    fireEvent.changeText(input, '  Hello!  ');
    const btn = screen.getByRole('button');
    fireEvent.press(btn);
    expect(onSend).toHaveBeenCalledWith('Hello!');
  });

  it('clears the input after sending', () => {
    renderWithProviders(<ChatInput onSend={jest.fn()} />);
    const input = screen.getByPlaceholderText('Message...');
    fireEvent.changeText(input, 'Draft text');
    const btn = screen.getByRole('button');
    fireEvent.press(btn);
    expect(input.props.value).toBe('');
  });

  it('does not call onSend when input is only whitespace', () => {
    const onSend = jest.fn();
    renderWithProviders(<ChatInput onSend={onSend} />);
    const input = screen.getByPlaceholderText('Message...');
    fireEvent.changeText(input, '   ');
    const btn = screen.getByRole('button');
    fireEvent.press(btn);
    expect(onSend).not.toHaveBeenCalled();
  });
});

describe('ChatInput — disabled state', () => {
  it('shows a waiting placeholder while disabled', () => {
    renderWithProviders(<ChatInput onSend={jest.fn()} disabled />);
    expect(screen.getByPlaceholderText('Waiting for response...')).toBeTruthy();
  });
});

describe('ChatInput — edit mode', () => {
  it('shows the editing banner when editValue is provided', () => {
    renderWithProviders(
      <ChatInput onSend={jest.fn()} editValue="old text" onCancelEdit={jest.fn()} />,
    );
    expect(screen.getByText('Editing message')).toBeTruthy();
  });

  it('pre-fills the input with editValue', () => {
    renderWithProviders(
      <ChatInput onSend={jest.fn()} editValue="pre-filled" onCancelEdit={jest.fn()} />,
    );
    expect(screen.getByDisplayValue('pre-filled')).toBeTruthy();
  });

  it('calls onCancelEdit when the cancel button is pressed', () => {
    const onCancelEdit = jest.fn();
    const { UNSAFE_getAllByProps } = renderWithProviders(
      <ChatInput onSend={jest.fn()} editValue="old text" onCancelEdit={onCancelEdit} />,
    );
    // The cancel Pressable has hitSlop={10}; filter to elements that handle the press
    const cancelBtns = UNSAFE_getAllByProps({ hitSlop: 10 }).filter(
      (el) => typeof el.props.onPress === 'function',
    );
    fireEvent.press(cancelBtns[0]);
    expect(onCancelEdit).toHaveBeenCalled();
  });
});
