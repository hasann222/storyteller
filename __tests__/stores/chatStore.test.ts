import { useChatStore } from '../../src/stores/chatStore';
import { resetAllStores } from '../helpers/store';

beforeEach(() => {
  resetAllStores();
  jest.clearAllMocks();
});

// ── Initial state ─────────────────────────────────────────────────────────────

describe('initial state', () => {
  it('has no messages', () => {
    expect(useChatStore.getState().messages).toHaveLength(0);
  });

  it('has an empty responseIdMap', () => {
    expect(useChatStore.getState().responseIdMap).toEqual({});
  });
});

// ── addMessage ────────────────────────────────────────────────────────────────

describe('addMessage', () => {
  it('adds a message and returns its id', () => {
    const id = useChatStore.getState().addMessage('proj-1', 'user', 'Hello!');
    expect(id).toBeTruthy();
    expect(useChatStore.getState().messages).toHaveLength(1);
  });

  it('stores the correct fields', () => {
    const id = useChatStore.getState().addMessage('proj-1', 'user', 'Hello?');
    const msg = useChatStore.getState().messages.find((m) => m.id === id);
    expect(msg).toMatchObject({ projectId: 'proj-1', role: 'user', content: 'Hello?' });
    expect(typeof msg?.timestamp).toBe('number');
  });

  it('stores assistant messages', () => {
    const id = useChatStore.getState().addMessage('proj-1', 'assistant', 'Hi there!');
    const msg = useChatStore.getState().messages.find((m) => m.id === id);
    expect(msg?.role).toBe('assistant');
  });
});

// ── updateMessage ─────────────────────────────────────────────────────────────

describe('updateMessage', () => {
  it('updates message content', () => {
    const id = useChatStore.getState().addMessage('proj-1', 'assistant', '...');
    useChatStore.getState().updateMessage(id, { content: 'Full reply' });
    const msg = useChatStore.getState().messages.find((m) => m.id === id);
    expect(msg?.content).toBe('Full reply');
  });

  it('can flip isStreaming flag', () => {
    const id = useChatStore.getState().addMessage('proj-1', 'assistant', '');
    useChatStore.getState().updateMessage(id, { isStreaming: true });
    expect(useChatStore.getState().messages.find((m) => m.id === id)?.isStreaming).toBe(true);
    useChatStore.getState().updateMessage(id, { isStreaming: false });
    expect(useChatStore.getState().messages.find((m) => m.id === id)?.isStreaming).toBe(false);
  });

  it('does not affect other messages', () => {
    const id1 = useChatStore.getState().addMessage('proj-1', 'user', 'original');
    const id2 = useChatStore.getState().addMessage('proj-1', 'assistant', 'original2');
    useChatStore.getState().updateMessage(id1, { content: 'changed' });
    expect(useChatStore.getState().messages.find((m) => m.id === id2)?.content).toBe(
      'original2',
    );
  });
});

// ── getMessagesByProject ──────────────────────────────────────────────────────

describe('getMessagesByProject', () => {
  it('returns only messages for the specified project', () => {
    useChatStore.getState().addMessage('proj-a', 'user', 'A');
    useChatStore.getState().addMessage('proj-b', 'user', 'B');
    expect(useChatStore.getState().getMessagesByProject('proj-a')).toHaveLength(1);
    expect(useChatStore.getState().getMessagesByProject('proj-b')).toHaveLength(1);
  });

  it('returns empty array for a project with no messages', () => {
    expect(useChatStore.getState().getMessagesByProject('unknown')).toHaveLength(0);
  });
});

// ── deleteMessagesByProject ───────────────────────────────────────────────────

describe('deleteMessagesByProject', () => {
  it('removes all messages for a project', () => {
    useChatStore.getState().addMessage('proj-1', 'user', 'msg1');
    useChatStore.getState().addMessage('proj-1', 'assistant', 'msg2');
    useChatStore.getState().addMessage('proj-2', 'user', 'keep');
    useChatStore.getState().deleteMessagesByProject('proj-1');
    expect(useChatStore.getState().getMessagesByProject('proj-1')).toHaveLength(0);
    expect(useChatStore.getState().getMessagesByProject('proj-2')).toHaveLength(1);
  });
});

// ── clearResponseId ───────────────────────────────────────────────────────────

describe('clearResponseId', () => {
  it('removes the entry for the specified project', () => {
    useChatStore.setState({
      responseIdMap: { 'proj-1': 'resp-abc', 'proj-2': 'resp-xyz' },
    });
    useChatStore.getState().clearResponseId('proj-1');
    expect(useChatStore.getState().responseIdMap['proj-1']).toBeUndefined();
    expect(useChatStore.getState().responseIdMap['proj-2']).toBe('resp-xyz');
  });
});

// ── sendUserMessage (no API key — synchronous portion only) ────────────────────

describe('sendUserMessage', () => {
  it('immediately adds the user message to the store', () => {
    // No API key is configured in the test environment, so the async branch
    // takes the mock-reply path. Only the synchronous user-message insertion
    // is tested here.
    useChatStore.getState().sendUserMessage('proj-1', 'What happens next?');
    const msgs = useChatStore.getState().messages;
    expect(msgs).toHaveLength(1);
    expect(msgs[0]).toMatchObject({
      role: 'user',
      content: 'What happens next?',
      projectId: 'proj-1',
    });
  });

  it('stamps the current responseId on the user message', () => {
    useChatStore.setState({ responseIdMap: { 'proj-1': 'prev-resp-123' } });
    useChatStore.getState().sendUserMessage('proj-1', 'Continue the story.');
    const userMsg = useChatStore.getState().messages[0];
    expect(userMsg.previousResponseId).toBe('prev-resp-123');
  });
});
