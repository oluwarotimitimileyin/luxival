// Wikipedia API - no API key needed!
const API_URL = 'https://en.wikipedia.org/api/rest_v1';

export async function searchWikipedia(query: string): Promise<{
  success: boolean;
  results?: Array<{ title: string; snippet: string; url: string }>;
  error?: string;
}> {
  try {
    const response = await fetch(
      `https://en.wikipedia.org/w/api.php?` +
        `action=query&list=search&srsearch=${encodeURIComponent(query)}&` +
        `format=json&origin=*&srlimit=5`
    );

    if (!response.ok) {
      return { success: false, error: `Error: ${response.status}` };
    }

    const data = await response.json();
    const results =
      data.query?.search?.map((item: Record<string, string>) => ({
        title: item.title,
        snippet: item.snippet.replace(/<[^>]*>/g, ''), // Strip HTML
        url: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/ /g, '_'))}`,
      })) || [];

    return { success: true, results };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Network error',
    };
  }
}

export async function getWikipediaSummary(title: string): Promise<{
  success: boolean;
  summary?: string;
  url?: string;
  error?: string;
}> {
  try {
    const response = await fetch(
      `${API_URL}/page/summary/${encodeURIComponent(title.replace(/ /g, '_'))}`
    );

    if (!response.ok) {
      return { success: false, error: `Error: ${response.status}` };
    }

    const data = await response.json();
    return {
      success: true,
      summary: data.extract,
      url: data.content_urls?.desktop?.page,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Network error',
    };
  }
}

// Research assistant: gather facts about a topic
export async function researchTopic(
  topic: string
): Promise<string> {
  const search = await searchWikipedia(topic);

  if (!search.success || !search.results?.length) {
    return 'No Wikipedia results found for this topic.';
  }

  // Get summaries for top 3 results
  const summaries = await Promise.all(
    search.results.slice(0, 3).map((r) => getWikipediaSummary(r.title))
  );

  let output = `**Research on "${topic}" from Wikipedia:**\n\n`;
  summaries.forEach((s, i) => {
    if (s.success && s.summary && search.results && search.results[i]) {
      output += `${i + 1}. **${search.results[i].title}**\n${s.summary}\n[${s.url}]\n\n`;
    }
  });

  return output;
}
