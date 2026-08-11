/* ==========================================================
 KOKO Journal Telegram API Route
 Vercel Edge Function / Serverless Function
 POST /api/messages → sends via Telegram Bot
 ========================================================== */

// For Vercel deployment, this file lives at api/messages.ts
// and is automatically deployed as a serverless function.

interface JournalPayload {
 message: string;
 timestamp: string;
}

export default async function handler(req: Request): Promise<Response> {
 // Only accept POST
 if (req.method !== 'POST') {
 return new Response(
 JSON.stringify({ error: 'Method not allowed' }),
 { status: 405, headers: { 'Content-Type': 'application/json' } }
 );
 }

 try {
 const body: JournalPayload = await req.json();

 if (!body.message || typeof body.message !== 'string' || body.message.trim().length === 0) {
 return new Response(
 JSON.stringify({ error: 'Message is required' }),
 { status: 400, headers: { 'Content-Type': 'application/json' } }
 );
 }

 if (body.message.length > 5000) {
 return new Response(
 JSON.stringify({ error: 'Message too long (max 5000 characters)' }),
 { status: 400, headers: { 'Content-Type': 'application/json' } }
 );
 }

 const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8806714140:AAE5RC6qQDKyMulxKz6JLUjgyM5DDcXr3FI';
 const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '6541727849';

 if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
 console.error('Telegram config is missing');
 return new Response(
 JSON.stringify({
 error: "The messaging service isn't set up yet. Your message is saved locally. Try again later, or text me directly.",
 }),
 { status: 503, headers: { 'Content-Type': 'application/json' } }
 );
 }

 const timestamp = body.timestamp || 'Unknown Time';

 const telegramMessage = `💌 *New journal entry from Kriti*
_Sent ${timestamp}_

${body.message}`;

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
 return new Response(
 JSON.stringify({
 error: "Didn't send. Telegram service had a hiccup. Your message is saved locally, so try again in a moment.",
 }),
 { status: 502, headers: { 'Content-Type': 'application/json' } }
 );
 }

 return new Response(
 JSON.stringify({ success: true }),
 { status: 200, headers: { 'Content-Type': 'application/json' } }
 );
 } catch (err) {
 console.error('Journal API error:', err);
 return new Response(
 JSON.stringify({
 error: "Something went wrong. Your message is saved locally. Try again, or text me directly if it keeps failing.",
 }),
 { status: 500, headers: { 'Content-Type': 'application/json' } }
 );
 }
}

// Vercel config
export const config = {
 runtime: 'edge',
};
