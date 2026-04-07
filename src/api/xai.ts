import { getApiKey, useSettingsStore } from '../stores/settingsStore';
import type { CharacterExtraction } from '../types/character';

const BASE_URL = 'https://api.x.ai';
const MGMT_BASE_URL = 'https://management-api.x.ai';

async function authHeaders(): Promise<HeadersInit> {
  const key = await getApiKey();
  if (!key) throw new Error('No API key configured');
  return {
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
  };
}

// ── Types ──

export interface ApiKeyInfo {
  api_key_blocked: boolean;
  api_key_disabled: boolean;
  team_blocked: boolean;
  team_id: string;
  redacted_api_key: string;
  name: string;
}

export interface CreditBalance {
  /** USD cents remaining (positive) */
  totalCents: number;
}

export interface LanguageModel {
  id: string;
  prompt_text_token_price: number;
  completion_text_token_price: number;
  input_modalities: string[];
  output_modalities: string[];
  aliases: string[];
  fingerprint: string;
}

// ── Fetchers ──

export async function fetchApiKeyInfo(): Promise<ApiKeyInfo> {
  const res = await fetch(`${BASE_URL}/v1/api-key`, {
    method: 'GET',
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error(`API key check failed (${res.status})`);
  return res.json();
}

export async function fetchCreditBalance(teamId: string, mgmtKey: string): Promise<CreditBalance> {
  const res = await fetch(
    `${MGMT_BASE_URL}/v1/billing/teams/${encodeURIComponent(teamId)}/postpaid/invoice/preview`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${mgmtKey}`,
        'Content-Type': 'application/json',
      },
    },
  );
  if (!res.ok) throw new Error(`Balance check failed (${res.status})`);
  const data = await res.json();
  const credits = parseFloat(data?.coreInvoice?.prepaidCredits?.val ?? '0');
  const used = parseFloat(data?.coreInvoice?.prepaidCreditsUsed?.val ?? '0');
  const totalCents = Math.abs(credits) - Math.abs(used);
  return { totalCents };
}

export async function fetchLanguageModels(): Promise<LanguageModel[]> {
  const res = await fetch(`${BASE_URL}/v1/language-models`, {
    method: 'GET',
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error(`Model list failed (${res.status})`);
  const data = await res.json();
  return data?.models ?? [];
}

// ── Character API Functions ──

/** Generate a 9:16 portrait image, returns base64-encoded image data */
export async function generateCharacterImage(imagePrompt: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/v1/images/generations`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({
      model: 'grok-imagine-image',
      prompt: imagePrompt,
      n: 1,
      response_format: 'b64_json',
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Image generation failed (${res.status}): ${body}`);
  }
  const data = await res.json();
  const b64 = data?.data?.[0]?.b64_json;
  if (!b64) throw new Error('No image data in response');
  return b64;
}

/** Extract a structured character from an interview conversation */
export async function extractCharacterFromConversation(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  genre: string,
): Promise<CharacterExtraction> {
  const { extractInterviewPrompt } = useSettingsStore.getState();
  const systemPrompt = extractInterviewPrompt.replace(/\{\{genre\}\}/g, genre);

  const conversationText = messages
    .map((m) => `${m.role === 'user' ? 'User' : 'Interviewer'}: ${m.content}`)
    .join('\n\n');

  const res = await fetch(`${BASE_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({
      model: useSettingsStore.getState().aiModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: conversationText },
      ],
      temperature: 0.7,
    }),
  });
  if (!res.ok) throw new Error(`Extraction failed (${res.status})`);
  const data = await res.json();
  const raw = data?.choices?.[0]?.message?.content ?? '';
  return parseExtractionJson(raw);
}

/** Extract a structured character from freeform text notes */
export async function extractCharacterFromText(
  text: string,
  genre: string,
): Promise<CharacterExtraction> {
  const { extractStandardPrompt } = useSettingsStore.getState();
  const systemPrompt = extractStandardPrompt.replace(/\{\{genre\}\}/g, genre);

  const res = await fetch(`${BASE_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({
      model: useSettingsStore.getState().aiModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text },
      ],
      temperature: 0.7,
    }),
  });
  if (!res.ok) throw new Error(`Extraction failed (${res.status})`);
  const data = await res.json();
  const raw = data?.choices?.[0]?.message?.content ?? '';
  return parseExtractionJson(raw);
}

/** Generate a completely random character */
export async function generateRandomCharacter(
  genre: string,
): Promise<CharacterExtraction> {
  const { randomCharacterPrompt } = useSettingsStore.getState();
  const systemPrompt = randomCharacterPrompt.replace(/\{\{genre\}\}/g, genre);

  const res = await fetch(`${BASE_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({
      model: useSettingsStore.getState().aiModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Generate a character for a ${genre} story.` },
      ],
      temperature: 1.0,
    }),
  });
  if (!res.ok) throw new Error(`Random character failed (${res.status})`);
  const data = await res.json();
  const raw = data?.choices?.[0]?.message?.content ?? '';
  return parseExtractionJson(raw);
}

/** Refine rough character notes into polished prose */
export async function refineCharacterText(
  text: string,
  genre: string,
): Promise<string> {
  const { refinePrompt, aiModel } = useSettingsStore.getState();
  const systemPrompt = refinePrompt.replace(/\{\{genre\}\}/g, genre);

  const res = await fetch(`${BASE_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({
      model: aiModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text },
      ],
      temperature: 0.7,
    }),
  });
  if (!res.ok) throw new Error(`Refine failed (${res.status})`);
  const data = await res.json();
  return data?.choices?.[0]?.message?.content ?? '';
}

/** Parse and validate the JSON extraction response */
function parseExtractionJson(raw: string): CharacterExtraction {
  // Strip markdown code fences if present
  const cleaned = raw.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
  let parsed: any;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error('Failed to parse character extraction JSON');
  }
  if (
    !parsed?.character_data?.name ||
    !parsed?.narrative_description ||
    !parsed?.image_prompt
  ) {
    throw new Error('Incomplete character extraction — missing required fields');
  }
  return parsed as CharacterExtraction;
}
