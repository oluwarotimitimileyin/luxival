import type { PublishResult } from './socialPublisher';
import { publishToPlatform } from './socialPublisher';
import { apiConfig } from './apiConfig';

export interface ScheduledPost {
  id: string;
  platform: string;
  content: string;
  title?: string;
  imageUrl?: string;
  scheduledFor: number;
  status: 'pending' | 'published' | 'failed';
  result?: PublishResult;
  createdAt: number;
}

export interface DistributionPlan {
  id: string;
  name: string;
  platforms: string[];
  contentByPlatform: Record<string, string>;
  imageUrl?: string;
  videoUrl?: string;
  scheduleType: 'now' | 'later' | 'spread';
  scheduledFor?: number;
  status: 'draft' | 'scheduled' | 'publishing' | 'done' | 'partial' | 'failed';
  results: PublishResult[];
  createdAt: number;
}

const SCHEDULE_KEY = 'luxival_schedule_queue';
const PLANS_KEY = 'luxival_distribution_plans';

function loadSchedule(): ScheduledPost[] {
  try {
    const raw = localStorage.getItem(SCHEDULE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveSchedule(posts: ScheduledPost[]) {
  localStorage.setItem(SCHEDULE_KEY, JSON.stringify(posts));
}

function loadPlans(): DistributionPlan[] {
  try {
    const raw = localStorage.getItem(PLANS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function savePlans(plans: DistributionPlan[]) {
  localStorage.setItem(PLANS_KEY, JSON.stringify(plans));
}

export function getScheduledPosts(): ScheduledPost[] {
  return loadSchedule().sort((a, b) => a.scheduledFor - b.scheduledFor);
}

export function getDistributionPlans(): DistributionPlan[] {
  return loadPlans().sort((a, b) => b.createdAt - a.createdAt);
}

export async function distributeNow(
  platforms: string[],
  contentByPlatform: Record<string, string>,
  imageUrl?: string,
  videoUrl?: string
): Promise<DistributionPlan> {
  const plan: DistributionPlan = {
    id: crypto.randomUUID?.() || Date.now().toString(36),
    name: `Distribution ${new Date().toLocaleDateString()}`,
    platforms,
    contentByPlatform,
    imageUrl,
    videoUrl,
    scheduleType: 'now',
    status: 'publishing',
    results: [],
    createdAt: Date.now(),
  };

  const plans = loadPlans();
  plans.unshift(plan);
  savePlans(plans);

  const results = await Promise.all(
    platforms.map(async (platform) => {
      const content = contentByPlatform[platform] || contentByPlatform['default'] || '';
      if (!content) {
        return { platform, success: false, error: 'No content for this platform' } as PublishResult;
      }

      const options: Record<string, string> = {};
      if (imageUrl) options.imageUrl = imageUrl;
      if (platform === 'instagram' && imageUrl) {
        const igUserId = apiConfig.getKey('instagram_token') ? 'self' : '';
        if (igUserId) options.igUserId = igUserId;
      }
      if (platform === 'pinterest') {
        options.boardId = apiConfig.getKey('pinterest_board_id') || 'default';
      }
      if (platform === 'reddit') {
        options.subreddit = apiConfig.getKey('reddit_subreddit') || '';
      }

      return publishToPlatform(platform, content, options as any);
    })
  );

  const updated = loadPlans();
  const idx = updated.findIndex(p => p.id === plan.id);
  if (idx !== -1) {
    updated[idx].results = results;
    updated[idx].status = results.every(r => r.success) ? 'done' : results.some(r => r.success) ? 'partial' : 'failed';
    savePlans(updated);
  }

  return { ...plan, results, status: results.every(r => r.success) ? 'done' : results.some(r => r.success) ? 'partial' : 'failed' };
}

export async function scheduleForLater(
  platforms: string[],
  contentByPlatform: Record<string, string>,
  scheduledFor: number,
  imageUrl?: string
): Promise<ScheduledPost[]> {
  const posts: ScheduledPost[] = platforms.map(platform => ({
    id: crypto.randomUUID?.() || Date.now().toString(36),
    platform,
    content: contentByPlatform[platform] || contentByPlatform['default'] || '',
    imageUrl,
    scheduledFor,
    status: 'pending',
    createdAt: Date.now(),
  }));

  const existing = loadSchedule();
  saveSchedule([...existing, ...posts]);
  return posts;
}

export function scheduleChecker(): ReturnType<typeof setInterval> | null {
  const interval = setInterval(async () => {
    const now = Date.now();
    const queue = loadSchedule();
    const due = queue.filter(p => p.status === 'pending' && p.scheduledFor <= now);

    if (due.length === 0) return;

    await Promise.all(
      due.map(async (post) => {
        const result = await publishToPlatform(post.platform, post.content, {
          imageUrl: post.imageUrl,
        } as any);
        const updated = loadSchedule();
        const idx = updated.findIndex(p => p.id === post.id);
        if (idx !== -1) {
          updated[idx].status = result.success ? 'published' : 'failed';
          updated[idx].result = result;
          saveSchedule(updated);
        }
      })
    );
  }, 30000);

  return interval;
}

export async function spreadOverTime(
  platforms: string[],
  contentByPlatform: Record<string, string>,
  startFrom: number,
  hoursBetween: number = 4,
  imageUrl?: string
): Promise<ScheduledPost[]> {
  const all: ScheduledPost[] = [];

  for (let i = 0; i < platforms.length; i++) {
    const platform = platforms[i];
    const posts: ScheduledPost = {
      id: crypto.randomUUID?.() || Date.now().toString(36),
      platform,
      content: contentByPlatform[platform] || contentByPlatform['default'] || '',
      imageUrl,
      scheduledFor: startFrom + i * hoursBetween * 3600000,
      status: 'pending',
      createdAt: Date.now(),
    };
    all.push(posts);
  }

  const existing = loadSchedule();
  saveSchedule([...existing, ...all]);
  return all;
}

export function cancelScheduled(postId: string) {
  const posts = loadSchedule().filter(p => p.id !== postId);
  saveSchedule(posts);
}

export function deletePlan(planId: string) {
  const plans = loadPlans().filter(p => p.id !== planId);
  savePlans(plans);
}

export function planPreview(
  platforms: string[],
  contentByPlatform: Record<string, string>,
  scheduleType: 'now' | 'later' | 'spread'
): { platformCount: number; totalChars: number; estimatedPosts: number; scheduleSummary: string } {
  const platformCount = platforms.length;
  const totalChars = Object.values(contentByPlatform).reduce((sum, c) => sum + (c?.length || 0), 0);
  const estimatedPosts = platformCount;

  let scheduleSummary = '';
  if (scheduleType === 'now') scheduleSummary = 'Publishing immediately';
  else if (scheduleType === 'later') scheduleSummary = `Scheduled for ${new Date().toLocaleDateString()}`;
  else scheduleSummary = `Spread over ${Math.ceil(platformCount * 4)} hours`;

  return { platformCount, totalChars, estimatedPosts, scheduleSummary };
}
