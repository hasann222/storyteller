/** Structured data extracted by Grok from interview or freeform text */
export interface CharacterData {
  name: string;
  age: string;
  sex: string;
  /** Plaintext consolidation of all other character information */
  other: string;
}

/** Full character record stored in the app */
export interface Character {
  id: string;
  projectId: string;
  createdAt: number;

  /** Core identity extracted by Grok */
  name: string;
  age: string;
  sex: string;
  other: string;

  /** Rich narrator-style character entry (3 paragraphs) */
  narrativeDescription: string;
  /** Stored for portrait regeneration */
  imagePrompt: string;
  /** Local file URI to the generated portrait (null if generation failed) */
  imageUri: string | null;
  /** Fallback color for initials avatar */
  portraitPlaceholderColor: string;
}

/** JSON schema returned by the Grok extraction prompt */
export interface CharacterExtraction {
  character_data: CharacterData;
  narrative_description: string;
  image_prompt: string;
}
