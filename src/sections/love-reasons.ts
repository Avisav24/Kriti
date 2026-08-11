/* ==========================================================
 Love Reasons Deck
 Random card from unseen set, dot indicators, Lora quotes.
 ========================================================== */

import { loveReasons } from '../content';
import { iconRefresh } from '../icons';

export function renderLoveReasons(): HTMLElement {
 const section = document.createElement('section');
 section.className = 'love-reasons-section'; // removed generic .section to allow full bleed
 section.id = 'love-reasons';

 const seen = new Set<number>();
 let currentId = -1;

 // Pick a random unseen reason
 const getNextReason = () => {
 const unseen = loveReasons.filter((r) => !seen.has(r.id));
 if (unseen.length === 0) {
 // All seen reset
 seen.clear();
 return loveReasons[Math.floor(Math.random() * loveReasons.length)];
 }
 return unseen[Math.floor(Math.random() * unseen.length)];
 };

 const first = getNextReason();
 currentId = first.id;
 seen.add(first.id);

 const dotsHTML = loveReasons
 .map(
 (r) =>
 `<span class="love-reasons-dot${r.id === first.id ? ' active seen' : ''}" data-reason-id="${r.id}"></span>`
 )
 .join('');

 section.innerHTML = `
 <div class="section love-reasons-inner">
   <div class="section-header">
   <span class="section-eyebrow observe-fade">Because you asked</span>
   <h2 class="section-title observe-fade" data-fade-delay="1">Why I Love You</h2>
   <p class="section-description observe-fade" data-fade-delay="2">
   There are more reasons than I could ever fit here. But here are a few.
   </p>
   </div>
   <div class="love-reasons-container observe-fade" data-fade-delay="2">
   <div class="surface-card love-reasons-card" id="love-reasons-card">
   <span class="love-reasons-number" id="love-reasons-number">Reason #${first.id}</span>
   <p class="love-reasons-quote" id="love-reasons-quote">${first.text}</p>
   </div>
   <button class="btn-primary love-reasons-cta" id="love-reasons-cta">
   ${iconRefresh()} Give me another one
   </button>
   <div class="love-reasons-dots" id="love-reasons-dots">
   ${dotsHTML}
   </div>
   </div>
 </div>
 `;

 const card = section.querySelector('#love-reasons-card') as HTMLElement;
 const numberEl = section.querySelector('#love-reasons-number') as HTMLElement;
 const quoteEl = section.querySelector('#love-reasons-quote') as HTMLElement;
 const ctaBtn = section.querySelector('#love-reasons-cta') as HTMLButtonElement;
 const dots = section.querySelectorAll('.love-reasons-dot');

 const updateDots = (activeId: number) => {
 dots.forEach((dot) => {
 const id = Number((dot as HTMLElement).dataset.reasonId);
 dot.classList.toggle('active', id === activeId);
 if (seen.has(id)) dot.classList.add('seen');
 });
 };

 ctaBtn.addEventListener('click', () => {
 // Transition out
 card.classList.add('transitioning');

 setTimeout(() => {
 const next = getNextReason();
 currentId = next.id;
 seen.add(next.id);

 numberEl.textContent = `Reason #${next.id}`;
 quoteEl.textContent = next.text;
 updateDots(next.id);

 card.classList.remove('transitioning');
 }, 300);
 });

 return section;
}
