/* ==========================================================
 Cinematic Landing Adaptive Hero
 Full video on good connections, static image on slow.
 ========================================================== */

import { isSlowConnection } from './connection';

export function renderLanding(onEnter: () => void): HTMLElement {
 const landing = document.createElement('div');
 landing.className = 'landing';
 landing.id = 'landing';

 const slow = isSlowConnection();
 const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  landing.innerHTML = `
    <div class="landing-content">
      <span class="landing-eyebrow fade-rise">For Kriti, always.</span>
      <h1 class="landing-headline fade-rise-delay">
        Hey Kriti.<br/>You don't have to be<br/><em>okay all the time.</em>
      </h1>
      <p class="landing-description fade-rise-delay-2">
        This is your little place on the internet — a quiet corner filled with letters,
        comfort, and all the love I can fit into a screen. Come here whenever you need to.
        It's always open, and it's always yours.
      </p>
      <button class="btn-primary landing-cta fade-rise-delay-2" id="landing-cta">
        Enter your little place
      </button>
    </div>
  `;

  // CTA click handler
  const cta = landing.querySelector('#landing-cta') as HTMLButtonElement;
  cta.addEventListener('click', () => {
    landing.classList.add('landing-exit');
    setTimeout(() => {
      landing.remove();
      onEnter();
    }, 600);
  });

 return landing;
}
