import type { ToneProfile } from './toneService';
import { generateInTone, generateImagePrompt, generateVideoScript } from './toneService';
import { chatWithGPT } from './openaiService';

export interface BrainInput {
  type: 'chat_transcript' | 'work_session' | 'text_notes' | 'image' | 'link';
  content: string;
  label?: string;
}

export interface BrainOutput {
  platform: string;
  post: string;
  imagePrompt: string;
  videoScript: string;
  imageUrl?: string;
  videoUrl?: string;
}

export interface BrainResult {
  id: string;
  timestamp: number;
  summary: string;
  outputs: BrainOutput[];
  sourceType: BrainInput['type'];
  sourceLabel?: string;
}

const HISTORY_KEY = 'luxival_brain_history';

function loadHistory(): BrainResult[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveToHistory(result: BrainResult) {
  const history = loadHistory();
  history.unshift(result);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 100)));
}

export function getBrainHistory(): BrainResult[] {
  return loadHistory();
}

export function clearBrainHistory() {
  localStorage.removeItem(HISTORY_KEY);
}

async function extractTopics(inputs: BrainInput[]): Promise<string> {
  const combined = inputs
    .map(i => `[${i.type}] ${i.label || ''}\n${i.content}`)
    .join('\n\n---\n\n');

  const result = await chatWithGPT([
    {
      role: 'system',
      content: 'Extract the main topic, key points, and target audience from the provided content. Return a concise summary (2-3 sentences) followed by 3-5 specific content angles. Format:\nTOPIC: <one line>\nSUMMARY: <2-3 sentences>\nANGLES:\n- <angle 1>\n- <angle 2>',
    },
    { role: 'user', content: combined },
  ]);

  return result.content || '';
}

export async function processBrainInputs(
  inputs: BrainInput[],
  toneProfile: ToneProfile | null,
  platforms: string[]
): Promise<BrainResult> {
  const topicAnalysis = await extractTopics(inputs);
  const topicLine = topicAnalysis.split('\n')[0]?.replace('TOPIC:', '').trim() || 'Content from inputs';

  const platformOutputs: BrainOutput[] = [];

  await Promise.all(
    platforms.map(async (platform) => {
      const [post, imgPrompt, vidScript] = await Promise.all([
        toneProfile
          ? generateInTone(toneProfile, platform, topicLine, topicAnalysis)
          : chatWithGPT([
              { role: 'system', content: 'Social media content creator.' },
              { role: 'user', content: `Write a ${platform} post about: ${topicLine}\n\nContext: ${topicAnalysis}` },
            ]).then(r => r.content || ''),
        generateImagePrompt(toneProfile || { voice: '', vocabulary: [], sentenceStructure: '', formality: 5, humor: 3, enthusiasm: 5, technicalDepth: 5, storytellingStyle: 'conversational', signaturePhrases: [], brands: [] }, topicLine),
        generateVideoScript(toneProfile || { voice: '', vocabulary: [], sentenceStructure: '', formality: 5, humor: 3, enthusiasm: 5, technicalDepth: 5, storytellingStyle: 'conversational', signaturePhrases: [], brands: [] }, topicLine),
      ]);

      platformOutputs.push({
        platform,
        post: post || '',
        imagePrompt: imgPrompt || '',
        videoScript: vidScript || '',
      });
    })
  );

  const result: BrainResult = {
    id: crypto.randomUUID?.() || Date.now().toString(36),
    timestamp: Date.now(),
    summary: topicAnalysis,
    outputs: platformOutputs,
    sourceType: inputs[0]?.type || 'text_notes',
    sourceLabel: inputs[0]?.label || inputs.map(i => i.type).join(', '),
  };

  saveToHistory(result);
  return result;
}

export async function chatTranscriptToInput(transcript: { role: string; content: string }[]): Promise<BrainInput> {
  const text = transcript.map(m => `${m.role}: ${m.content}`).join('\n');
  return {
    type: 'chat_transcript',
    content: text,
    label: `Chat conversation (${transcript.filter(m => m.role === 'user').length} messages)`,
  };
}

export function textToInput(text: string, label?: string): BrainInput {
  return { type: 'text_notes', content: text, label };
}

export function workSessionToInput(sessionText: string, sessionTitle?: string): BrainInput {
  return { type: 'work_session', content: sessionText, label: sessionTitle || 'Work session notes' };
}
