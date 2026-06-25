#!/usr/bin/env node
// translate-i18n.mjs
// Reads the English reference keys from i18n.js and uses OpenAI to generate
// accurate translations for ru, no, da, ja, zh.
// Outputs JS object blocks ready to paste into i18n.js.

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const I18N_PATH = resolve(__dirname, '..', 'js', 'i18n.js');
const OUTPUT_PATH = resolve(__dirname, '..', 'js', 'i18n-translations.json');

// Load .env.local manually (no dotenv dependency)
function loadEnv() {
  const envPath = resolve(__dirname, '..', '.env.local');
  try {
    const content = readFileSync(envPath, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      let value = trimmed.slice(eqIdx + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  } catch (e) {
    console.error('Could not load .env.local:', e.message);
  }
}

loadEnv();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MOONSHOT_API_KEY = process.env.MOONSHOT_API_KEY;

// Use Groq with small batches to stay within rate limits
function getApiConfig() {
  if (GROQ_API_KEY) {
    return {
      endpoint: 'https://api.groq.com/openai/v1/chat/completions',
      key: GROQ_API_KEY,
      model: 'llama-3.1-8b-instant',
    };
  }
  console.error('No working API key found.');
  process.exit(1);
}

const API = getApiConfig();

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// --- Extract all keys from the Finnish (fi) bundle (the full reference set) ---
function extractReferenceKeys(content) {
  const fiMatch = content.match(/fi:\s*\{([\s\S]*?)\},/);
  if (!fiMatch) {
    console.error('Could not find Finnish (fi) translation block in i18n.js');
    process.exit(1);
  }
  const fiBlock = fiMatch[1];
  const keys = [];
  const keyRegex = /"([^"]+)":\s*"([^"]*)"/g;
  let match;
  while ((match = keyRegex.exec(fiBlock)) !== null) {
    keys.push({ key: match[1], value: match[2] });
  }
  return keys;
}

const source = readFileSync(I18N_PATH, 'utf-8');
const referenceKeys = extractReferenceKeys(source);

// Add chat widget keys (not in page translations yet)
const chatKeys = [
  { key: 'chat.toggleLabel', value: 'Talk to Luxival' },
  { key: 'chat.headerTitle', value: 'Luxival assistant' },
  { key: 'chat.headerDesc', value: 'Ask anything about services, pricing, or booking.' },
  { key: 'chat.placeholder', value: 'Type your question...' },
  { key: 'chat.sendButton', value: 'Send' },
  { key: 'chat.statusTyping', value: 'Luxival assistant is typing...' },
  { key: 'chat.greeting', value: 'Hi, I am Luxival assistant. What do you need help with today?' },
  { key: 'chat.leadIntro', value: 'Share your details and we will follow up.' },
  { key: 'chat.leadName', value: 'Your name' },
  { key: 'chat.leadEmail', value: 'Your email' },
  { key: 'chat.leadPhone', value: 'Phone / WhatsApp (optional)' },
  { key: 'chat.leadSubmit', value: 'Send details' },
  { key: 'chat.leadThanks', value: 'Thanks! We will be in touch soon.' },
];

const allKeys = [...referenceKeys, ...chatKeys];

const TARGET_LANGUAGES = [
  { code: 'ru', name: 'Russian', englishName: 'Russian' },
  { code: 'no', name: 'Norwegian', englishName: 'Norwegian' },
  { code: 'da', name: 'Danish', englishName: 'Danish' },
  { code: 'ja', name: 'Japanese', englishName: 'Japanese' },
  { code: 'zh', name: 'Chinese', englishName: 'Chinese (Simplified)' },
];
async function translateBatch(batch, lang, langName) {
  const batchSize = batch.length;
  const keysJson = JSON.stringify(batch.map(k => ({ key: k.key, en: k.value })), null, 2);

  const systemPrompt = `You are a professional translator specializing in luxury brand and travel industry translations. Translate each item from English to ${langName} (${lang}).

You will receive a JSON array with items like: {"key": "nav.home", "en": "Home"}
You must return the SAME array structure but ADD a field "${lang}" with the translation. Example:
Input: {"key": "nav.home", "en": "Home"}
Output: {"key": "nav.home", "en": "Home", "${lang}": "Домой"}

Rules:
- Keep ALL original fields (key, en) and ADD the "${lang}" field with your translation.
- Use natural, native ${langName} — premium/formal register for a Helsinki-based luxury chauffeur and web design company.
- Preserve HTML tags (<br>, etc.), URLs, email addresses, EUR prices, +358 phone numbers.
- Keep "Luxival" as-is. Keep acronyms: QA, SEO, UGC, SaaS, ISTQB, GPS, ETA.
- For Chinese (zh): Simplified Chinese. For Japanese (ja): polite form (です/ます).
- Return ONLY the JSON array — NO markdown, NO code fences, NO explanatory text.`;

  let response, data, text;

  if (API.isGemini) {
    response = await fetch(`${API.endpoint}?key=${API.key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: systemPrompt + '\n\n' + keysJson }] }
        ],
        generationConfig: { maxOutputTokens: 4000, temperature: 0.2 },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini ${response.status}: ${errText}`);
    }

    data = await response.json();
    text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) {
      text = text.replace(/^```(?:json)?\s*/gm, '').replace(/```\s*$/gm, '').trim();
    }
  } else {
    response = await fetch(API.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API.key}`,
      },
      body: JSON.stringify({
        model: API.model,
        max_tokens: 4000,
        temperature: 0.2,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: keysJson },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`API ${response.status}: ${errText}`);
    }

    data = await response.json();
    text = data.choices?.[0]?.message?.content;
  }

  if (!text) throw new Error('Empty response from API');

  // Parse the returned JSON
  let translations;
  try {
    translations = JSON.parse(text);
  } catch {
    // Try to extract JSON from markdown code blocks
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      translations = JSON.parse(jsonMatch[1]);
    } else {
      throw new Error(`Could not parse response for ${lang} (batch of ${batchSize}): ${text.slice(0, 200)}`);
    }
  }

  if (!Array.isArray(translations)) {
    throw new Error(`Response is not an array for ${lang} (batch of ${batchSize})`);
  }

  return translations;
}

// Translate a language, splitting into small batches to avoid quota issues
async function translate(lang, langName) {
  const result = {};
  const BATCH_SIZE = 20;

  for (let i = 0; i < allKeys.length; i += BATCH_SIZE) {
    const batch = allKeys.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(allKeys.length / BATCH_SIZE);

    process.stdout.write(`batch ${batchNum}/${totalBatches}... `);

    if (i > 0) {
      await sleep(1500); // delay between batches
    }

    const translations = await translateBatch(batch, lang, langName);

    for (const item of translations) {
      if (!item || !item.key) continue;
      // The translated value could be in various fields depending on the model
      const possibleFields = [lang, 'translation', 'value', 'target', 'text', 'translated'];
      let translated = null;
      for (const field of possibleFields) {
        const val = item[field];
        if (val && typeof val === 'string' && val.length > 0) {
          translated = val;
          break;
        }
      }
      // Fallback: use the "en" field if no translation field found
      if (!translated && item.en) {
        translated = item.en;
      }
      if (translated) {
        result[item.key] = translated;
      }
    }
  }

  return result;
}

async function main() {
  const result = {};

  for (let i = 0; i < TARGET_LANGUAGES.length; i++) {
    const lang = TARGET_LANGUAGES[i];
    process.stdout.write(`Translating to ${lang.name} (${lang.code})... `);

    if (i > 0) {
      await sleep(3000);
    }

    try {
      const translations = await translate(lang.code, lang.englishName);
      result[lang.code] = translations;
      console.log(`✓ (${Object.keys(translations).length} keys)`);
    } catch (e) {
      console.log(`✗ FAILED: ${e.message}`);
    }
  }

  // Write JSON output even if some failed (partial results)
  writeFileSync(OUTPUT_PATH, JSON.stringify(result, null, 2), 'utf-8');
  console.log(`\nSaved to ${OUTPUT_PATH}`);

  // Also output JS template blocks for direct paste into i18n.js
  for (const [code, translations] of Object.entries(result)) {
    console.log(`\n// --- ${code.toUpperCase()} ---`);
    console.log(`${code}: {`);
    for (const [key, value] of Object.entries(translations)) {
      const escaped = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      console.log(`  "${key}": "${escaped}",`);
    }
    console.log('},');
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
