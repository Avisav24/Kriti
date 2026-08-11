/* ==========================================================
 When You Need Me Toggle Responses
 ========================================================== */

import { needMeResponses } from '../content';

export function renderNeedMe(): HTMLElement {
 const section = document.createElement('section');
 section.className = 'need-me-section'; // removed generic .section to allow full bleed
 section.id = 'need-me';

 const togglesHTML = needMeResponses
 .map(
 (item) => `
 <div class="surface-card need-me-toggle observe-fade" data-need-id="${item.id}">
 <div class="need-me-toggle-header">
 <span class="need-me-toggle-emoji">${item.emoji}</span>
 <span class="need-me-toggle-label">${item.label}</span>
 </div>
 <div class="need-me-response">
 <p class="need-me-response-text">${item.response}</p>
 </div>
 </div>
 `
 )
 .join('');

 section.innerHTML = `
 <div class="section need-me-inner">
   <div class="section-header">
   <span class="section-eyebrow observe-fade">I'm always here</span>
   <h2 class="section-title observe-fade" data-fade-delay="1">When You Need Me</h2>
   <p class="section-description observe-fade" data-fade-delay="2">
   Tap what you're feeling I have something to say.
   </p>
   </div>
   <div class="need-me-grid">
   ${togglesHTML}
   </div>
 </div>
 `;

 // Toggle logic plain DOM state
 section.querySelectorAll('.need-me-toggle').forEach((toggle) => {
 toggle.addEventListener('click', () => {
 const isActive = toggle.classList.contains('active');

 // Close all others
 section.querySelectorAll('.need-me-toggle.active').forEach((t) => {
 t.classList.remove('active');
 });

 // Toggle current
 if (!isActive) {
 toggle.classList.add('active');
 }
 });
 });

 return section;
}
