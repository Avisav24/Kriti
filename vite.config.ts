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
            } else {
              next();
            }
          });
        }
      }
    ]
  };
});
