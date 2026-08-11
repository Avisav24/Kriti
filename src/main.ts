/* ==========================================================
 KOKO Main Entry Point
 Orchestrates gate → landing → main app.
 ========================================================== */

import './styles/main.css';

import { isAccessGranted, renderGate } from './gate';
import { renderLanding } from './landing';
import { renderNav } from './nav';
import { initObserver, observeAll } from './observer';
import { renderDashboard } from './sections/dashboard';
import { renderComfortVideos } from './sections/comfort-videos';
import { renderOpenWhen } from './sections/open-when';
import { renderNeedMe } from './sections/need-me';
import { renderJournal } from './sections/journal';
import { renderLoveReasons } from './sections/love-reasons';
import { renderFooter } from './sections/footer';
import { renderMusicPlayer } from './music-player';
import { initPwaPrompt } from './pwa-prompt';
import { renderBackgroundVideo } from './background-video';

const app = document.getElementById('app')!;

function mountMainApp(): void {
 // Initialize IntersectionObserver
 initObserver();

 // Nav (fixed, so add to body)
 document.body.appendChild(renderNav());

 // Main content container
 const main = document.createElement('main');

 // Section divider helper
 const divider = () => {
 const hr = document.createElement('hr');
 hr.className = 'section-divider';
 return hr;
 };

 // Mount all sections in order
 main.appendChild(renderDashboard());
 main.appendChild(divider());
 main.appendChild(renderComfortVideos());
 main.appendChild(divider());
 main.appendChild(renderOpenWhen());
 main.appendChild(divider());
 main.appendChild(renderNeedMe());
 main.appendChild(divider());
 main.appendChild(renderJournal());
 main.appendChild(divider());
 main.appendChild(renderLoveReasons());
 main.appendChild(divider());
 main.appendChild(renderFooter());

 app.appendChild(main);

 // Music player (fixed position)
 document.body.appendChild(renderMusicPlayer());

 // PWA install prompt
 initPwaPrompt();

 // Start observing all .observe-fade elements
 requestAnimationFrame(() => observeAll());

 // Register service worker
 if ('serviceWorker' in navigator) {
 navigator.serviceWorker
 .register('/sw.js')
 .catch((err) => console.warn('SW registration failed:', err));
 }
}

function showLanding(): void {
 const landing = renderLanding(() => {
 mountMainApp();
 });
 app.appendChild(landing);
}

// ---- Boot ----
function boot(): void {
 if (!isAccessGranted()) {
 // Show access gate first
 const gate = renderGate(() => {
 // After gate passes, check if first visit
 const hasVisited = sessionStorage.getItem('koko-entered');
 if (hasVisited) {
 mountMainApp();
 } else {
 showLanding();
 }
 });
 app.appendChild(gate);
 } else {
 // Already authenticated check if we should show landing
 const hasVisited = sessionStorage.getItem('koko-entered');
 if (hasVisited) {
 mountMainApp();
 } else {
 showLanding();
 }
 }
}

// Track that user has entered (skip landing on refresh)
const originalMountMainApp = mountMainApp;
const patchedMountMainApp = () => {
 sessionStorage.setItem('koko-entered', 'true');
 originalMountMainApp();
};

// Replace references actually, let's do this cleanly
function bootApp(): void {
  document.body.prepend(renderBackgroundVideo());

  if (!isAccessGranted()) {
    const gate = renderGate(() => {
      const hasVisited = sessionStorage.getItem('koko-entered');
      if (hasVisited) {
        sessionStorage.setItem('koko-entered', 'true');
        mountMainApp();
      } else {
        const landing = renderLanding(() => {
          sessionStorage.setItem('koko-entered', 'true');
          mountMainApp();
        });
        app.appendChild(landing);
      }
    });
    app.appendChild(gate);
  } else {
    const hasVisited = sessionStorage.getItem('koko-entered');
    if (hasVisited) {
      mountMainApp();
    } else {
      const landing = renderLanding(() => {
        sessionStorage.setItem('koko-entered', 'true');
        mountMainApp();
      });
      app.appendChild(landing);
    }
  }
}

bootApp();
