import { useProjectStore } from '../../src/stores/projectStore';
import { DEFAULT_SYSTEM_PROMPT } from '../../src/types/project';
import { resetAllStores } from '../helpers/store';

beforeEach(resetAllStores);

// ── Initial state ─────────────────────────────────────────────────────────────

describe('initial state', () => {
  it('has no projects', () => {
    expect(useProjectStore.getState().projects).toHaveLength(0);
  });

  it('has no custom genres', () => {
    expect(useProjectStore.getState().customGenres).toHaveLength(0);
  });
});

// ── addProject ────────────────────────────────────────────────────────────────

describe('addProject', () => {
  it('adds a project and returns its id', () => {
    const id = useProjectStore.getState().addProject('My Story', 'A tale', 'fantasy');
    expect(id).toBeTruthy();
    expect(useProjectStore.getState().projects).toHaveLength(1);
  });

  it('stores all required fields', () => {
    const id = useProjectStore.getState().addProject('Epic Novel', 'Dragons', 'fantasy');
    const project = useProjectStore.getState().getProject(id);
    expect(project).toMatchObject({
      id,
      title: 'Epic Novel',
      premise: 'Dragons',
      genre: 'fantasy',
      systemPrompt: DEFAULT_SYSTEM_PROMPT,
    });
    expect(typeof project?.createdAt).toBe('number');
    expect(typeof project?.updatedAt).toBe('number');
  });

  it('prepends new projects so most-recent comes first', () => {
    const id1 = useProjectStore.getState().addProject('First', 'premise', 'fantasy');
    const id2 = useProjectStore.getState().addProject('Second', 'premise', 'sci-fi');
    const [first, second] = useProjectStore.getState().projects;
    expect(first.id).toBe(id2);
    expect(second.id).toBe(id1);
  });
});

// ── updateProject ─────────────────────────────────────────────────────────────

describe('updateProject', () => {
  it('updates specified fields while leaving others unchanged', () => {
    const id = useProjectStore.getState().addProject('Old Title', 'A premise', 'fantasy');
    useProjectStore.getState().updateProject(id, { title: 'New Title' });
    const project = useProjectStore.getState().getProject(id);
    expect(project?.title).toBe('New Title');
    expect(project?.premise).toBe('A premise');
  });

  it('bumps updatedAt', () => {
    const id = useProjectStore.getState().addProject('Title', 'premise', 'fantasy');
    const before = useProjectStore.getState().getProject(id)!.updatedAt;
    useProjectStore.getState().updateProject(id, { title: 'Changed' });
    const after = useProjectStore.getState().getProject(id)!.updatedAt;
    expect(after).toBeGreaterThanOrEqual(before);
  });

  it('is a no-op for an unknown id', () => {
    useProjectStore.getState().addProject('Title', 'premise', 'fantasy');
    useProjectStore.getState().updateProject('nonexistent', { title: 'x' });
    expect(useProjectStore.getState().projects).toHaveLength(1);
  });
});

// ── deleteProject ─────────────────────────────────────────────────────────────

describe('deleteProject', () => {
  it('removes the project', () => {
    const id = useProjectStore.getState().addProject('Title', 'premise', 'fantasy');
    useProjectStore.getState().deleteProject(id);
    expect(useProjectStore.getState().projects).toHaveLength(0);
    expect(useProjectStore.getState().getProject(id)).toBeUndefined();
  });

  it('only removes the targeted project', () => {
    const id1 = useProjectStore.getState().addProject('Keep', 'premise', 'fantasy');
    const id2 = useProjectStore.getState().addProject('Remove', 'premise', 'sci-fi');
    useProjectStore.getState().deleteProject(id2);
    expect(useProjectStore.getState().projects).toHaveLength(1);
    expect(useProjectStore.getState().getProject(id1)).toBeDefined();
  });
});

// ── getProject ────────────────────────────────────────────────────────────────

describe('getProject', () => {
  it('returns undefined for an unknown id', () => {
    expect(useProjectStore.getState().getProject('unknown')).toBeUndefined();
  });

  it('returns the correct project when it exists', () => {
    const id = useProjectStore.getState().addProject('Found', 'premise', 'noir');
    expect(useProjectStore.getState().getProject(id)?.title).toBe('Found');
  });
});

// ── customGenres ──────────────────────────────────────────────────────────────

describe('addCustomGenre', () => {
  it('adds a trimmed, lowercased genre', () => {
    useProjectStore.getState().addCustomGenre('  Western  ');
    expect(useProjectStore.getState().customGenres).toContain('western');
  });

  it('ignores duplicate genres', () => {
    useProjectStore.getState().addCustomGenre('western');
    useProjectStore.getState().addCustomGenre('western');
    expect(useProjectStore.getState().customGenres).toHaveLength(1);
  });

  it('ignores blank input', () => {
    useProjectStore.getState().addCustomGenre('   ');
    expect(useProjectStore.getState().customGenres).toHaveLength(0);
  });
});

describe('deleteCustomGenre', () => {
  it('removes the specified genre', () => {
    useProjectStore.getState().addCustomGenre('western');
    useProjectStore.getState().deleteCustomGenre('western');
    expect(useProjectStore.getState().customGenres).toHaveLength(0);
  });

  it('is a no-op when the genre does not exist', () => {
    useProjectStore.getState().addCustomGenre('western');
    useProjectStore.getState().deleteCustomGenre('fantasy');
    expect(useProjectStore.getState().customGenres).toHaveLength(1);
  });
});
