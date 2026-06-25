import { apiConfig } from './apiConfig';

const API_URL = 'https://api.twitter.com/2';

function getHeaders() {
  return {
    Authorization: `Bearer ${apiConfig.getKey('twitter_bearer')}`,
    'Content-Type': 'application/json',
  };
}

export async function postTweet(text: string, mediaIds?: string[]) {
  if (!apiConfig.hasKey('twitter_bearer')) {
    return { success: false, error: 'Twitter API not configured' };
  }

  try {
    const body: Record<string, unknown> = { text };
    if (mediaIds?.length) {
      body.media = { media_ids: mediaIds };
    }

    const response = await fetch(`${API_URL}/tweets`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.detail || `Error: ${response.status}` };
    }

    const data = await response.json();
    return {
      success: true,
      tweetId: data.data?.id,
      url: `https://twitter.com/i/web/status/${data.data?.id}`,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Network error',
    };
  }
}

export async function uploadMedia(base64Image: string) {
  if (!apiConfig.hasKey('twitter_api_key')) {
    return { success: false, error: 'Twitter API not configured for media upload' };
  }

  try {
    // Convert base64 to blob
    const byteCharacters = atob(base64Image.split(',')[1] || base64Image);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/png' });

    const formData = new FormData();
    formData.append('media', blob);

    // Use Twitter API v1.1 for media upload
    const response = await fetch('https://upload.twitter.com/1.1/media/upload.json', {
      method: 'POST',
      headers: {
        Authorization: `OAuth oauth_consumer_key="${apiConfig.getKey('twitter_api_key')}"`,
      },
      body: formData,
    });

    if (!response.ok) {
      return { success: false, error: 'Media upload failed' };
    }

    const data = await response.json();
    return { success: true, mediaId: data.media_id_string };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Upload error',
    };
  }
}

export async function postThread(tweets: string[]) {
  const results = [];
  let lastTweetId: string | undefined;

  for (const tweet of tweets) {
    const body: Record<string, unknown> = { text: tweet };
    if (lastTweetId) {
      body.reply = { in_reply_to_tweet_id: lastTweetId };
    }

    try {
      const response = await fetch(`${API_URL}/tweets`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(body),
      });

      if (!response.ok) break;

      const data = await response.json();
      lastTweetId = data.data?.id;
      results.push({ id: data.data?.id, text: tweet });
    } catch {
      break;
    }
  }

  return { success: results.length > 0, tweets: results };
}
