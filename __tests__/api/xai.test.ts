import { setApiKey, deleteApiKey } from '../../src/stores/settingsStore';
import {
  fetchApiKeyInfo,
  fetchCreditBalance,
  fetchLanguageModels,
  generateCharacterImage,
  extractCharacterFromConversation,
  extractCharacterFromText,
  generateRandomCharacter,
  refineCharacterText,
} from '../../src/api/xai';

const mockFetch = global.fetch as jest.Mock;

/** A valid CharacterExtraction JSON object */
const validExtraction = {
  character_data: { name: 'Aria', age: '28', sex: 'female', other: 'warrior' },
  narrative_description: 'Aria emerged from the highlands.',
  image_prompt: 'Female warrior portrait.',
};

/** Returns a mocked fetch response with a chat-completions-style body */
function chatResponse(content: string) {
  return {
    ok: true as const,
    status: 200,
    json: () => Promise.resolve({ choices: [{ message: { content } }] }),
    text: () => Promise.resolve(''),
  };
}

beforeEach(async () => {
  jest.clearAllMocks();
  await setApiKey('test-api-key-123');
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

// ── fetchApiKeyInfo ───────────────────────────────────────────────────────────

describe('fetchApiKeyInfo', () => {
  it('calls GET /v1/api-key and returns the parsed response', async () => {
    const payload = {
      api_key_blocked: false,
      api_key_disabled: false,
      team_blocked: false,
      team_id: 'team-123',
      redacted_api_key: 'sk-...xyz',
      name: 'My Key',
    };
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve(payload) });

    const result = await fetchApiKeyInfo();
    expect(result).toEqual(payload);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.x.ai/v1/api-key',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('throws descriptively when the response is not ok', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401 });
    await expect(fetchApiKeyInfo()).rejects.toThrow('API key check failed (401)');
  });

  it('throws when no API key is configured', async () => {
    await deleteApiKey();
    await expect(fetchApiKeyInfo()).rejects.toThrow('No API key configured');
  });
});

// ── fetchCreditBalance ────────────────────────────────────────────────────────

describe('fetchCreditBalance', () => {
  it('calculates totalCents from prepaid credits minus used credits', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          coreInvoice: {
            prepaidCredits: { val: '100.00' },
            prepaidCreditsUsed: { val: '30.00' },
          },
        }),
    });

    const result = await fetchCreditBalance('team-123', 'mgmt-key');
    expect(result.totalCents).toBeCloseTo(70, 5);
  });

  it('treats missing values as 0', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ coreInvoice: {} }),
    });
    const result = await fetchCreditBalance('team-123', 'mgmt-key');
    expect(result.totalCents).toBe(0);
  });

  it('throws when response is not ok', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 403 });
    await expect(fetchCreditBalance('team-id', 'mgmt-key')).rejects.toThrow(
      'Balance check failed (403)',
    );
  });
});

// ── fetchLanguageModels ───────────────────────────────────────────────────────

describe('fetchLanguageModels', () => {
  it('returns the models array from the response', async () => {
    const models = [{ id: 'grok-4', aliases: [] }];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ models }),
    });
    expect(await fetchLanguageModels()).toEqual(models);
  });

  it('returns an empty array when the models key is missing', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    });
    expect(await fetchLanguageModels()).toEqual([]);
  });

  it('throws when response is not ok', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
    await expect(fetchLanguageModels()).rejects.toThrow('Model list failed (500)');
  });
});

// ── generateCharacterImage ────────────────────────────────────────────────────

describe('generateCharacterImage', () => {
  it('returns the b64_json string', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: [{ b64_json: 'base64imagedata' }] }),
    });
    expect(await generateCharacterImage('a warrior portrait')).toBe('base64imagedata');
  });

  it('throws when the response is not ok', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: () => Promise.resolve('Internal error'),
    });
    await expect(generateCharacterImage('portrait')).rejects.toThrow(
      'Image generation failed (500)',
    );
  });

  it('throws when the response contains no image data', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: [] }),
    });
    await expect(generateCharacterImage('portrait')).rejects.toThrow('No image data in response');
  });
});

// ── parseExtractionJson (tested via the public API wrappers) ──────────────────

describe('extractCharacterFromConversation', () => {
  it('returns a parsed CharacterExtraction on success', async () => {
    mockFetch.mockResolvedValueOnce(chatResponse(JSON.stringify(validExtraction)));
    const result = await extractCharacterFromConversation(
      [{ role: 'user', content: 'A fierce warrior.' }],
      'fantasy',
    );
    expect(result.character_data.name).toBe('Aria');
    expect(result.narrative_description).toBe('Aria emerged from the highlands.');
  });

  it('strips Markdown code fences before parsing', async () => {
    const wrapped = '```json\n' + JSON.stringify(validExtraction) + '\n```';
    mockFetch.mockResolvedValueOnce(chatResponse(wrapped));
    const result = await extractCharacterFromConversation([], 'sci-fi');
    expect(result.character_data.name).toBe('Aria');
  });

  it('throws on non-JSON response content', async () => {
    mockFetch.mockResolvedValueOnce(chatResponse('not json at all'));
    await expect(
      extractCharacterFromConversation([], 'fantasy'),
    ).rejects.toThrow('Failed to parse character extraction JSON');
  });

  it('throws when required fields are missing', async () => {
    const incomplete = { character_data: {}, narrative_description: 'x', image_prompt: 'y' };
    mockFetch.mockResolvedValueOnce(chatResponse(JSON.stringify(incomplete)));
    await expect(
      extractCharacterFromConversation([], 'fantasy'),
    ).rejects.toThrow('Incomplete character extraction');
  });

  it('throws when the API request fails', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 429 });
    await expect(
      extractCharacterFromConversation([], 'fantasy'),
    ).rejects.toThrow('Extraction failed (429)');
  });
});

describe('extractCharacterFromText', () => {
  it('returns a parsed CharacterExtraction', async () => {
    mockFetch.mockResolvedValueOnce(chatResponse(JSON.stringify(validExtraction)));
    const result = await extractCharacterFromText('Aria is a warrior.', 'fantasy');
    expect(result.character_data.name).toBe('Aria');
    expect(result.image_prompt).toBe('Female warrior portrait.');
  });

  it('throws on API failure', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
    await expect(extractCharacterFromText('text', 'fantasy')).rejects.toThrow(
      'Extraction failed (500)',
    );
  });
});

describe('generateRandomCharacter', () => {
  it('returns a parsed CharacterExtraction', async () => {
    mockFetch.mockResolvedValueOnce(chatResponse(JSON.stringify(validExtraction)));
    const result = await generateRandomCharacter('horror');
    expect(result.narrative_description).toBe('Aria emerged from the highlands.');
    expect(result.image_prompt).toBe('Female warrior portrait.');
  });

  it('throws on API failure', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 403 });
    await expect(generateRandomCharacter('fantasy')).rejects.toThrow(
      'Random character failed (403)',
    );
  });
});

describe('refineCharacterText', () => {
  it('returns the raw content from the AI response', async () => {
    const refined = 'Refined portrait of Aria.';
    mockFetch.mockResolvedValueOnce(chatResponse(refined));
    expect(await refineCharacterText('rough notes', 'fantasy')).toBe(refined);
  });

  it('returns an empty string when the response is empty', async () => {
    mockFetch.mockResolvedValueOnce(chatResponse(''));
    expect(await refineCharacterText('notes', 'fantasy')).toBe('');
  });

  it('throws on API failure', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 429 });
    await expect(refineCharacterText('notes', 'fantasy')).rejects.toThrow('Refine failed (429)');
  });
});
