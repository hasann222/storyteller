export interface VisualPromptMeta {
  imagePrompt: string;
  videoPrompt: string;
  cameraDirection: string;
  lighting: string;
  mood: string;
}

export interface SceneBlock {
  id: string;
  projectId: string;
  order: number;
  title: string;
  narration: string;
  visualPromptMeta: VisualPromptMeta;
  characterIds: string[];
}

export interface ChatMessage {
  id: string;
  projectId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isThinking?: boolean;
  isStreaming?: boolean;
  thinkingContent?: string;
}
