type StatusListener = () => void;

class APIConfig {
  private static instance: APIConfig;
  private keyStatus: Record<string, boolean> = {};
  private ready = false;
  private listeners: StatusListener[] = [];

  private constructor() {
    this.refresh();
  }

  static getInstance(): APIConfig {
    if (!APIConfig.instance) {
      APIConfig.instance = new APIConfig();
    }
    return APIConfig.instance;
  }

  async refresh(): Promise<void> {
    try {
      const res = await fetch('/api/keys/status');
      const data = await res.json();
      this.keyStatus = data.status || {};
      this.ready = true;
      this.listeners.forEach(fn => fn());
    } catch {
      this.ready = true;
    }
  }

  onStatusChange(fn: StatusListener) {
    this.listeners.push(fn);
    return () => { this.listeners = this.listeners.filter(l => l !== fn); };
  }

  isReady(): boolean {
    return this.ready;
  }

  hasKey(name: string): boolean {
    return !!this.keyStatus[name];
  }

  async setKey(name: string, value: string): Promise<{ ok: boolean; error?: string }> {
    try {
      const res = await fetch('/api/keys/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, value }),
      });
      const data = await res.json();
      if (data.ok) {
        this.keyStatus[name] = data.configured;
        this.listeners.forEach(fn => fn());
      }
      return data;
    } catch (e: any) {
      return { ok: false, error: e.message };
    }
  }

  async testKey(name: string): Promise<{ ok: boolean; message?: string; error?: string }> {
    try {
      const res = await fetch('/api/keys/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      return await res.json();
    } catch (e: any) {
      return { ok: false, error: e.message };
    }
  }

  async removeKey(name: string): Promise<void> {
    try {
      await fetch(`/api/keys/delete/${name}`, { method: 'DELETE' });
      delete this.keyStatus[name];
      this.listeners.forEach(fn => fn());
    } catch { /* ignore */ }
  }

  hasAnyAIProvider(): boolean {
    return ['openai', 'deepseek', 'groq', 'openrouter'].some(k => this.hasKey(k));
  }

  isSocialAvailable(platform: string): boolean {
    const checks: Record<string, string[]> = {
      twitter: ['twitter_api_key'],
      linkedin: ['linkedin_access_token'],
      instagram: ['instagram_token'],
      facebook: ['facebook_page_token'],
      pinterest: ['pinterest_access_token'],
      reddit: ['reddit_access_token'],
      telegram: ['telegram_bot_token'],
      whatsapp: ['whatsapp_token'],
    };
    const required = checks[platform];
    if (!required) return false;
    return required.every(k => this.hasKey(k));
  }

  getAllKeys(): Record<string, string> {
    return {};
  }

  getKey(_name: string): string | undefined {
    return undefined;
  }
}

export const apiConfig = APIConfig.getInstance();
