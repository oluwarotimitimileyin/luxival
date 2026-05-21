export interface Message {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  image?: string; // base64 encoded image
}

export interface AppState {
  messages: Message[];
  isTyping: boolean;
  generatedImages: string[];
  videoUrl: string | null;
  error: string | null;
  mediaStatus: string | null;
}

export type Action =
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'SET_TYPING'; payload: boolean }
  | { type: 'SET_IMAGES'; payload: string[] }
  | { type: 'SET_VIDEO'; payload: string }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_MEDIA_STATUS'; payload: string | null };
