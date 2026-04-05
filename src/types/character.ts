export interface CharacterAppearance {
  age: string;
  gender: string;
  ethnicity: string;
  height: string;
  build: string;
  hairColor: string;
  hairStyle: string;
  eyeColor: string;
  skinTone: string;
  distinguishingFeatures: string;
  clothing: string;
}

export interface CharacterPersonality {
  traits: string[];
  motivations: string;
  fears: string;
  voice: string;
}

export interface CharacterBase {
  id: string;
  projectId: string;
  name: string;
  createdAt: number;
}

export interface PrimaryCharacter extends CharacterBase {
  type: 'primary';
  role: string;
  appearance: CharacterAppearance;
  personality: CharacterPersonality;
  backstory: string;
  relationships: string;
  notes: string;
  portraitPlaceholderColor: string;
}

export interface BackgroundCharacter extends CharacterBase {
  type: 'background';
  briefDescription: string;
}

export type Character = PrimaryCharacter | BackgroundCharacter;
