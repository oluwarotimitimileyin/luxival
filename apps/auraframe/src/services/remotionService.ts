export interface RemotionJob {
  id: string;
  status: 'pending' | 'rendering' | 'done' | 'failed';
  title: string;
  script: string;
  duration: number;
  format: 'vertical' | 'horizontal' | 'square';
  outputUrl?: string;
  error?: string;
  createdAt: number;
}

const JOBS_KEY = 'luxival_remotion_jobs';

function loadJobs(): RemotionJob[] {
  try {
    const raw = localStorage.getItem(JOBS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveJobs(jobs: RemotionJob[]) {
  localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
}

export function getRemotionJobs(): RemotionJob[] {
  return loadJobs();
}

export async function queueRemotionRender(
  title: string,
  script: string,
  duration: number,
  format: 'vertical' | 'horizontal' | 'square' = 'vertical'
): Promise<RemotionJob> {
  const job: RemotionJob = {
    id: crypto.randomUUID?.() || Date.now().toString(36),
    status: 'pending',
    title,
    script,
    duration,
    format,
    createdAt: Date.now(),
  };

  const jobs = loadJobs();
  jobs.unshift(job);
  saveJobs(jobs);

  startRender(job);
  return job;
}

async function startRender(job: RemotionJob) {
  const jobs = loadJobs();
  const idx = jobs.findIndex(j => j.id === job.id);
  if (idx === -1) return;

  jobs[idx].status = 'rendering';
  saveJobs(jobs);

  try {
    const response = await fetch('/api/remotion-render', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: job.title,
        script: job.script,
        duration: job.duration,
        format: job.format,
        jobId: job.id,
      }),
    });

    if (!response.ok) throw new Error(`Render API error: ${response.status}`);

    const data = await response.json();
    const updated = loadJobs();
    const uIdx = updated.findIndex(j => j.id === job.id);
    if (uIdx === -1) return;

    updated[uIdx].status = 'done';
    updated[uIdx].outputUrl = data.url || data.outputUrl;
    saveJobs(updated);
  } catch (err) {
    const failed = loadJobs();
    const fIdx = failed.findIndex(j => j.id === job.id);
    if (fIdx === -1) return;
    failed[fIdx].status = 'failed';
    failed[fIdx].error = err instanceof Error ? err.message : 'Render failed';
    saveJobs(failed);
  }
}

export function parseScriptIntoSegments(script: string): Array<{ start: number; end: number; text: string; visual: string; audio: string }> {
  const segments: Array<{ start: number; end: number; text: string; visual: string; audio: string }> = [];
  const lines = script.split('\n');

  for (const line of lines) {
    const match = line.match(/\[(\d+)-(\d+)s\]\s*(.*)/);
    if (match) {
      segments.push({
        start: parseInt(match[1]),
        end: parseInt(match[2]),
        text: match[3].trim(),
        visual: '',
        audio: '',
      });
    }
  }

  const bracketContent = script.match(/\[(.*?)\]/g) || [];
  for (let i = 0; i < segments.length && i < bracketContent.length; i++) {
    const clean = bracketContent[i].replace(/[\[\]]/g, '');
    if (clean.match(/^\d+-\d+s?$/)) continue;
    if (segments[i].visual === '') segments[i].visual = clean;
    else segments[i].audio = clean;
  }

  return segments;
}

const FORMAT_CONFIG = {
  vertical: { width: 1080, height: 1920, label: '9:16 (TikTok/Reels/Shorts)' },
  horizontal: { width: 1920, height: 1080, label: '16:9 (YouTube)' },
  square: { width: 1080, height: 1080, label: '1:1 (Instagram/Facebook)' },
};

export function getFormatConfig(format: keyof typeof FORMAT_CONFIG) {
  return FORMAT_CONFIG[format] || FORMAT_CONFIG.vertical;
}

export function estimateRenderCost(duration: number, format: keyof typeof FORMAT_CONFIG): { frames: number; estimatedMinutes: number } {
  const { width, height } = FORMAT_CONFIG[format] || FORMAT_CONFIG.vertical;
  const fps = 30;
  const frames = duration * fps;
  const pixelsPerFrame = width * height;
  const estimatedMinutes = Math.ceil((frames * pixelsPerFrame) / (1920 * 1080 * 30) * duration / 60);
  return { frames, estimatedMinutes: Math.max(1, estimatedMinutes) };
}
