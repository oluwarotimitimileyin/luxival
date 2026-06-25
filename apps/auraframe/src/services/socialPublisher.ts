import { postTweet } from './twitterService';
import { postToLinkedIn } from './linkedinService';
import {
  postToFacebookPage,
  postToInstagram,
} from './facebookService';
import { createPin } from './pinterestService';
import { postToReddit } from './redditService';
import { sendTelegramMessage } from './telegramService';
import { sendWhatsAppMessage } from './whatsappService';
import { apiConfig } from './apiConfig';

export interface PublishResult {
  platform: string;
  success: boolean;
  url?: string;
  error?: string;
  postId?: string;
  pinId?: string;
  messageId?: string;
}

export async function publishToPlatform(
  platform: string,
  content: string,
  options: {
    title?: string;
    imageUrl?: string;
    subreddit?: string;
    boardId?: string;
    pageId?: string;
    igUserId?: string;
    chatId?: string;
    phoneNumber?: string;
  } = {}
): Promise<PublishResult> {
  switch (platform.toLowerCase()) {
    case 'twitter':
    case 'x': {
      const result = await postTweet(content);
      return {
        platform: 'X/Twitter',
        success: result.success,
        url: result.url,
        error: result.error,
        postId: result.tweetId,
      };
    }

    case 'linkedin': {
      const result = await postToLinkedIn(content);
      return {
        platform: 'LinkedIn',
        success: result.success,
        url: result.url,
        error: result.error,
        postId: result.postId,
      };
    }

    case 'facebook': {
      if (!options.pageId) {
        return {
          platform: 'Facebook',
          success: false,
          error: 'Facebook Page ID required',
        };
      }
      const result = await postToFacebookPage(options.pageId, content);
      return {
        platform: 'Facebook',
        success: result.success,
        url: result.url,
        error: result.error,
        postId: result.postId,
      };
    }

    case 'instagram': {
      if (!options.igUserId || !options.imageUrl) {
        return {
          platform: 'Instagram',
          success: false,
          error: 'Instagram requires an image and User ID',
        };
      }
      const result = await postToInstagram(
        options.igUserId,
        options.imageUrl,
        content
      );
      return {
        platform: 'Instagram',
        success: result.success,
        url: result.url,
        error: result.error,
        postId: result.postId,
      };
    }

    case 'pinterest': {
      if (!options.boardId || !options.imageUrl) {
        return {
          platform: 'Pinterest',
          success: false,
          error: 'Pinterest requires a board ID and image',
        };
      }
      const result = await createPin(
        options.boardId,
        options.title || content.slice(0, 100),
        content,
        options.imageUrl
      );
      return {
        platform: 'Pinterest',
        success: result.success,
        url: result.url,
        error: result.error,
        pinId: result.pinId,
      };
    }

    case 'reddit': {
      if (!options.subreddit) {
        return {
          platform: 'Reddit',
          success: false,
          error: 'Subreddit name required',
        };
      }
      const result = await postToReddit(
        options.subreddit,
        options.title || content.slice(0, 300),
        content
      );
      return {
        platform: 'Reddit',
        success: result.success,
        url: result.url,
        error: result.error,
        postId: result.postId,
      };
    }

    case 'telegram': {
      if (!options.chatId) {
        return {
          platform: 'Telegram',
          success: false,
          error: 'Telegram chat ID required',
        };
      }
      const result = await sendTelegramMessage(options.chatId, content, {
        parseMode: 'HTML',
      });
      return {
        platform: 'Telegram',
        success: result.success,
        error: result.error,
        messageId: result.messageId,
      };
    }

    case 'whatsapp': {
      if (!options.phoneNumber) {
        return {
          platform: 'WhatsApp',
          success: false,
          error: 'Phone number required',
        };
      }
      const result = await sendWhatsAppMessage(
        options.phoneNumber,
        content
      );
      return {
        platform: 'WhatsApp',
        success: result.success,
        error: result.error,
        messageId: result.messageId,
      };
    }

    case 'youtube': {
      return {
        platform: 'YouTube',
        success: false,
        error: 'YouTube posting requires OAuth flow (manual upload recommended)',
      };
    }

    case 'substack': {
      return {
        platform: 'Substack',
        success: false,
        error: 'Substack does not have a public API. Use the generated content to manually publish.',
      };
    }

    case 'quora': {
      return {
        platform: 'Quora',
        success: false,
        error: 'Quora does not have a public write API. Use the generated content to manually post.',
      };
    }

    case 'tiktok': {
      return {
        platform: 'TikTok',
        success: false,
        error: 'TikTok requires direct upload via their app or Creator Portal.',
      };
    }

    default:
      return {
        platform,
        success: false,
        error: `Platform "${platform}" not supported yet`,
      };
  }
}

export async function publishToAll(
  platforms: string[],
  content: string,
  options: Record<string, unknown> = {}
): Promise<PublishResult[]> {
  const results = await Promise.all(
    platforms.map((platform) =>
      publishToPlatform(platform, content, options as Record<string, string>)
    )
  );
  return results;
}

export function getPlatformStatus(): Array<{
  name: string;
  connected: boolean;
  color: string;
}> {
  return [
    {
      name: 'LinkedIn',
      connected: apiConfig.isSocialAvailable('linkedin'),
      color: '#0077B5',
    },
    {
      name: 'X / Twitter',
      connected: apiConfig.isSocialAvailable('twitter'),
      color: '#1DA1F2',
    },
    {
      name: 'Instagram',
      connected: apiConfig.isSocialAvailable('instagram'),
      color: '#E4405F',
    },
    {
      name: 'Facebook',
      connected: apiConfig.isSocialAvailable('facebook'),
      color: '#1877F2',
    },
    {
      name: 'Pinterest',
      connected: apiConfig.isSocialAvailable('pinterest'),
      color: '#BD081C',
    },
    {
      name: 'TikTok',
      connected: apiConfig.isSocialAvailable('tiktok'),
      color: '#00f2ea',
    },
    {
      name: 'YouTube',
      connected: apiConfig.isSocialAvailable('youtube'),
      color: '#FF0000',
    },
    {
      name: 'Reddit',
      connected: apiConfig.isSocialAvailable('reddit'),
      color: '#FF4500',
    },
    {
      name: 'Telegram',
      connected: apiConfig.isSocialAvailable('telegram'),
      color: '#0088cc',
    },
    {
      name: 'WhatsApp',
      connected: apiConfig.isSocialAvailable('whatsapp'),
      color: '#25D366',
    },
  ];
}

export const PLATFORM_CONFIGS: Record<
  string,
  { needsImage: boolean; needsId: boolean; idLabel?: string }
> = {
  linkedin: { needsImage: false, needsId: false },
  twitter: { needsImage: false, needsId: false },
  facebook: { needsImage: false, needsId: true, idLabel: 'Page ID' },
  instagram: { needsImage: true, needsId: true, idLabel: 'Instagram User ID' },
  pinterest: { needsImage: true, needsId: true, idLabel: 'Board ID' },
  reddit: { needsImage: false, needsId: true, idLabel: 'Subreddit' },
  telegram: { needsImage: false, needsId: true, idLabel: 'Chat ID' },
  whatsapp: { needsImage: false, needsId: true, idLabel: 'Phone Number' },
  youtube: { needsImage: true, needsId: false },
  tiktok: { needsImage: true, needsId: false },
  substack: { needsImage: false, needsId: false },
  quora: { needsImage: false, needsId: false },
};
