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

export interface Project {
  id: string;
  title: string;
  premise: string;
  genre: Genre;
  createdAt: number;
  updatedAt: number;
}
