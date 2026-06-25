import fs from 'fs';
import path from 'path';
import type { Plugin, ViteDevServer } from 'vite';
import { loadEnv } from 'vite';

const AI_PROVIDERS = [
  { id: 'groq', url: 'https://api.groq.com/openai/v1/chat/completions', model: 'llama-3.3-70b-versatile' },
  { id: 'openai', url: 'https://api.openai.com/v1/chat/completions', model: 'gpt-4o-mini' },
  { id: 'deepseek', url: 'https://api.deepseek.com/chat/completions', model: 'deepseek-chat' },
  { id: 'openrouter', url: 'https://openrouter.ai/api/v1/chat/completions', model: 'openai/gpt-4o-mini' },
];

const ENV_KEY_MAP: Record<string, string> = {
  groq: 'VITE_GROQ_API_KEY',
  openai: 'VITE_OPENAI_API_KEY',
  deepseek: 'VITE_DEEPSEEK_API_KEY',
  openrouter: 'VITE_OPENROUTER_API_KEY',
};

function getKeysFile(root: string) {
  return path.join(root, '.keys.json');
}

function loadKeys(keysFile: string): Record<string, string> {
  try {
    if (fs.existsSync(keysFile)) {
      return JSON.parse(fs.readFileSync(keysFile, 'utf-8'));
    }
  } catch { /* ignore */ }
  return {};
}

function saveKeys(keysFile: string, keys: Record<string, string>) {
  fs.writeFileSync(keysFile, JSON.stringify(keys, null, 2), { mode: 0o600 });
}

function parseBody(req: any): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk: string) => { body += chunk; });
    req.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); }
      catch { reject(new Error('Invalid JSON')); }
    });
  });
}

function json(res: any, data: any, status = 200) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

export default function apiKeysPlugin(): Plugin {
  let keysFile = '';

  return {
    name: 'secure-api-keys',

    configureServer(server: ViteDevServer) {
      keysFile = getKeysFile(server.config.root);

      // Seed from env vars on first run
      if (!fs.existsSync(keysFile)) {
        const envDir = server.config.envDir || server.config.root;
        const env = loadEnv(server.config.mode, envDir, 'VITE_');
        const seeded: Record<string, string> = {};
        for (const [keyName, envName] of Object.entries(ENV_KEY_MAP)) {
          const val = env[envName];
          if (val) seeded[keyName] = val;
        }
        if (Object.keys(seeded).length > 0) {
          saveKeys(keysFile, seeded);
          console.log(`[secure-keys] Migrated ${Object.keys(seeded).length} key(s) from env vars to .keys.json`);
        }
      }

      server.middlewares.use(async (req: any, res: any, next: any) => {
        const url = req.url || '';
        if (!url.startsWith('/api/')) return next();

        try {
          // GET /api/keys/status — which keys are set (no values exposed)
          if (url === '/api/keys/status' && req.method === 'GET') {
            const keys = loadKeys(keysFile);
            const status: Record<string, boolean> = {};
            for (const k of Object.keys(keys)) {
              status[k] = !!keys[k];
            }
            return json(res, { status });
          }

          // POST /api/keys/save — store a key securely
          if (url === '/api/keys/save' && req.method === 'POST') {
            const { name, value } = await parseBody(req);
            if (!name || typeof name !== 'string') return json(res, { error: 'name required' }, 400);
            const keys = loadKeys(keysFile);
            if (value?.trim()) {
              keys[name] = value.trim();
            } else {
              delete keys[name];
            }
            saveKeys(keysFile, keys);
            return json(res, { ok: true, configured: !!keys[name] });
          }

          // POST /api/keys/test — verify a key works
          if (url === '/api/keys/test' && req.method === 'POST') {
            const { name } = await parseBody(req);
            const keys = loadKeys(keysFile);
            const key = keys[name];
            if (!key) return json(res, { ok: false, error: 'Key not saved yet' });

            const provider = AI_PROVIDERS.find(p => p.id === name);
            if (!provider) {
              return json(res, { ok: true, message: 'Key saved securely' });
            }

            const headers: Record<string, string> = {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${key}`,
            };
            if (name === 'openrouter') {
              headers['HTTP-Referer'] = 'https://luxival.com';
              headers['X-Title'] = 'AuraFrame';
            }

            try {
              const r = await fetch(provider.url, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                  model: provider.model,
                  messages: [{ role: 'user', content: 'Say "connected" in one word.' }],
                  max_tokens: 10,
                }),
              });
              if (r.ok) {
                const d = await r.json();
                const reply = (d as any).choices?.[0]?.message?.content?.trim() || '';
                return json(res, { ok: true, message: `Connected! AI replied: "${reply}"` });
              }
              const err = await r.json().catch(() => ({}));
              return json(res, { ok: false, error: (err as any).error?.message || `HTTP ${r.status}` });
            } catch (e: any) {
              return json(res, { ok: false, error: e.message || 'Network error' });
            }
          }

          // DELETE /api/keys/:name
          if (url.startsWith('/api/keys/delete/') && req.method === 'DELETE') {
            const name = url.replace('/api/keys/delete/', '');
            const keys = loadKeys(keysFile);
            delete keys[name];
            saveKeys(keysFile, keys);
            return json(res, { ok: true });
          }

          // POST /api/ai/chat — proxy AI requests (keys never reach browser)
          if (url === '/api/ai/chat' && req.method === 'POST') {
            const { messages, temperature = 0.8, max_tokens = 2000 } = await parseBody(req);
            if (!messages || !Array.isArray(messages)) return json(res, { error: 'messages required' }, 400);

            const keys = loadKeys(keysFile);
            const available = AI_PROVIDERS.filter(p => !!keys[p.id]);
            if (available.length === 0) {
              return json(res, { error: 'No AI provider configured. Add a key in Settings.' });
            }

            const errors: string[] = [];
            for (const provider of available) {
              const key = keys[provider.id];
              const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${key}`,
              };
              if (provider.id === 'openrouter') {
                headers['HTTP-Referer'] = 'https://luxival.com';
                headers['X-Title'] = 'AuraFrame';
              }

              try {
                const r = await fetch(provider.url, {
                  method: 'POST',
                  headers,
                  body: JSON.stringify({ model: provider.model, messages, temperature, max_tokens }),
                });
                const d = await r.json() as any;
                if (r.ok && d.choices?.[0]?.message?.content) {
                  return json(res, { content: d.choices[0].message.content, provider: provider.id });
                }
                errors.push(`${provider.id}: ${d.error?.message || `HTTP ${r.status}`}`);
              } catch (e: any) {
                errors.push(`${provider.id}: ${e.message || 'Network error'}`);
              }
            }

            return json(res, { error: `All providers failed. ${errors.join('; ')}` });
          }

          next();
        } catch (err: any) {
          json(res, { error: err.message || 'Server error' }, 500);
        }
      });
    },
  };
}
