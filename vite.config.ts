import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    root: '.',
    publicDir: 'public',
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      target: 'es2020',
      minify: 'terser',
      rollupOptions: {
        input: resolve(__dirname, 'index.html'),
      },
    },
    server: {
      port: 3000,
      open: true,
    },
    plugins: [
      {
        name: 'api-middleware',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url === '/api/messages' && req.method === 'POST') {
              let body = '';
              req.on('data', chunk => { body += chunk; });
              req.on('end', async () => {
                try {
                  const data = JSON.parse(body);
                  const TELEGRAM_BOT_TOKEN = env.TELEGRAM_BOT_TOKEN || '8806714140:AAE5RC6qQDKyMulxKz6JLUjgyM5DDcXr3FI';
                  const TELEGRAM_CHAT_ID = env.TELEGRAM_CHAT_ID || '6541727849';
                  
                  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
                    res.statusCode = 503;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: "The messaging service isn't set up yet." }));
                    return;
                  }
                  
                  let timestamp = data.timestamp || 'Unknown Time';
                  if (timestamp.includes('T') && timestamp.endsWith('Z')) {
                    const d = new Date(timestamp);
                    if (!isNaN(d.getTime())) {
                      d.setMinutes(d.getMinutes() + 330);
                      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                      const day = d.getUTCDate();
                      const month = months[d.getUTCMonth()];
                      const year = d.getUTCFullYear();
                      let hours = d.getUTCHours();
                      const minutes = d.getUTCMinutes();
                      const ampm = hours >= 12 ? 'pm' : 'am';
                      hours = hours % 12;
                      hours = hours ? hours : 12; 
                      const minStr = minutes < 10 ? '0' + minutes : minutes;
                      timestamp = `${day} ${month} ${year}, ${hours}:${minStr} ${ampm}`;
                    }
                  }
                    
                  const telegramMessage = `💌 *New journal entry from Kriti*\n_Sent ${timestamp}_\n\n${data.message}`;
                    
                  const telegramResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      chat_id: TELEGRAM_CHAT_ID,
                      text: telegramMessage,
                      parse_mode: 'Markdown'
                    }),
                  });
                  
                  if (!telegramResponse.ok) {
                    const errorText = await telegramResponse.text();
                    console.error('Telegram API error:', errorText);
                    res.statusCode = 502;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: "Didn't send. Telegram service had a hiccup." }));
                    return;
                  }
                  
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ success: true }));
                } catch(e) {
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: "Something went wrong" }));
                }
              });
            } else if (req.url?.startsWith('/api/youtube-search') && req.method === 'GET') {
                try {
                  const url = new URL(req.url, `http://${req.headers.host}`);
                  const query = url.searchParams.get('q');
                  
                  if (!query || query.trim().length === 0) {
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: 'Query is required' }));
                    return;
                  }

                  const rawKeys = env.YOUTUBE_API_KEY || 'AIzaSyCm2iSUl5CjlXre1elwOGrv5txg9JrQ7bw, AIzaSyAqc8ZreavJR4lFYj78IC7DWWFjjL4bEeQ, AIzaSyA1JYRfM-dk3PkQRcF6fCMYLC6GRyer_qc, AIzaSyBn4XQT9UC9WlJyXbh79ZE_tJnfcd2fMrc, AIzaSyC1bWR0LNh_HOqaLnLRwt-IXjHvs-iEtNg, AIzaSyA7VYGvHIGeBJpS49U3qpSbkwfBdyNYrmE, AIzaSyA4TlXgFsqIduWRc5xpArzKb0Q-r7IMGDE, AIzaSyBago5TOpGaIaQx6lgTsC85JPzl3QxeQZI, AIzaSyD6ov0Xhj_ocNejmLLFCBGp-bcKY_vetgU, AIzaSyChtLyKy4_wfGgMOcw_s_870vU56qqE2qM';
                  const YOUTUBE_API_KEYS = rawKeys.split(',').map(k => k.trim()).filter(Boolean);
                  
                  // You can also manually add more keys to this array like:
                  // YOUTUBE_API_KEYS.push('YOUR_KEY_2', 'YOUR_KEY_3');

                  if (YOUTUBE_API_KEYS.length === 0) {
                    res.statusCode = 503;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: 'YouTube search is not configured.' }));
                    return;
                  }

                  let lastError = 'All API keys exhausted or failed.';
                  let isQuotaExceeded = false;

                  for (let i = 0; i < YOUTUBE_API_KEYS.length; i++) {
                    const currentKey = YOUTUBE_API_KEYS[i];
                    
                    const ytUrl = new URL('https://youtube.googleapis.com/youtube/v3/search');
                    ytUrl.searchParams.set('part', 'snippet');
                    ytUrl.searchParams.set('type', 'video');
                    ytUrl.searchParams.set('videoEmbeddable', 'true');
                    ytUrl.searchParams.set('maxResults', '8');
                    ytUrl.searchParams.set('q', query);
                    ytUrl.searchParams.set('key', currentKey);

                    const ytResponse = await fetch(ytUrl.toString());

                    if (ytResponse.ok) {
                      const ytData = await ytResponse.json();
                      const results = (ytData.items || []).map((item: any) => ({
                        videoId: item.id.videoId,
                        title: item.snippet.title,
                        channelTitle: item.snippet.channelTitle,
                        thumbnailUrl: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
                      }));

                      res.statusCode = 200;
                      res.setHeader('Content-Type', 'application/json');
                      res.end(JSON.stringify(results));
                      return;
                    }

                    // Request failed with this key
                    const errorData = await ytResponse.json().catch(() => ({}));
                    console.error(`Vite Dev: YouTube API error with key ${i + 1}:`, errorData);
                    
                    if (ytResponse.status === 403 && errorData.error?.errors?.[0]?.reason === 'quotaExceeded') {
                      isQuotaExceeded = true;
                    }
                    lastError = errorData?.error?.message || 'Failed to fetch from YouTube';
                  }

                  // All keys failed
                  if (isQuotaExceeded) {
                    res.statusCode = 403;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({
                      error: "quota_exceeded",
                      message: "All provided API keys are out of searches for today — try again tomorrow!"
                    }));
                    return;
                  }

                  res.statusCode = 502;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: lastError }));
                  return;
                } catch(e) {
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: "Something went wrong" }));
                }
            } else {
              next();
            }
          });
        }
      }
    ]
  };
});
