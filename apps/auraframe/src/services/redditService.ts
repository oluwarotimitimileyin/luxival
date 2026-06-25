import { apiConfig } from './apiConfig';

const API_URL = 'https://oauth.reddit.com';

function getHeaders() {
  return {
    Authorization: `Bearer ${apiConfig.getKey('reddit_access_token')}`,
    'User-Agent': 'AuraFrame/1.0',
    'Content-Type': 'application/x-www-form-urlencoded',
  };
}

export async function postToReddit(
  subreddit: string,
  title: string,
  text: string
) {
  if (!apiConfig.hasKey('reddit_access_token')) {
    return { success: false, error: 'Reddit access token not configured' };
  }

  try {
    const params = new URLSearchParams({
      sr: subreddit,
      title,
      text,
      kind: 'self',
    });

    const response = await fetch(`${API_URL}/api/submit`, {
      method: 'POST',
      headers: getHeaders(),
      body: params,
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.message || `Error: ${response.status}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      postId: data.json?.data?.id,
      url: `https://reddit.com/r/${subreddit}/comments/${data.json?.data?.id}`,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Network error',
    };
  }
}

export async function getRedditToken(
  code: string,
  redirectUri: string
): Promise<string | null> {
  const clientId = apiConfig.getKey('reddit_client_id');
  const clientSecret = apiConfig.getKey('reddit_client_secret');

  if (!clientId || !clientSecret) return null;

  try {
    const credentials = btoa(`${clientId}:${clientSecret}`);
    const response = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'AuraFrame/1.0',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });

    const data = await response.json();
    if (data.access_token) {
      apiConfig.setKey('reddit_access_token', data.access_token);
      return data.access_token;
    }
    return null;
  } catch {
    return null;
  }
}
