/* ==========================================================
 Comfort Videos Section
 Native <dialog> modals, connection-aware loading.
 ========================================================== */

import { comfortVideos } from '../content';
import { iconPlay, iconX } from '../icons';
import { isSlowConnection } from '../connection';

export function renderComfortVideos(): HTMLElement {
 const section = document.createElement('section');
 section.className = 'comfort-videos-section'; // removed generic .section to allow full bleed
 section.id = 'comfort-videos';

 const cardsHTML = comfortVideos
 .map(
 (video) => `
 <div class="surface-card comfort-card observe-fade" data-video-id="${video.id}">
 <span class="comfort-card-emoji float">${video.emoji}</span>
 <h3 class="comfort-card-title">${video.title}</h3>
 <p class="comfort-card-description">${video.description}</p>
 <div class="comfort-card-play">
 <div class="comfort-card-play-icon">${iconPlay()}</div>
 </div>
 </div>
 `
 )
 .join('');

 section.innerHTML = `
 <div class="section comfort-videos-inner">
   <div class="section-header">
   <span class="section-eyebrow observe-fade">Familiar voices</span>
   <h2 class="section-title observe-fade" data-fade-delay="1">Comfort Videos</h2>
   <p class="section-description observe-fade" data-fade-delay="2">
   Tap to play these are just for you.
   </p>
   </div>
   <div class="comfort-videos-grid">
   ${cardsHTML}
   </div>
 </div>
  `;

  // Create a custom <div> modal instead of <dialog> to guarantee it works on all browsers
  const overlay = document.createElement('div');
  overlay.id = 'video-modal-overlay';
  overlay.style.cssText = 'position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 9999; display: none; align-items: center; justify-content: center; backdrop-filter: blur(4px);';
  
  const modalContainer = document.createElement('div');
  modalContainer.className = 'video-modal';
  modalContainer.style.cssText = 'position: relative; max-height: 90vh; width: 95vw; max-width: 800px; background: #000; border-radius: var(--radius-lg); display: flex; flex-direction: column; overflow: hidden; box-shadow: var(--shadow-xl);';
  
  modalContainer.innerHTML = `
    <div class="video-modal-header" style="display: flex; align-items: center; justify-content: space-between; padding: var(--space-md) var(--space-lg); background: #111;">
      <span class="video-modal-title" id="video-modal-title" style="font-family: var(--font-body); font-weight: 500; font-size: 1rem; color: #FFF;"></span>
      <button class="video-modal-close" id="video-modal-close" aria-label="Close video" style="width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; color: #aaa; cursor: pointer; border: none; background: transparent;">
        ${iconX()}
      </button>
    </div>
    <div id="video-modal-content" style="flex: 1; display: flex; align-items: center; justify-content: center; background: #000;"></div>
  `;
  
  overlay.appendChild(modalContainer);

  // Cleanup old modal if HMR reloads
  const oldOverlay = document.getElementById('video-modal-overlay');
  if (oldOverlay) oldOverlay.remove();
  document.body.appendChild(overlay);

  // Dialog refs
  const modalTitle = modalContainer.querySelector('#video-modal-title') as HTMLElement;
  const modalContent = modalContainer.querySelector('#video-modal-content') as HTMLElement;
  const closeBtn = modalContainer.querySelector('#video-modal-close') as HTMLButtonElement;

  const closeModal = () => {
    const vid = modalContent.querySelector('video');
    if (vid) vid.pause();
    overlay.style.display = 'none';
    modalContent.innerHTML = '';
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

 // Open video cards
 section.querySelectorAll('.comfort-card').forEach((card) => {
    card.addEventListener('click', () => {
      const videoId = (card as HTMLElement).dataset.videoId;
      const videoData = comfortVideos.find((v) => v.id === videoId);
      if (!videoData) return;

      modalTitle.textContent = videoData.title;
      loadVideo(videoData.videoSrc, videoData.posterSrc);
      overlay.style.display = 'flex';
    });
  });

 function loadVideo(src: string, poster: string) {
 modalContent.innerHTML = `
 <video controls autoplay playsinline poster="${poster}" style="width:100%; max-height:85vh; object-fit:contain; background:black; display:block; border-radius:8px;">
 <source src="${src}" type="video/mp4" />
 Your browser doesn't support video playback.
 </video>
 `;
 }

 return section;
}
