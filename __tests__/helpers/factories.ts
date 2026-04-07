/**
 * Test data factories — generate minimal valid objects for each domain type.
 * All fields can be overridden via the optional `overrides` parameter.
 */
import type { Project } from '../../src/types/project';
import type { Character, CharacterExtraction } from '../../src/types/character';
import type { SceneBlock, ChatMessage } from '../../src/types/scene';
import type { InterviewMessage } from '../../src/stores/interviewStore';
import { DEFAULT_SYSTEM_PROMPT } from '../../src/types/project';

let _counter = 0;

/** Produces a unique, deterministic ID for test data. */
function id(): string {
  return `test-id-${++_counter}`;
}

/** Resets the counter — call in beforeEach if stable IDs matter across tests. */
export function resetIdCounter(): void {
  _counter = 0;
}

// ── Domain factories ──────────────────────────────────────────────────────────

export function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: id(),
    title: 'Test Project',
    premise: 'A test premise for a story.',
    genre: 'fantasy',
    systemPrompt: DEFAULT_SYSTEM_PROMPT,
    createdAt: 1_000_000,
    updatedAt: 1_000_000,
    ...overrides,
  };
}

export function makeCharacter(overrides: Partial<Character> = {}): Character {
  return {
    id: id(),
    projectId: 'project-1',
    createdAt: 1_000_000,
    name: 'Aria Stoneheart',
    age: '28',
    sex: 'female',
    other: 'A seasoned warrior with a mysterious past.',
    narrativeDescription:
      'Aria Stoneheart emerged from the northern highlands, battle-hardened and quietly fierce.',
    imagePrompt:
      'Portrait of a female warrior with braided red hair, steel pauldrons, stormy sky backdrop.',
    imageUri: null,
    portraitPlaceholderColor: '#C47B2B',
    ...overrides,
  };
}

export function makeScene(overrides: Partial<SceneBlock> = {}): SceneBlock {
  return {
    id: id(),
    projectId: 'project-1',
    order: 0,
    title: 'Test Scene',
    narration: 'The scene opens on a windswept battlefield.',
    visualPromptMeta: {
      imagePrompt: '',
      videoPrompt: '',
      cameraDirection: '',
      lighting: '',
      mood: '',
    },
    characterIds: [],
    ...overrides,
  };
}

export function makeChatMessage(overrides: Partial<ChatMessage> = {}): ChatMessage {
  return {
    id: id(),
    projectId: 'project-1',
    role: 'user',
    content: 'What should happen next in the story?',
    timestamp: 1_000_000,
    ...overrides,
  };
}

export function makeInterviewMessage(
  overrides: Partial<InterviewMessage> = {},
): InterviewMessage {
  return {
    id: id(),
    role: 'user',
    content: 'My character is a former sailor turned merchant.',
    timestamp: 1_000_000,
    ...overrides,
  };
}

export function makeCharacterExtraction(
  overrides: Partial<CharacterExtraction> = {},
): CharacterExtraction {
  return {
    character_data: {
      name: 'Aria Stoneheart',
      age: '28',
      sex: 'female',
      other: 'A seasoned warrior with a mysterious past.',
    },
    narrative_description:
      'Aria Stoneheart emerged from the northern highlands, battle-hardened and quietly fierce.',
    image_prompt:
      'Portrait of a female warrior with braided red hair, steel pauldrons, stormy sky backdrop.',
    ...overrides,
  };
}
