import { useSceneStore } from '../../src/stores/sceneStore';
import { resetAllStores } from '../helpers/store';
import { makeScene } from '../helpers/factories';

/** Strip id so the data can be passed to addScene */
function strip(scene: ReturnType<typeof makeScene>) {
  const { id: _, ...data } = scene;
  return data;
}

beforeEach(resetAllStores);

// ── Initial state ─────────────────────────────────────────────────────────────

describe('initial state', () => {
  it('has no scenes', () => {
    expect(useSceneStore.getState().scenes).toHaveLength(0);
  });
});

// ── addScene ──────────────────────────────────────────────────────────────────

describe('addScene', () => {
  it('adds a scene and returns its id', () => {
    const id = useSceneStore.getState().addScene(strip(makeScene()));
    expect(id).toBeTruthy();
    expect(useSceneStore.getState().scenes).toHaveLength(1);
  });

  it('stores the scene with the correct fields', () => {
    const scene = makeScene({ projectId: 'proj-1', title: 'Opening Act' });
    const id = useSceneStore.getState().addScene(strip(scene));
    const stored = useSceneStore.getState().scenes.find((s) => s.id === id);
    expect(stored).toMatchObject({ projectId: 'proj-1', title: 'Opening Act' });
  });
});

// ── updateScene ───────────────────────────────────────────────────────────────

describe('updateScene', () => {
  it('updates the specified fields', () => {
    const id = useSceneStore.getState().addScene(strip(makeScene({ title: 'Old' })));
    useSceneStore.getState().updateScene(id, { title: 'New' });
    expect(useSceneStore.getState().scenes.find((s) => s.id === id)?.title).toBe('New');
  });

  it('leaves unspecified fields unchanged', () => {
    const scene = makeScene({ title: 'Keep', narration: 'Also keep' });
    const id = useSceneStore.getState().addScene(strip(scene));
    useSceneStore.getState().updateScene(id, { title: 'Changed' });
    expect(useSceneStore.getState().scenes.find((s) => s.id === id)?.narration).toBe(
      'Also keep',
    );
  });
});

// ── deleteScene ───────────────────────────────────────────────────────────────

describe('deleteScene', () => {
  it('removes the scene', () => {
    const id = useSceneStore.getState().addScene(strip(makeScene()));
    useSceneStore.getState().deleteScene(id);
    expect(useSceneStore.getState().scenes).toHaveLength(0);
  });

  it('only removes the targeted scene', () => {
    const id1 = useSceneStore.getState().addScene(strip(makeScene()));
    const id2 = useSceneStore.getState().addScene(strip(makeScene()));
    useSceneStore.getState().deleteScene(id1);
    expect(useSceneStore.getState().scenes).toHaveLength(1);
    expect(useSceneStore.getState().scenes[0].id).toBe(id2);
  });
});

// ── deleteScenes ──────────────────────────────────────────────────────────────

describe('deleteScenes', () => {
  it('removes all scenes in the provided id array', () => {
    const id1 = useSceneStore.getState().addScene(strip(makeScene()));
    const id2 = useSceneStore.getState().addScene(strip(makeScene()));
    const id3 = useSceneStore.getState().addScene(strip(makeScene()));
    useSceneStore.getState().deleteScenes([id1, id3]);
    expect(useSceneStore.getState().scenes).toHaveLength(1);
    expect(useSceneStore.getState().scenes[0].id).toBe(id2);
  });

  it('is a no-op for an empty id array', () => {
    useSceneStore.getState().addScene(strip(makeScene()));
    useSceneStore.getState().deleteScenes([]);
    expect(useSceneStore.getState().scenes).toHaveLength(1);
  });
});

// ── deleteScenesByProject ─────────────────────────────────────────────────────

describe('deleteScenesByProject', () => {
  it('removes all scenes for a project', () => {
    useSceneStore.getState().addScene(strip(makeScene({ projectId: 'proj-a' })));
    useSceneStore.getState().addScene(strip(makeScene({ projectId: 'proj-a' })));
    useSceneStore.getState().addScene(strip(makeScene({ projectId: 'proj-b' })));
    useSceneStore.getState().deleteScenesByProject('proj-a');
    expect(useSceneStore.getState().getScenesByProject('proj-a')).toHaveLength(0);
    expect(useSceneStore.getState().getScenesByProject('proj-b')).toHaveLength(1);
  });
});

// ── getScenesByProject ────────────────────────────────────────────────────────

describe('getScenesByProject', () => {
  it('returns scenes sorted ascending by order', () => {
    [
      makeScene({ projectId: 'proj-1', order: 2 }),
      makeScene({ projectId: 'proj-1', order: 0 }),
      makeScene({ projectId: 'proj-1', order: 1 }),
    ].forEach((s) => useSceneStore.getState().addScene(strip(s)));

    const sorted = useSceneStore.getState().getScenesByProject('proj-1');
    expect(sorted.map((s) => s.order)).toEqual([0, 1, 2]);
  });

  it('returns empty array for a project with no scenes', () => {
    expect(useSceneStore.getState().getScenesByProject('unknown')).toHaveLength(0);
  });
});

// ── reorderScenes ─────────────────────────────────────────────────────────────

describe('reorderScenes', () => {
  it('moves a scene from fromIndex to toIndex and re-stamps order values', () => {
    const s0 = makeScene({ projectId: 'p', order: 0 });
    const s1 = makeScene({ projectId: 'p', order: 1 });
    const s2 = makeScene({ projectId: 'p', order: 2 });
    const ids = [s0, s1, s2].map((s) => useSceneStore.getState().addScene(strip(s)));

    // Move the first scene to the last position
    useSceneStore.getState().reorderScenes('p', 0, 2);

    const reordered = useSceneStore.getState().getScenesByProject('p');
    expect(reordered[2].id).toBe(ids[0]);
    expect(reordered.map((s) => s.order)).toEqual([0, 1, 2]);
  });

  it('does not affect scenes in other projects', () => {
    const otherScene = makeScene({ projectId: 'other', order: 0 });
    const otherId = useSceneStore.getState().addScene(strip(otherScene));

    const s0 = makeScene({ projectId: 'p', order: 0 });
    const s1 = makeScene({ projectId: 'p', order: 1 });
    [s0, s1].forEach((s) => useSceneStore.getState().addScene(strip(s)));

    useSceneStore.getState().reorderScenes('p', 0, 1);

    const otherScenes = useSceneStore.getState().getScenesByProject('other');
    expect(otherScenes).toHaveLength(1);
    expect(otherScenes[0].id).toBe(otherId);
  });
});
