import { chatWithGPT } from './openaiService';

export interface ToneProfile {
  voice: string;
  vocabulary: string[];
  sentenceStructure: string;
  formality: number;
  humor: number;
  enthusiasm: number;
  technicalDepth: number;
  storytellingStyle: string;
  signaturePhrases: string[];
  brands: string[];
}

const STORAGE_KEY = 'luxival_tone_profile';

function loadProfile(): ToneProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveProfile(profile: ToneProfile) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export function getToneProfile(): ToneProfile | null {
  return loadProfile();
}

export function clearToneProfile() {
  localStorage.removeItem(STORAGE_KEY);
}

const ANALYSIS_SYSTEM_PROMPT = `You are a tone and voice analyst for a content creator.
Analyze the provided conversation transcripts and extract:
1. VOICE — 2-3 sentence description of their writing style, personality, and unique voice
2. VOCABULARY — key words and phrases they use frequently (array of strings)
3. SENTENCE_STRUCTURE — short punchy, long flowing, mix, etc.
4. FORMALITY — 0 (casual/slang) to 10 (academic/corporate)
5. HUMOR — 0 (dead serious) to 10 (consistently funny)
6. ENTHUSIASM — 0 (flat) to 10 (high energy)
7. TECHNICAL_DEPTH — 0 (surface level) to 10 (deep technical)
8. STORYTELLING_STYLE — narrative, data-driven, conversational, inspirational, etc.
9. SIGNATURE_PHRASES — recurring phrases or expressions (array)
10. BRANDS — brands, tools, or products they reference (array)

Return ONLY valid JSON, no extra text. Format:
{
  "voice": "...",
  "vocabulary": ["...", "..."],
  "sentenceStructure": "...",
  "formality": 5,
  "humor": 3,
  "enthusiasm": 7,
  "technicalDepth": 6,
  "storytellingStyle": "...",
  "signaturePhrases": ["..."],
  "brands": ["..."]
}`;

export async function analyzeTone(conversations: { role: string; content: string }[][]): Promise<ToneProfile | null> {
  const transcript = conversations
    .flat()
    .filter(m => m.role === 'user' || m.role === 'assistant')
    .map(m => `${m.role.toUpperCase()}: ${m.content}`)
    .join('\n\n');

  if (transcript.length < 100) return null;

  const result = await chatWithGPT([
    { role: 'system', content: ANALYSIS_SYSTEM_PROMPT },
    { role: 'user', content: `Analyze the tone and voice from these conversations:\n\n${transcript.slice(0, 15000)}` },
  ]);

  if (result.error) return null;

  try {
    const profile = JSON.parse(result.content) as ToneProfile;
    saveProfile(profile);
    return profile;
  } catch { return null; }
}

const GENERATION_SYSTEM_PROMPT = `You are a content generation engine that writes in a specific person's voice and tone.
You have been given a Tone Profile that describes how this person speaks and writes.
Your job is to generate content that sounds EXACTLY like them — same vocabulary, sentence structure, humor level, enthusiasm, and storytelling style.

Rules:
- NEVER write in generic marketing or corporate language
- Use their signature phrases naturally
- Match their formality level exactly
- If they use short punchy sentences, do the same
- If they tell stories, write in their narrative style
- Include their characteristic vocabulary
- Reference the brands and tools they use`;

export async function generateInTone(
  toneProfile: ToneProfile,
  platform: string,
  topic: string,
  extraContext?: string
): Promise<string> {
  const platformFormats: Record<string, string> = {
    linkedin: 'Professional post with hook, insights, CTA. 3-5 hashtags.',
    twitter: 'Thread of 3-5 tweets, each under 280 chars. Number them 1/ 2/ etc.',
    instagram: 'Caption with hook, emojis, 10-15 hashtags. Conversational.',
    facebook: 'Post that sparks conversation. Include a question.',
    tiktok: 'Short script with HOOK, BODY, CTA. Include visual cues in [brackets].',
    youtube: 'Description with SEO keywords, timestamps, hashtags.',
    pinterest: 'Pin description with keywords and line breaks.',
    reddit: 'Genuine value post. No self-promotion.',
    telegram: 'Short punchy channel post.',
    whatsapp: 'Status under 100 words.',
  };

  const format = platformFormats[platform.toLowerCase()] || 'Social media post';
  const context = extraContext ? `\nExtra context to incorporate: ${extraContext}` : '';

  const result = await chatWithGPT([
    {
      role: 'system',
      content: `${GENERATION_SYSTEM_PROMPT}\n\nTone Profile:\n${JSON.stringify(toneProfile, null, 2)}`,
    },
    {
      role: 'user',
      content: `Generate a ${platform} post about: ${topic}${context}\n\nFormat: ${format}`,
    },
  ]);

  return result.content || '';
}

export async function generateImagePrompt(toneProfile: ToneProfile, topic: string): Promise<string> {
  const result = await chatWithGPT([
    {
      role: 'system',
      content: `You write image generation prompts that match this person's aesthetic and brand.\nTone Profile:\n${JSON.stringify(toneProfile, null, 2)}`,
    },
    {
      role: 'user',
      content: `Create a detailed image generation prompt for: ${topic}. Include style, lighting, color palette, and mood that matches the profile above.`,
    },
  ]);

  return result.content || '';
}

export async function generateVideoScript(toneProfile: ToneProfile, topic: string, duration: number = 60): Promise<string> {
  const result = await chatWithGPT([
    {
      role: 'system',
      content: `You write video scripts in this person's engaging, authentic voice.\nTone Profile:\n${JSON.stringify(toneProfile, null, 2)}`,
    },
    {
      role: 'user',
      content: `Write a ${duration}-second video script about: ${topic}
Format:
[0-3s] HOOK
[3-${Math.floor(duration * 0.25)}s] INTRO
[${Math.floor(duration * 0.25)}-${Math.floor(duration * 0.75)}s] BODY / main content
[${Math.floor(duration * 0.75)}-${Math.floor(duration * 0.92)}s] CTA
[${Math.floor(duration * 0.92)}-${duration}s] OUTRO

Include visual and audio cues in [brackets].`,
    },
  ]);

  return result.content || '';
}
