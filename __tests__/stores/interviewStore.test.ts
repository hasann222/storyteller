import { useInterviewStore } from '../../src/stores/interviewStore';
import { resetAllStores } from '../helpers/store';

beforeEach(() => {
  resetAllStores();
  jest.clearAllMocks();
});

// ── Initial state ─────────────────────────────────────────────────────────────

describe('initial state', () => {
  it('has no messages', () => {
    expect(useInterviewStore.getState().messages).toHaveLength(0);
  });

  it('has an empty responseId', () => {
    expect(useInterviewStore.getState().responseId).toBe('');
  });
});

// ── addMessage ────────────────────────────────────────────────────────────────

describe('addMessage', () => {
  it('adds a message and returns its id', () => {
    const id = useInterviewStore.getState().addMessage('user', 'Tell me about yourself.');
    expect(id).toBeTruthy();
    expect(useInterviewStore.getState().messages).toHaveLength(1);
  });

  it('stores the message with correct role, content, and timestamp', () => {
    const id = useInterviewStore.getState().addMessage('assistant', 'Hello!');
    const msg = useInterviewStore.getState().messages.find((m) => m.id === id);
    expect(msg).toMatchObject({ role: 'assistant', content: 'Hello!' });
    expect(typeof msg?.timestamp).toBe('number');
  });
});

// ── updateMessage ─────────────────────────────────────────────────────────────

describe('updateMessage', () => {
  it('updates message fields', () => {
    const id = useInterviewStore.getState().addMessage('assistant', '');
    useInterviewStore.getState().updateMessage(id, { content: 'Updated!', isStreaming: false });
    const msg = useInterviewStore.getState().messages.find((m) => m.id === id);
    expect(msg?.content).toBe('Updated!');
    expect(msg?.isStreaming).toBe(false);
  });

  it('does not affect other messages', () => {
    const id1 = useInterviewStore.getState().addMessage('user', 'original');
    const id2 = useInterviewStore.getState().addMessage('assistant', 'untouched');
    useInterviewStore.getState().updateMessage(id1, { content: 'changed' });
    expect(
      useInterviewStore.getState().messages.find((m) => m.id === id2)?.content,
    ).toBe('untouched');
  });
});

// ── clearInterview ────────────────────────────────────────────────────────────

describe('clearInterview', () => {
  it('removes all messages and resets responseId', () => {
    useInterviewStore.getState().addMessage('user', 'msg 1');
    useInterviewStore.getState().addMessage('assistant', 'reply 1');
    useInterviewStore.setState({ responseId: 'resp-123' });
    useInterviewStore.getState().clearInterview();
    expect(useInterviewStore.getState().messages).toHaveLength(0);
    expect(useInterviewStore.getState().responseId).toBe('');
  });
});

// ── cancelStream ──────────────────────────────────────────────────────────────

describe('cancelStream', () => {
  it('does not throw when no stream is active', () => {
    expect(() => useInterviewStore.getState().cancelStream()).not.toThrow();
  });
});
