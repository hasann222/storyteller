import { renderHook, act } from '@testing-library/react-native';
import { Directory, File } from 'expo-file-system';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useCharacterCreation } from '../../src/hooks/useCharacterCreation';
import { useCharacterStore } from '../../src/stores/characterStore';
import { setApiKey, deleteApiKey } from '../../src/stores/settingsStore';
import { resetAllStores } from '../helpers/store';
import { makeCharacterExtraction } from '../helpers/factories';

const mockFetch = global.fetch as jest.Mock;
const mockRouter = { push: jest.fn(), replace: jest.fn(), back: jest.fn(), navigate: jest.fn() };

beforeEach(async () => {
  resetAllStores();
  jest.clearAllMocks();
  (useRouter as jest.Mock).mockReturnValue(mockRouter);
  (Directory as unknown as jest.Mock).mockReturnValue({ exists: true, create: jest.fn() });
  (File as unknown as jest.Mock).mockReturnValue({
    uri: 'file:///portraits/char.png',
    write: jest.fn(),
    delete: jest.fn(),
    exists: false,
  });
  await setApiKey('test-key');
  mockFetch.mockResolvedValue({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
  });
});

afterEach(async () => {
  await deleteApiKey();
});

// ── Initial state ─────────────────────────────────────────────────────────────

describe('initial state', () => {
  it('exposes isCreating as false initially', () => {
    const { result } = renderHook(() => useCharacterCreation('proj-1'));
    expect(result.current.isCreating).toBe(false);
  });

  it('exposes all three creation methods', () => {
    const { result } = renderHook(() => useCharacterCreation('proj-1'));
    expect(typeof result.current.createFromText).toBe('function');
    expect(typeof result.current.createFromInterview).toBe('function');
    expect(typeof result.current.createRandom).toBe('function');
  });
});

// ── createFromText ────────────────────────────────────────────────────────────

describe('createFromText', () => {
  const extraction = makeCharacterExtraction();

  it('sets isCreating true during the async call', async () => {
    // Delay the fetch so we can observe the loading state
    let resolveFetch!: (v: unknown) => void;
    mockFetch.mockReturnValueOnce(
      new Promise((resolve) => { resolveFetch = resolve; }),
    );
    // Second fetch (image generation) resolves immediately
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: [{ b64_json: 'imgdata' }] }),
    });

    const { result } = renderHook(() => useCharacterCreation('proj-1'));

    act(() => {
      result.current.createFromText('Some notes', 'fantasy');
    });

    expect(result.current.isCreating).toBe(true);

    await act(async () => {
      resolveFetch({
        ok: true,
        json: () => Promise.resolve({ choices: [{ message: { content: JSON.stringify(extraction) } }] }),
      });
    });
  });

  it('adds a character to the store on success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({ choices: [{ message: { content: JSON.stringify(extraction) } }] }),
    });
    // Image generation fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: [{ b64_json: 'imgdata' }] }),
    });

    const { result } = renderHook(() => useCharacterCreation('proj-1'));

    await act(async () => {
      await result.current.createFromText('Some notes', 'fantasy');
    });

    expect(useCharacterStore.getState().getCharactersByProject('proj-1')).toHaveLength(1);
    const char = useCharacterStore.getState().getCharactersByProject('proj-1')[0];
    expect(char.name).toBe(extraction.character_data.name);
  });

  it('navigates to the character detail screen on success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({ choices: [{ message: { content: JSON.stringify(extraction) } }] }),
    });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: [{ b64_json: 'imgdata' }] }),
    });

    const { result } = renderHook(() => useCharacterCreation('proj-1'));

    await act(async () => {
      await result.current.createFromText('Some notes', 'fantasy');
    });

    // router.replace is called with the character detail path
    expect(mockRouter.replace).toHaveBeenCalledWith(
      expect.stringContaining('/project/proj-1/character/'),
    );
  });

  it('fires a Success haptic on success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({ choices: [{ message: { content: JSON.stringify(extraction) } }] }),
    });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: [{ b64_json: 'imgdata' }] }),
    });

    const { result } = renderHook(() => useCharacterCreation('proj-1'));

    await act(async () => {
      await result.current.createFromText('Some notes', 'fantasy');
    });

    expect(Haptics.notificationAsync).toHaveBeenCalledWith(
      Haptics.NotificationFeedbackType.Success,
    );
  });

  it('fires an Error haptic and clears isCreating when the API call fails', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });

    const { result } = renderHook(() => useCharacterCreation('proj-1'));

    await act(async () => {
      await result.current.createFromText('Some notes', 'fantasy');
    });

    expect(result.current.isCreating).toBe(false);
    expect(Haptics.notificationAsync).toHaveBeenCalledWith(
      Haptics.NotificationFeedbackType.Error,
    );
  });
});

// ── createRandom ──────────────────────────────────────────────────────────────

describe('createRandom', () => {
  it('adds a character to the store', async () => {
    const extraction = makeCharacterExtraction();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({ choices: [{ message: { content: JSON.stringify(extraction) } }] }),
    });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: [{ b64_json: 'imgdata' }] }),
    });

    const { result } = renderHook(() => useCharacterCreation('proj-1'));

    await act(async () => {
      await result.current.createRandom('fantasy');
    });

    expect(useCharacterStore.getState().getCharactersByProject('proj-1')).toHaveLength(1);
  });
});
