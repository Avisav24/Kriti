/* ==========================================================
 KOKO YouTube Search API Route
 Vercel Edge Function / Serverless Function
 GET /api/youtube-search?q=<query>
 ========================================================== */

interface YouTubeSearchResult {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
}

// In-memory cache for edge function execution context
// Note: In Vercel Edge, this only persists within the same region's isolate,
// but for a single user, it's sufficient to prevent rapid reloading quota drain.
const cache = new Map<string, { data: YouTubeSearchResult[]; timestamp: number }>();
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

// Simple rate limit in-memory (per isolate)
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 20; // max requests per minute

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const url = new URL(req.url);
    const query = url.searchParams.get('q');
    const videoIdParam = url.searchParams.get('id');

    if ((!query || query.trim().length === 0) && (!videoIdParam || videoIdParam.trim().length === 0)) {
      return new Response(JSON.stringify({ error: 'Query (q) or video ID (id) is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const cacheKey = (videoIdParam && videoIdParam.trim().length > 0) ? `id_${videoIdParam.trim()}` : query!.trim().toLowerCase();

    // Rate Limiting (Simple)
    // We use a single bucket for the app since it's a single-user private app
    const clientIp = req.headers.get('x-forwarded-for') || 'default';
    const now = Date.now();
    let rateData = requestCounts.get(clientIp);
    
    if (!rateData || now > rateData.resetTime) {
      rateData = { count: 0, resetTime: now + 60 * 1000 };
    }
    
    rateData.count++;
    requestCounts.set(clientIp, rateData);

    if (rateData.count > RATE_LIMIT) {
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please wait a minute before searching again.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check Cache
    const cachedEntry = cache.get(cacheKey);
    if (cachedEntry && now - cachedEntry.timestamp < CACHE_TTL) {
      return new Response(JSON.stringify(cachedEntry.data), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=21600' // 6 hours
        },
      });
    }

    const envKeys = process.env.YOUTUBE_API_KEY || '';
    const hardcodedKeys = 'AIzaSyC42f9G-Tdcr8RGuow3qZfj-6HB4zBJAq4, AIzaSyDwIcRqKGiG7f7Ehc7cqqJATcj0HLHiHCU, AIzaSyDKNNdsjSKKBad0cunsUVD5-gsls3uPu04, AIzaSyCm2iSUl5CjlXre1elwOGrv5txg9JrQ7bw, AIzaSyAqc8ZreavJR4lFYj78IC7DWWFjjL4bEeQ, AIzaSyA1JYRfM-dk3PkQRcF6fCMYLC6GRyer_qc, AIzaSyBn4XQT9UC9WlJyXbh79ZE_tJnfcd2fMrc, AIzaSyC1bWR0LNh_HOqaLnLRwt-IXjHvs-iEtNg, AIzaSyA7VYGvHIGeBJpS49U3qpSbkwfBdyNYrmE, AIzaSyA4TlXgFsqIduWRc5xpArzKb0Q-r7IMGDE, AIzaSyBago5TOpGaIaQx6lgTsC85JPzl3QxeQZI, AIzaSyD6ov0Xhj_ocNejmLLFCBGp-bcKY_vetgU, AIzaSyChtLyKy4_wfGgMOcw_s_870vU56qqE2qM, AIzaSyAt4JojPcw7bOo1o3j9xJ6KfK0f9U9HT9U, AIzaSyAoM51RtPYkwjBG4r_LXYtloMX2eykl5BQ';
    
    // Combine keys from env and hardcoded, then deduplicate
    const allKeys = [
      ...envKeys.split(','),
      ...hardcodedKeys.split(',')
    ].map(k => k.trim()).filter(Boolean);
    
    const YOUTUBE_API_KEYS = Array.from(new Set(allKeys));

    if (YOUTUBE_API_KEYS.length === 0) {
      console.error('YOUTUBE_API_KEY is missing');
      return new Response(
        JSON.stringify({ error: 'YouTube search is not configured.' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Try keys sequentially until one works
    let lastError = 'All API keys exhausted or failed.';
    let isQuotaExceeded = false;

    for (let i = 0; i < YOUTUBE_API_KEYS.length; i++) {
      const currentKey = YOUTUBE_API_KEYS[i];
      
      let ytUrl: URL;
      if (videoIdParam && videoIdParam.trim().length > 0) {
        ytUrl = new URL('https://youtube.googleapis.com/youtube/v3/videos');
        ytUrl.searchParams.set('part', 'id,snippet');
        ytUrl.searchParams.set('id', videoIdParam.trim());
        ytUrl.searchParams.set('fields', 'items(id,snippet(title,channelTitle,thumbnails/medium/url,thumbnails/default/url))');
        ytUrl.searchParams.set('key', currentKey);
      } else {
        ytUrl = new URL('https://youtube.googleapis.com/youtube/v3/search');
        ytUrl.searchParams.set('part', 'snippet');
        ytUrl.searchParams.set('type', 'video');
        ytUrl.searchParams.set('videoEmbeddable', 'true');
        ytUrl.searchParams.set('maxResults', '5');
        ytUrl.searchParams.set('q', query!.trim());
        ytUrl.searchParams.set('fields', 'items(id/videoId,snippet(title,channelTitle,thumbnails/medium/url,thumbnails/default/url))');
        ytUrl.searchParams.set('key', currentKey);
      }

      const ytResponse = await fetch(ytUrl.toString());

      if (ytResponse.ok) {
        const ytData = await ytResponse.json();
        
        const results: YouTubeSearchResult[] = (ytData.items || []).map((item: any) => ({
          videoId: (videoIdParam && videoIdParam.trim().length > 0) ? item.id : item.id.videoId,
          title: item.snippet.title,
          channelTitle: item.snippet.channelTitle,
          thumbnailUrl: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
        }));

        cache.set(cacheKey, { data: results, timestamp: now });

        // Ensure cache doesn't grow unbounded in memory
        if (cache.size > 100) {
          const oldestKey = cache.keys().next().value;
          if (oldestKey) cache.delete(oldestKey);
        }

        return new Response(JSON.stringify(results), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=21600'
          },
        });
      }

      // If it failed, log it and move to the next key
      const errorData = await ytResponse.json().catch(() => ({}));
      console.error(`YouTube API error with key ${i + 1}:`, errorData);
      
      const isQuota = ytResponse.status === 429 || 
                      (ytResponse.status === 403 && (errorData.error?.errors?.[0]?.reason === 'quotaExceeded' || errorData.error?.errors?.[0]?.reason === 'rateLimitExceeded'));
                      
      if (isQuota) {
        isQuotaExceeded = true;
        console.warn(`Key ${i + 1} quota exceeded. Trying next...`);
        continue;
      }
      
      lastError = errorData.error?.message || `HTTP ${ytResponse.status}`;
    }

    return new Response(
      JSON.stringify({ error: isQuotaExceeded ? 'All API keys exhausted their quota.' : lastError }),
      { 
        status: 503, 
        headers: { 
          'Content-Type': 'application/json'
        } 
      }
    );

  } catch (err) {
    console.error('YouTube search proxy error:', err);
    return new Response(
      JSON.stringify({ error: "Something went wrong" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Vercel config
export const config = {
  runtime: 'edge',
};
