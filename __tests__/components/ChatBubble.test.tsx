import React from 'react';
import { screen, fireEvent } from '@testing-library/react-native';
import { Pressable } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { ChatBubble } from '../../src/components/ChatBubble';
import { renderWithProviders } from '../helpers/render';
import { makeChatMessage } from '../helpers/factories';

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.runAllTimers();   // flush the 1500ms setCopied(false) timer
  jest.useRealTimers();
});

describe('ChatBubble — user message', () => {
  it('renders the message content', () => {
    const msg = makeChatMessage({ role: 'user', content: 'What happens next?' });
    renderWithProviders(<ChatBubble message={msg} />);
    expect(screen.getByText('What happens next?')).toBeTruthy();
  });

  it('does not show the copy/action row for user messages', () => {
    const msg = makeChatMessage({ role: 'user', content: 'Hello' });
    renderWithProviders(<ChatBubble message={msg} />);
    // Copy icon should NOT be present for user messages
    expect(screen.queryByTestId('copy-action')).toBeNull();
  });

  it('shows the assistant avatar "S" only for assistant messages', () => {
    const userMsg = makeChatMessage({ role: 'user', content: 'A' });
    const { unmount } = renderWithProviders(<ChatBubble message={userMsg} />);
    expect(screen.queryByText('S')).toBeNull();
    unmount();

    const assistantMsg = makeChatMessage({ role: 'assistant', content: 'B' });
    renderWithProviders(<ChatBubble message={assistantMsg} />);
    expect(screen.getByText('S')).toBeTruthy();
  });
});

describe('ChatBubble — assistant message', () => {
  it('renders the message content', () => {
    const msg = makeChatMessage({ role: 'assistant', content: 'Try a cliffhanger.' });
    renderWithProviders(<ChatBubble message={msg} />);
    expect(screen.getByText('Try a cliffhanger.')).toBeTruthy();
  });

  it('shows a formatted timestamp when not streaming', () => {
    // timestamp = 0 → midnight Jan 1, 1970 → "12:00 AM"
    const msg = makeChatMessage({ role: 'assistant', content: 'Hi', timestamp: 0 });
    renderWithProviders(<ChatBubble message={msg} />);
    expect(screen.getByText(/AM|PM/i)).toBeTruthy();
  });

  it('does not show a timestamp while streaming', () => {
    const msg = makeChatMessage({
      role: 'assistant',
      content: 'Partial…',
      isStreaming: true,
      timestamp: 0,
    });
    renderWithProviders(<ChatBubble message={msg} />);
    expect(screen.queryByText(/AM|PM/i)).toBeNull();
  });

  it('calls Clipboard.setStringAsync on copy press', async () => {
    const msg = makeChatMessage({
      role: 'assistant',
      content: 'Copy me',
      isStreaming: false,
    });
    const { UNSAFE_getAllByProps } = renderWithProviders(<ChatBubble message={msg} />);
    // Each Pressable renders as [Pressable, View, View, PressabilityDebugView] — all carry hitSlop:6
    // Filter to the component element with an actual onPress handler
    const pressables = UNSAFE_getAllByProps({ hitSlop: 6 }).filter(
      (el) => typeof el.props.onPress === 'function',
    );
    await fireEvent.press(pressables[0]);
    expect(Clipboard.setStringAsync).toHaveBeenCalledWith('Copy me');
  });

  it('calls onCopyToScript when the copy-to-script button is pressed', () => {
    const onCopyToScript = jest.fn();
    const msg = makeChatMessage({ role: 'assistant', content: 'Script text', isStreaming: false });
    const { UNSAFE_getAllByProps } = renderWithProviders(<ChatBubble message={msg} onCopyToScript={onCopyToScript} />);
    // Each Pressable renders as [Pressable, View, View, PressabilityDebugView] — all with hitSlop:6
    // Filter to component elements that actually handle the press
    const actionBtns = UNSAFE_getAllByProps({ hitSlop: 6 });
    const pressables = actionBtns.filter((el) => typeof el.props.onPress === 'function');
    // pressables[0] = copy, pressables[1] = copy-to-script
    fireEvent.press(pressables[1]);
    expect(onCopyToScript).toHaveBeenCalledWith('Script text');
  });
});
