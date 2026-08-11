import { isSlowConnection } from './connection';

export function renderBackgroundVideo(): HTMLElement {
  const container = document.createElement('div');
  container.id = 'ambient-background';
  
  container.innerHTML = `
    <video id="bg-video" class="bg-video" autoplay loop muted playsinline preload="auto" poster="/images/hero-static.png">
      <source src="/videos/ambient-hero-loop.mp4" type="video/mp4" />
    </video>
    <div class="bg-overlay"></div>
  `;

  return container;
}
