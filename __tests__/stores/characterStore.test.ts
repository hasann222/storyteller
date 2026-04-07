import { Directory, File } from 'expo-file-system';
import { useCharacterStore } from '../../src/stores/characterStore';
import { resetAllStores } from '../helpers/store';
import { makeCharacter } from '../helpers/factories';

/** Strip the auto-generated fields so we can pass to addCharacter */
function strip(char: ReturnType<typeof makeCharacter>) {
  const { id: _id, createdAt: _ts, ...data } = char;
  return data;
}

beforeEach(() => {
  resetAllStores();
  jest.clearAllMocks();
  (Directory as unknown as jest.Mock).mockReturnValue({ exists: true, create: jest.fn() });
  (File as unknown as jest.Mock).mockReturnValue({
    uri: 'file:///mock/portrait.png',
    exists: true,
    write: jest.fn(),
    delete: jest.fn(),
  });
});

// ── Initial state ─────────────────────────────────────────────────────────────

describe('initial state', () => {
  it('has no characters', () => {
    expect(useCharacterStore.getState().characters).toHaveLength(0);
  });
});

// ── addCharacter ──────────────────────────────────────────────────────────────

describe('addCharacter', () => {
  it('adds a character and returns its id', () => {
    const id = useCharacterStore.getState().addCharacter(strip(makeCharacter()));
    expect(id).toBeTruthy();
    expect(useCharacterStore.getState().characters).toHaveLength(1);
  });

  it('stores the character with generated id and createdAt', () => {
    const char = makeCharacter({ projectId: 'proj-1', name: 'Aria' });
    const id = useCharacterStore.getState().addCharacter(strip(char));
    const stored = useCharacterStore.getState().getCharacter(id);
    expect(stored).toMatchObject({ name: 'Aria', projectId: 'proj-1' });
    expect(typeof stored?.createdAt).toBe('number');
  });
});

// ── updateCharacterImage ──────────────────────────────────────────────────────

describe('updateCharacterImage', () => {
  it('updates imageUri for the given character', () => {
    const id = useCharacterStore.getState().addCharacter(strip(makeCharacter()));
    useCharacterStore.getState().updateCharacterImage(id, 'file:///new.png');
    expect(useCharacterStore.getState().getCharacter(id)?.imageUri).toBe('file:///new.png');
  });

  it('does not affect other characters', () => {
    const id1 = useCharacterStore.getState().addCharacter(strip(makeCharacter()));
    const id2 = useCharacterStore.getState().addCharacter(strip(makeCharacter()));
    useCharacterStore.getState().updateCharacterImage(id1, 'file:///new.png');
    expect(useCharacterStore.getState().getCharacter(id2)?.imageUri).toBeNull();
  });
});

// ── deleteCharacter ───────────────────────────────────────────────────────────

describe('deleteCharacter', () => {
  it('removes the character', () => {
    const id = useCharacterStore.getState().addCharacter(strip(makeCharacter()));
    useCharacterStore.getState().deleteCharacter(id);
    expect(useCharacterStore.getState().characters).toHaveLength(0);
    expect(useCharacterStore.getState().getCharacter(id)).toBeUndefined();
  });

  it('only removes the targeted character', () => {
    const id1 = useCharacterStore.getState().addCharacter(strip(makeCharacter()));
    const id2 = useCharacterStore.getState().addCharacter(strip(makeCharacter()));
    useCharacterStore.getState().deleteCharacter(id1);
    expect(useCharacterStore.getState().characters).toHaveLength(1);
    expect(useCharacterStore.getState().getCharacter(id2)).toBeDefined();
  });
});

// ── deleteCharactersByProject ─────────────────────────────────────────────────

describe('deleteCharactersByProject', () => {
  it('removes all characters belonging to a project', () => {
    useCharacterStore.getState().addCharacter(strip(makeCharacter({ projectId: 'proj-a' })));
    useCharacterStore.getState().addCharacter(strip(makeCharacter({ projectId: 'proj-a' })));
    useCharacterStore.getState().addCharacter(strip(makeCharacter({ projectId: 'proj-b' })));
    useCharacterStore.getState().deleteCharactersByProject('proj-a');
    expect(useCharacterStore.getState().getCharactersByProject('proj-a')).toHaveLength(0);
    expect(useCharacterStore.getState().getCharactersByProject('proj-b')).toHaveLength(1);
  });
});

// ── getCharactersByProject ────────────────────────────────────────────────────

describe('getCharactersByProject', () => {
  it('returns only characters belonging to the project', () => {
    useCharacterStore.getState().addCharacter(strip(makeCharacter({ projectId: 'proj-1' })));
    useCharacterStore.getState().addCharacter(strip(makeCharacter({ projectId: 'proj-2' })));
    expect(useCharacterStore.getState().getCharactersByProject('proj-1')).toHaveLength(1);
    expect(useCharacterStore.getState().getCharactersByProject('proj-2')).toHaveLength(1);
  });

  it('returns empty array when project has no characters', () => {
    expect(useCharacterStore.getState().getCharactersByProject('unknown')).toHaveLength(0);
  });
});

// ── copyCharacterToProject ────────────────────────────────────────────────────

describe('copyCharacterToProject', () => {
  it('copies a character to a target project with a new id', () => {
    const sourceId = useCharacterStore
      .getState()
      .addCharacter(strip(makeCharacter({ projectId: 'proj-source', name: 'Aria' })));
    const newId = useCharacterStore
      .getState()
      .copyCharacterToProject(sourceId, 'proj-target');
    expect(newId).toBeTruthy();
    expect(newId).not.toBe(sourceId);
    const copy = useCharacterStore.getState().getCharacter(newId!);
    expect(copy?.projectId).toBe('proj-target');
    expect(copy?.name).toBe('Aria');
  });

  it('returns undefined for an unknown source character', () => {
    const result = useCharacterStore
      .getState()
      .copyCharacterToProject('unknown-id', 'proj-target');
    expect(result).toBeUndefined();
  });
});
