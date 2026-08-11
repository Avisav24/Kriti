/* ==========================================================
 Journal Write & Send to Email
 Native <form>, localStorage draft persistence, specific error states.
 ========================================================== */

import { iconSend } from '../icons';

const DRAFT_KEY = 'koko-journal-draft';

export function renderJournal(): HTMLElement {
 const section = document.createElement('section');
 section.className = 'section';
 section.id = 'journal';

 // Restore any saved draft
 const savedDraft = localStorage.getItem(DRAFT_KEY) || '';

 section.innerHTML = `
 <div class="section-header">
 <span class="section-eyebrow observe-fade">Let it out</span>
 <h2 class="section-title observe-fade" data-fade-delay="1">Your Journal</h2>
 <p class="section-description observe-fade" data-fade-delay="2">
 Write whatever you're feeling. It goes straight to me no one else sees it.
 </p>
 </div>
 <div class="journal-container observe-fade" data-fade-delay="2">
 <form class="journal-form" id="journal-form">
 <textarea
 class="journal-textarea"
 id="journal-textarea"
 placeholder="What's on your mind, Kriti?"
 maxlength="5000"
 rows="6"
 >${savedDraft}</textarea>
 <div class="journal-footer">
 <div>
 <span class="journal-char-count" id="journal-char-count">${savedDraft.length}/5000</span>
 ${savedDraft ? '<span class="journal-draft-notice"> Draft restored</span>' : ''}
 </div>
 <button type="submit" class="btn-primary journal-submit" id="journal-submit">
 ${iconSend()} Let it out
 </button>
 </div>
 </form>
 <div id="journal-status"></div>
 </div>
 `;

 const form = section.querySelector('#journal-form') as HTMLFormElement;
 const textarea = section.querySelector('#journal-textarea') as HTMLTextAreaElement;
 const charCount = section.querySelector('#journal-char-count') as HTMLElement;
 const submitBtn = section.querySelector('#journal-submit') as HTMLButtonElement;
 const statusDiv = section.querySelector('#journal-status') as HTMLElement;

 // Character count + draft save
 textarea.addEventListener('input', () => {
 charCount.textContent = `${textarea.value.length}/5000`;
 // Save draft
 localStorage.setItem(DRAFT_KEY, textarea.value);
 });

 // Submit handler
 form.addEventListener('submit', async (e) => {
 e.preventDefault();

 const message = textarea.value.trim();
 if (!message) return;

 submitBtn.disabled = true;
 submitBtn.textContent = 'Sending...';
 statusDiv.innerHTML = '';

 try {
 const response = await fetch('/api/messages', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 message,
 timestamp: new Date().toISOString(),
 }),
 });

 if (!response.ok) {
 const errorData = await response.json().catch(() => ({}));
 throw new Error(errorData.error || 'Failed to send');
 }

 // Success
 localStorage.removeItem(DRAFT_KEY);
 textarea.value = '';
 charCount.textContent = '0/5000';

 statusDiv.innerHTML = `
 <div class="journal-status journal-status-success">
 Sent! Your words are on their way to me. Thank you for sharing what you're feeling.
 </div>
 `;
 } catch (err) {
 // Specific error message per §0.4
 statusDiv.innerHTML = `
 <div class="journal-status journal-status-error">
 <strong>Didn't send but your words are safe.</strong>
 Your message is still saved here. Try sending again in a moment, or come back later 
 it'll still be here waiting. If it keeps failing, you can always text me directly. 
 </div>
 `;
 } finally {
 submitBtn.disabled = false;
 submitBtn.innerHTML = `${iconSend()} Let it out`;
 }
 });

 return section;
}
