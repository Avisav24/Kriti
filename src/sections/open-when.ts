/* ==========================================================
 Open When Letters
 Native <dialog> modal with paper-line background, Lora body.
 ========================================================== */

import { letters, type Letter } from '../content';
import { iconX } from '../icons';

export function renderOpenWhen(): HTMLElement {
 const section = document.createElement('section');
 section.className = 'section';
 section.id = 'open-when';

 const cardsHTML = letters
 .map(
 (letter) => `
 <div class="surface-card letter-card observe-fade" data-letter-id="${letter.id}">
 <div class="letter-card-label">${letter.label}</div>
 <div class="letter-card-hint">${letter.hint}</div>
 </div>
 `
 )
 .join('');

 section.innerHTML = `
 <div class="section-header">
 <span class="section-eyebrow observe-fade">Words for your worst days</span>
 <h2 class="section-title observe-fade" data-fade-delay="1">Open When Letters</h2>
 <p class="section-description observe-fade" data-fade-delay="2">
 Each one is for a specific feeling. Open the one that fits right now.
 </p>
 </div>
 <div class="letters-grid">
 ${cardsHTML}
    </div>
  `;

  // Create a custom <div> modal instead of <dialog> to guarantee it works on all browsers
  const overlay = document.createElement('div');
  overlay.id = 'letter-modal-overlay';
  overlay.style.cssText = 'position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 9999; display: none; align-items: center; justify-content: center; backdrop-filter: blur(4px);';
  
  const modalContainer = document.createElement('div');
  modalContainer.className = 'letter-modal';
  modalContainer.style.cssText = 'position: relative; max-height: 85vh; width: 90vw; max-width: 600px; background: var(--structural-white); border-radius: var(--radius-lg); display: flex; flex-direction: column; overflow: hidden; box-shadow: var(--shadow-xl);';
  
  modalContainer.innerHTML = `
    <div class="letter-modal-header" style="display: flex; align-items: center; justify-content: space-between; padding: var(--space-lg) var(--space-xl); border-bottom: 1px solid var(--border);">
      <span class="letter-modal-title" id="letter-modal-title" style="font-family: var(--font-handwritten); font-size: 1.375rem; color: var(--ink);"></span>
      <button class="letter-modal-close" id="letter-modal-close" aria-label="Close letter" style="width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; color: var(--body-text); cursor: pointer; border: none; background: transparent;">
        ${iconX()}
      </button>
    </div>
    <div class="letter-modal-body" style="padding: var(--space-xl); overflow-y: auto; flex: 1; position: relative;">
      <div class="letter-modal-text" id="letter-modal-text" style="font-family: var(--font-emotional); font-size: 1.0625rem; color: var(--ink); line-height: 2; white-space: pre-wrap;"></div>
      <div class="letter-modal-date" id="letter-modal-date" style="font-family: var(--font-body); font-size: 0.75rem; color: var(--body-text); text-align: right; margin-top: var(--space-xl);"></div>
    </div>
  `;
  
  overlay.appendChild(modalContainer);

  // Cleanup old modal if HMR reloads
  const oldOverlay = document.getElementById('letter-modal-overlay');
  if (oldOverlay) oldOverlay.remove();
  document.body.appendChild(overlay);

  const modalTitle = modalContainer.querySelector('#letter-modal-title') as HTMLElement;
  const modalText = modalContainer.querySelector('#letter-modal-text') as HTMLElement;
  const modalDate = modalContainer.querySelector('#letter-modal-date') as HTMLElement;
  const closeBtn = modalContainer.querySelector('#letter-modal-close') as HTMLButtonElement;

  const closeModal = () => {
    overlay.style.display = 'none';
  };

  closeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeModal();
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeModal();
    }
  });

  const openLetter = (letter: Letter) => {
    modalTitle.textContent = letter.label;
    modalText.textContent = letter.body;
    modalDate.textContent = letter.date;
    overlay.style.display = 'flex';
  };

 section.querySelectorAll('.letter-card').forEach((card) => {
 card.addEventListener('click', () => {
 const letterId = (card as HTMLElement).dataset.letterId;
 const letter = letters.find((l) => l.id === letterId);
 if (letter) openLetter(letter);
 });
 });

 return section;
}
