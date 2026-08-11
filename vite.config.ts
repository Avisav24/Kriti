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
                  const RESEND_API_KEY = env.RESEND_API_KEY;
                  const TO_EMAIL = env.TO_EMAIL || 'delivered@resend.dev';
                  
                  if (!RESEND_API_KEY) {
                    res.statusCode = 503;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: "The email service isn't set up yet" }));
                    return;
                  }
                  
                  const timestamp = data.timestamp
                    ? new Date(data.timestamp).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      })
                    : new Date().toLocaleString('en-IN');
                    
                  const emailResponse = await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                      Authorization: `Bearer ${RESEND_API_KEY}`,
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      from: 'Kriti <onboarding@resend.dev>',
                      to: [TO_EMAIL],
                      subject: `💌 New journal entry from Kriti — ${timestamp}`,
                      html: `
                        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #FAFAF8; border-radius: 12px;">
                          <h2 style="font-size: 20px; color: #171412; margin-bottom: 8px;">New Journal Entry</h2>
                          <p style="font-size: 13px; color: #6F6A66; margin-bottom: 24px;">${timestamp}</p>
                          <div style="font-size: 16px; color: #171412; line-height: 1.8; white-space: pre-wrap; padding: 24px; background: white; border: 1px solid #E7E4E1; border-radius: 8px;">
                            ${data.message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
                          </div>
                          <p style="font-size: 12px; color: #6F6A66; margin-top: 24px; text-align: center;">
                            Sent from Kriti's Little Place 💗
                          </p>
                        </div>
                      `,
                    }),
                  });
                  
                  if (!emailResponse.ok) {
                    const errorText = await emailResponse.text();
                    console.error('Resend API error:', errorText);
                    res.statusCode = 502;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: "Didn't send — the email service had a hiccup." }));
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
