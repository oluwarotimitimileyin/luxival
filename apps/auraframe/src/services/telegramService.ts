import { apiConfig } from './apiConfig';

const API_URL = 'https://api.telegram.org/bot';

function getToken() {
  return apiConfig.getKey('telegram_bot_token');
}

function getApiUrl(method: string) {
  return `${API_URL}${getToken()}/${method}`;
}

export async function sendTelegramMessage(
  chatId: string,
  text: string,
  options?: { parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2' }
) {
  if (!getToken()) {
    return { success: false, error: 'Telegram bot token not configured' };
  }

  try {
    const body: Record<string, string> = {
      chat_id: chatId,
      text,
    };
    if (options?.parseMode) {
      body.parse_mode = options.parseMode;
    }

    const response = await fetch(getApiUrl('sendMessage'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.description || `Error: ${response.status}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      messageId: data.result?.message_id,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Network error',
    };
  }
}

export async function sendTelegramPhoto(
  chatId: string,
  photoUrl: string,
  caption?: string
) {
  if (!getToken()) {
    return { success: false, error: 'Telegram bot token not configured' };
  }

  try {
    const body: Record<string, string> = {
      chat_id: chatId,
      photo: photoUrl,
    };
    if (caption) body.caption = caption;

    const response = await fetch(getApiUrl('sendPhoto'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.description || `Error: ${response.status}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      messageId: data.result?.message_id,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Network error',
    };
  }
}

export async function getUpdates() {
  if (!getToken()) return { success: false, messages: [] };

  try {
    const response = await fetch(getApiUrl('getUpdates'));
    const data = await response.json();
    return {
      success: true,
      messages:
        data.result?.map((u: Record<string, unknown>) => {
          const msg = u.message as Record<string, unknown>;
          const from = msg?.from as Record<string, string>;
          const chat = msg?.chat as Record<string, number>;
          return {
            id: u.update_id,
            chat: chat?.id,
            text: msg?.text,
            from: from?.username,
          };
        }) || [],
    };
  } catch {
    return { success: false, messages: [] };
  }
}
