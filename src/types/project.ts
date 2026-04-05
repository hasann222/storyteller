export type Genre = string;

export const DEFAULT_GENRES: Genre[] = [
  'fantasy',
  'sci-fi',
  'noir',
  'romance',
  'horror',
  'drama',
  'adventure',
  'comedy',
];

export const DEFAULT_SYSTEM_PROMPT =
  'You are a creative writing assistant helping craft compelling stories. Provide vivid descriptions, engaging dialogue, and thoughtful narrative suggestions. Stay consistent with established characters, tone, and plot elements.';

export interface Project {
  id: string;
  title: string;
  premise: string;
  genre: Genre;
  systemPrompt: string;
  createdAt: number;
  updatedAt: number;
}
