export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  imageUrl?: string;
}

export interface AgentConfig {
  name: string;
  systemInstruction: string;
  primaryColor: string;
  greeting: string;
}

export interface AnalyticsData {
  date: string;
  conversations: number;
  leads: number;
  csat: number;
}

export interface KnowledgeDocument {
  id: string;
  url: string;
  status: 'indexed' | 'crawling' | 'failed';
  chunks: number;
  lastUpdated: string;
}

export interface Integration {
  id: string;
  name: string;
  category: string;
  connected: boolean;
  icon: string;
  description: string;
}