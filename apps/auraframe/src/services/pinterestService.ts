import { apiConfig } from './apiConfig';

const API_URL = 'https://api.pinterest.com/v5';

function getHeaders() {
  return {
    Authorization: `Bearer ${apiConfig.getKey('pinterest_access_token')}`,
    'Content-Type': 'application/json',
  };
}

export async function createPin(
  boardId: string,
  title: string,
  description: string,
  imageUrl: string,
  link?: string
) {
  if (!apiConfig.hasKey('pinterest_access_token')) {
    return { success: false, error: 'Pinterest access token not configured' };
  }

  try {
    const response = await fetch(`${API_URL}/pins`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        board_id: boardId,
        title,
        description,
        media_source: {
          source_type: 'image_url',
          url: imageUrl,
        },
        ...(link && { link }),
      }),
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
      pinId: data.id,
      url: data.link,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Network error',
    };
  }
}

export async function getBoards() {
  if (!apiConfig.hasKey('pinterest_access_token')) {
    return { success: false, error: 'Pinterest not configured', boards: [] };
  }

  try {
    const response = await fetch(`${API_URL}/boards`, {
      headers: getHeaders(),
    });

    if (!response.ok) {
      return { success: false, error: 'Failed to fetch boards', boards: [] };
    }

    const data = await response.json();
    return {
      success: true,
      boards:
        data.items?.map((b: Record<string, string>) => ({
          id: b.id,
          name: b.name,
        })) || [],
    };
  } catch {
    return { success: false, error: 'Network error', boards: [] };
  }
}
