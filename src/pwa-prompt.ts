/* ==========================================================
 PWA Install Prompt
 Listens for beforeinstallprompt, shows install banner.
 ========================================================== */

import { iconDownload, iconX } from './icons';

interface BeforeInstallPromptEvent extends Event {
 prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function initPwaPrompt(): void {
  let deferredPrompt: BeforeInstallPromptEvent | null = null;
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  // Capture the native install prompt event if it fires
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
  });

  // Always show our custom UI after a short delay (regardless of device or PWA state)
  setTimeout(() => {
    showPrompt();
  }, 1500);

  function showPrompt() {
    // Temporarily disabled so you can test it on every page reload without having to clear your session!
    // if (sessionStorage.getItem('koko-pwa-dismissed')) return;
    
    if (document.getElementById('pwa-prompt')) return; // Don't show twice

    const prompt = document.createElement('div');
    prompt.className = 'pwa-prompt';
    prompt.id = 'pwa-prompt';

    prompt.innerHTML = `
      <div class="pwa-prompt-content">
        <span class="pwa-prompt-title">Add to Home Screen</span>
        <span class="pwa-prompt-description">Keep Kriti's Little Place one tap away</span>
      </div>
      <div class="pwa-prompt-actions">
        <button class="btn-primary pwa-prompt-install" id="pwa-install">
          ${iconDownload()} Install
        </button>
        <button class="pwa-prompt-dismiss" id="pwa-dismiss" aria-label="Dismiss">
          ${iconX()}
        </button>
      </div>
    `;

    document.body.appendChild(prompt);

    const installBtn = prompt.querySelector('#pwa-install') as HTMLButtonElement;
    const dismissBtn = prompt.querySelector('#pwa-dismiss') as HTMLButtonElement;

    installBtn.addEventListener('click', async () => {
      if (deferredPrompt) {
        // Trigger the native Android/Chrome install prompt
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          removePrompt(prompt);
        }
        deferredPrompt = null;
      } else if (isIOS) {
        alert('To install on iOS: tap the Share icon at the bottom of your screen and select "Add to Home Screen".');
        removePrompt(prompt);
      } else {
        // Fallback if they are on a desktop browser or Android browser that doesn't support the API
        alert('To install: click the Install icon in your browser address bar or use the browser menu to "Add to Home Screen".');
        removePrompt(prompt);
      }
    });

    dismissBtn.addEventListener('click', () => {
      sessionStorage.setItem('koko-pwa-dismissed', 'true');
      removePrompt(prompt);
    });

    // Automatically vanish after 3 seconds
    setTimeout(() => {
      if (document.getElementById('pwa-prompt')) {
        removePrompt(prompt);
      }
    }, 3000);
  }

  function removePrompt(el: HTMLElement) {
    el.classList.add('pwa-prompt-exit');
    setTimeout(() => el.remove(), 300);
  }
}
