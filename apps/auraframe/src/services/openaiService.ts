import { apiConfig } from './apiConfig';

export async function chatWithGPT(messages: { role: string; content: string }[]) {
  try {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    });
    const data = await res.json();
    if (data.error) return { content: '', error: data.error };
    return { content: data.content || '', provider: data.provider };
  } catch (e: any) {
    return { content: '', error: e.message || 'Network error' };
  }
}

export async function generateSocialPost(topic: string, platform: string) {
  const prompts: Record<string, string> = {
    linkedin: 'Professional LinkedIn post with hook, insights, CTA. 3-5 hashtags.',
    twitter: 'Twitter/X thread 3-5 tweets, under 280 chars each. Number 1/ 2/ etc.',
    instagram: 'Instagram caption with hook, emojis, 10-15 hashtags.',
    facebook: 'Facebook post sparking conversation. Include a question.',
    tiktok: 'TikTok script with hook, body, CTA. Include visual cues.',
    youtube: 'YouTube description with SEO keywords, timestamps, hashtags.',
    pinterest: 'Pinterest pin description with keywords.',
    reddit: 'Reddit post with genuine value. No self-promotion.',
    substack: 'Substack newsletter intro with subject line preview.',
    quora: 'Detailed Quora answer with expertise.',
    telegram: 'Telegram channel post. Short, punchy.',
    whatsapp: 'WhatsApp status under 100 words.',
  };
  const pp = prompts[platform.toLowerCase()] || 'Write a social media post.';
  return chatWithGPT([
    { role: 'system', content: 'Expert social media creator for AI, automation, business tech.' },
    { role: 'user', content: `${pp}\n\nTopic: ${topic}` },
  ]);
}

export async function generateMultiPlatformPost(topic: string): Promise<Record<string, string>> {
  const platforms = ['linkedin', 'twitter', 'instagram', 'facebook', 'tiktok', 'youtube', 'pinterest', 'reddit', 'substack', 'quora', 'telegram', 'whatsapp'];
  const results: Record<string, string> = {};
  await Promise.all(platforms.map(async (p) => {
    const r = await generateSocialPost(topic, p);
    if (!r.error && r.content) results[p] = r.content;
  }));
  return results;
}

export async function generateFromProgress(progress: string) {
  const a = await chatWithGPT([{ role: 'system', content: 'Extract key topics from business progress.' }, { role: 'user', content: `Extract main topic from: "${progress}"` }]);
  if (a.error) return { posts: {}, imagePrompt: '', videoScript: '', error: a.error };
  const [posts, img, vid] = await Promise.all([
    generateMultiPlatformPost(a.content),
    chatWithGPT([{ role: 'system', content: 'Write image prompts.' }, { role: 'user', content: `Create image prompt for: ${a.content}. Dark theme, cyan/blue.` }]),
    chatWithGPT([{ role: 'system', content: 'Video scriptwriter.' }, { role: 'user', content: `60s video script about: ${a.content}\n[0-3s] HOOK\n[3-15s] INTRO\n[15-45s] BODY\n[45-55s] CTA\n[55-60s] OUTRO` }]),
  ]);
  return { posts, imagePrompt: img.content || '', videoScript: vid.content || '' };
}

export async function draftReply(message: string, tone = 'professional') {
  return chatWithGPT([
    { role: 'system', content: `Professional ${tone} replies.` },
    { role: 'user', content: `Draft reply to: "${message}"` },
  ]);
}

export function getProviderStatus() {
  const ids = ['groq', 'openai', 'deepseek', 'openrouter'];
  const names: Record<string, string> = { groq: 'Groq', openai: 'OpenAI', deepseek: 'DeepSeek', openrouter: 'OpenRouter' };
  return ids.map(id => ({
    id,
    name: names[id],
    configured: apiConfig.hasKey(id),
  }));
}
