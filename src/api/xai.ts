import { getApiKey } from '../stores/settingsStore';

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
