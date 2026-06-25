import { apiConfig } from './apiConfig';

export interface AIProvider {
  name: string;
  id: string;
  keyName: string;
  keyLabel: string;
  helpUrl: string;
  fallbackOrder: number;
}

export const providers: AIProvider[] = [
  {
    name: 'Groq (Free Tier)',
    id: 'groq',
    keyName: 'groq',
    keyLabel: 'Groq API Key (Free)',
    helpUrl: 'https://console.groq.com/keys',
    fallbackOrder: 1,
  },
  {
    name: 'OpenAI (ChatGPT)',
    id: 'openai',
    keyName: 'openai',
    keyLabel: 'OpenAI API Key',
    helpUrl: 'https://platform.openai.com/api-keys',
    fallbackOrder: 2,
  },
  {
    name: 'DeepSeek',
    id: 'deepseek',
    keyName: 'deepseek',
    keyLabel: 'DeepSeek API Key',
    helpUrl: 'https://platform.deepseek.com/api_keys',
    fallbackOrder: 3,
  },
  {
    name: 'OpenRouter (Multi-Model)',
    id: 'openrouter',
    keyName: 'openrouter',
    keyLabel: 'OpenRouter API Key',
    helpUrl: 'https://openrouter.ai/settings/keys',
    fallbackOrder: 4,
  },
];

export function getAvailableProviders(): AIProvider[] {
  return providers.filter(p => apiConfig.hasKey(p.keyName)).sort((a, b) => a.fallbackOrder - b.fallbackOrder);
}

export function getAllProviders(): AIProvider[] {
  return [...providers].sort((a, b) => a.fallbackOrder - b.fallbackOrder);
}

export function getPrimaryProvider(): AIProvider | null {
  const available = getAvailableProviders();
  return available.length > 0 ? available[0] : null;
}

export function hasAnyProvider(): boolean {
  return providers.some(p => apiConfig.hasKey(p.keyName));
}

export function getProviderStatus(): Array<{ id: string; name: string; configured: boolean; fallbackOrder: number }> {
  return providers.map(p => ({
    id: p.id,
    name: p.name,
    configured: apiConfig.hasKey(p.keyName),
    fallbackOrder: p.fallbackOrder,
  })).sort((a, b) => a.fallbackOrder - b.fallbackOrder);
}
