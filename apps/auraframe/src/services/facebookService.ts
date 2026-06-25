import { apiConfig } from './apiConfig';

const GRAPH_API = 'https://graph.facebook.com/v18.0';

function getToken() {
  return apiConfig.getKey('facebook_page_token') || apiConfig.getKey('instagram_token');
}

export async function postToFacebookPage(
  pageId: string,
  message: string,
  link?: string
) {
  const token = apiConfig.getKey('facebook_page_token');
  if (!token) {
    return { success: false, error: 'Facebook page token not configured' };
  }

  try {
    const params = new URLSearchParams({
      message,
      access_token: token,
    });
    if (link) params.append('link', link);

    const response = await fetch(`${GRAPH_API}/${pageId}/feed?${params}`, {
      method: 'POST',
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.error?.message || `Error: ${response.status}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      postId: data.id,
      url: `https://facebook.com/${data.id}`,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Network error',
    };
  }
}

export async function postToFacebookPageWithImage(
  pageId: string,
  message: string,
  imageUrl: string
) {
  const token = apiConfig.getKey('facebook_page_token');
  if (!token) {
    return { success: false, error: 'Facebook page token not configured' };
  }

  try {
    const params = new URLSearchParams({
      message,
      url: imageUrl,
      access_token: token,
    });

    const response = await fetch(`${GRAPH_API}/${pageId}/photos?${params}`, {
      method: 'POST',
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.error?.message || `Error: ${response.status}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      postId: data.post_id,
      url: `https://facebook.com/${data.post_id}`,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Network error',
    };
  }
}

// Get user's Facebook pages
export async function getFacebookPages() {
  const token = getToken();
  if (!token) return { success: false, error: 'Not authenticated' };

  try {
    const response = await fetch(
      `${GRAPH_API}/me/accounts?access_token=${token}`
    );
    const data = await response.json();
    return {
      success: true,
      pages: data.data?.map((p: Record<string, string>) => ({
        id: p.id,
        name: p.name,
        category: p.category,
      })) || [],
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Network error',
    };
  }
}

// Instagram Business Account Posting
export async function postToInstagram(
  igUserId: string,
  imageUrl: string,
  caption: string
) {
  const token = apiConfig.getKey('instagram_token');
  if (!token) {
    return { success: false, error: 'Instagram access token not configured' };
  }

  try {
    // Step 1: Create media container
    const createParams = new URLSearchParams({
      image_url: imageUrl,
      caption,
      access_token: token,
    });

    const createResponse = await fetch(
      `${GRAPH_API}/${igUserId}/media?${createParams}`,
      { method: 'POST' }
    );

    if (!createResponse.ok) {
      const error = await createResponse.json();
      return {
        success: false,
        error: error.error?.message || 'Failed to create media container',
      };
    }

    const createData = await createResponse.json();
    const creationId = createData.id;

    // Step 2: Publish the container
    const publishParams = new URLSearchParams({
      creation_id: creationId,
      access_token: token,
    });

    const publishResponse = await fetch(
      `${GRAPH_API}/${igUserId}/media_publish?${publishParams}`,
      { method: 'POST' }
    );

    if (!publishResponse.ok) {
      const error = await publishResponse.json();
      return {
        success: false,
        error: error.error?.message || 'Failed to publish',
      };
    }

    const publishData = await publishResponse.json();
    return {
      success: true,
      postId: publishData.id,
      url: `https://instagram.com/p/${publishData.id}`,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Network error',
    };
  }
}
