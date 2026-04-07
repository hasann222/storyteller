/**
 * ChatFlow.test.tsx — integration tests for src/components/BrainstormChat.tsx
 *
 * Renders BrainstormChat directly (avoids standing up a full tab navigator)
 * with the real chatStore and sceneStore. Since no API key is configured in
 * tests, sendUserMessage falls into the mock-reply path (800 ms setTimeout).
 * Fake timers are used to advance past that delay.
 */
import React from 'react';
import { screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import { BrainstormChat } from '../../src/components/BrainstormChat';
import { ThinkingBubble } from '../../src/components/ThinkingBubble';
import { useChatStore } from '../../src/stores/chatStore';
import { renderWithProviders } from '../helpers/render';
import { resetAllStores } from '../helpers/store';
import { makeChatMessage } from '../helpers/factories';

const PROJECT_ID = 'proj-chat-1';

beforeEach(() => {
  resetAllStores();
  jest.clearAllMocks();
});

function renderChat(projectId = PROJECT_ID) {
  return renderWithProviders(<BrainstormChat projectId={projectId} />);
}

// ── Empty state ───────────────────────────────────────────────────────────────

describe('ChatFlow — empty state', () => {
  it('shows the empty state when no messages exist for the project', () => {
    renderChat();
    expect(screen.getByText('Start brainstorming')).toBeTruthy();
  });

  it('does not show the empty state when messages exist', () => {
    useChatStore.setState({
      messages: [
        makeChatMessage({ projectId: PROJECT_ID, role: 'user', content: 'Hello!' }),
      ],
    });
    renderChat();
    expect(screen.queryByText('Start brainstorming')).toBeNull();
  });
});

// ── Message rendering ─────────────────────────────────────────────────────────

describe('ChatFlow — message rendering', () => {
  it('renders a seeded user message', () => {
    useChatStore.setState({
      messages: [
        makeChatMessage({ projectId: PROJECT_ID, role: 'user', content: 'What is the conflict?' }),
      ],
    });
    renderChat();
    expect(screen.getByText('What is the conflict?')).toBeTruthy();
  });

  it('renders a seeded assistant message', () => {
    useChatStore.setState({
      messages: [
        makeChatMessage({
          projectId: PROJECT_ID,
          role: 'assistant',
          content: 'The conflict is a war of ancient grudges.',
        }),
      ],
    });
    renderChat();
    expect(screen.getByText('The conflict is a war of ancient grudges.')).toBeTruthy();
  });

  it('renders messages for the correct project only', () => {
    useChatStore.setState({
      messages: [
        makeChatMessage({ projectId: PROJECT_ID, role: 'user', content: 'Mine' }),
        makeChatMessage({ projectId: 'other-project', role: 'user', content: 'Not mine' }),
      ],
    });
    renderChat();
    expect(screen.getByText('Mine')).toBeTruthy();
    expect(screen.queryByText('Not mine')).toBeNull();
  });

  it('renders both user and assistant messages in sequence', () => {
    useChatStore.setState({
      messages: [
        makeChatMessage({
          projectId: PROJECT_ID,
          role: 'user',
          content: 'Tell me about the hero.',
          timestamp: 1_000,
        }),
        makeChatMessage({
          projectId: PROJECT_ID,
          role: 'assistant',
          content: 'The hero is a reluctant wanderer.',
          timestamp: 2_000,
        }),
      ],
    });
    renderChat();
    expect(screen.getByText('Tell me about the hero.')).toBeTruthy();
    expect(screen.getByText('The hero is a reluctant wanderer.')).toBeTruthy();
  });
});

// ── Send message flow ─────────────────────────────────────────────────────────

describe('ChatFlow — send message', () => {
  it('store receives a user message from sendUserMessage directly', () => {
    act(() => {
      useChatStore.getState().sendUserMessage(PROJECT_ID, 'Describe the setting.');
    });

    const users = useChatStore
      .getState()
      .messages.filter((m) => m.role === 'user' && m.projectId === PROJECT_ID);
    expect(users).toHaveLength(1);
    expect(users[0].content).toBe('Describe the setting.');
  });

  it('mock assistant reply arrives after 800 ms (fake timers)', async () => {
    jest.useFakeTimers();

    // sendUserMessage adds user msg sync, then getApiKey().then(...) schedules setTimeout
    act(() => {
      useChatStore.getState().sendUserMessage(PROJECT_ID, 'Give me an idea.');
    });

    // Flush the Promise chain (getApiKey resolves via microtask, then .then registers setTimeout)
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    // Fire the 800 ms mock-reply timeout
    await act(async () => {
      jest.advanceTimersByTime(900);
    });

    const assistants = useChatStore
      .getState()
      .messages.filter((m) => m.role === 'assistant' && m.projectId === PROJECT_ID);
    expect(assistants.length).toBeGreaterThanOrEqual(1);
    expect(assistants[0].content.length).toBeGreaterThan(0);

    jest.useRealTimers();
  });
});

// ── Thinking bubble ───────────────────────────────────────────────────────────

describe('ChatFlow — thinking bubble', () => {
  it('renders ThinkingBubble component for a message with isThinking=true', () => {
    useChatStore.setState({
      messages: [
        makeChatMessage({
          projectId: PROJECT_ID,
          role: 'assistant',
          content: '',
          isThinking: true,
        }),
      ],
    });
    const { UNSAFE_getAllByType } = renderChat();
    // BrainstormChat renders ThinkingBubble (not ChatBubble) when isThinking=true
    expect(UNSAFE_getAllByType(ThinkingBubble).length).toBeGreaterThanOrEqual(1);
  });

  it('does not render ThinkingBubble for regular assistant messages', () => {
    useChatStore.setState({
      messages: [
        makeChatMessage({
          projectId: PROJECT_ID,
          role: 'assistant',
          content: 'Here is my response.',
          isThinking: false,
        }),
      ],
    });
    const { UNSAFE_queryAllByType } = renderChat();
    expect(UNSAFE_queryAllByType(ThinkingBubble)).toHaveLength(0);
  });
});
