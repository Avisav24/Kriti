/* ==========================================================
 Footer
 ========================================================== */

import { iconHeart } from '../icons';

export function renderFooter(): HTMLElement {
 const footer = document.createElement('footer');
 footer.className = 'footer';
 footer.id = 'footer';

 footer.innerHTML = `
 <div class="heartbeat">${iconHeart('footer-heart')}</div>
  <p class="footer-message">
  Crafted for you out of late nights and a whole lot of missing you. Every word here is true, and you are so deeply loved.
  </p>
  <p class="footer-brand">Kriti's Little Place</p>
  <p class="footer-note">— Your Abhinav</p>
 `;

 return footer;
}
