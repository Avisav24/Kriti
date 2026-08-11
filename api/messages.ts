/* ==========================================================
 KOKO Journal Email API Route
 Vercel Edge Function / Serverless Function
 POST /api/messages → sends via Resend
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

 const RESEND_API_KEY = process.env.RESEND_API_KEY;
 const TO_EMAIL = process.env.TO_EMAIL || 'delivered@resend.dev';

 if (!RESEND_API_KEY) {
 console.error('RESEND_API_KEY is not configured');
 return new Response(
 JSON.stringify({
 error: "The email service isn't set up yet your message is saved locally. Try again later, or text me directly.",
 }),
 { status: 503, headers: { 'Content-Type': 'application/json' } }
 );
 }

 const timestamp = body.timestamp
 ? new Date(body.timestamp).toLocaleString('en-IN', {
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
 subject: ` New journal entry from Kriti ${timestamp}`,
 html: `
 <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #FAFAF8; border-radius: 12px;">
 <h2 style="font-size: 20px; color: #171412; margin-bottom: 8px;">New Journal Entry</h2>
 <p style="font-size: 13px; color: #6F6A66; margin-bottom: 24px;">${timestamp}</p>
 <div style="font-size: 16px; color: #171412; line-height: 1.8; white-space: pre-wrap; padding: 24px; background: white; border: 1px solid #E7E4E1; border-radius: 8px;">
${body.message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
 </div>
 <p style="font-size: 12px; color: #6F6A66; margin-top: 24px; text-align: center;">
 Sent from Kriti's Little Place 
 </p>
 </div>
 `,
 }),
 });

 if (!emailResponse.ok) {
 const errorText = await emailResponse.text();
 console.error('Resend API error:', errorText);
 return new Response(
 JSON.stringify({
 error: "Didn't send the email service had a hiccup. Your message is saved locally, so try again in a moment.",
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
 error: "Something went wrong your message is saved locally. Try again, or text me directly if it keeps failing.",
 }),
 { status: 500, headers: { 'Content-Type': 'application/json' } }
 );
 }
}

// Vercel config
export const config = {
 runtime: 'edge',
};
