/* ==========================================================
 Dashboard / Welcome Section
 ========================================================== */

import { dashboardCards } from '../content';

export function renderDashboard(): HTMLElement {
 const section = document.createElement('section');
 section.className = 'section dashboard';
 section.id = 'dashboard';

 const cardsHTML = dashboardCards
 .map(
 (card) => `
 <a href="#${card.sectionId}" class="surface-card dashboard-card observe-fade" data-section-link="${card.sectionId}">
 <span class="dashboard-card-emoji">${card.emoji}</span>
 <h3 class="dashboard-card-title">${card.title}</h3>
 <p class="dashboard-card-description">${card.description}</p>
 </a>
 `
 )
 .join('');

 section.innerHTML = `
 <div class="section-header">
 <span class="section-eyebrow observe-fade">Welcome home</span>
 <h2 class="section-title observe-fade" data-fade-delay="1">What do you need today?</h2>
 <p class="section-description observe-fade" data-fade-delay="2">
 Everything here is for you. Pick whatever feels right, or just scroll and explore.
 </p>
 </div>
 <div class="dashboard-grid">
 ${cardsHTML}
 </div>
 `;

 // Smooth-scroll links
 section.querySelectorAll('[data-section-link]').forEach((card) => {
 card.addEventListener('click', (e) => {
 e.preventDefault();
 const targetId = (card as HTMLElement).getAttribute('data-section-link');
 if (targetId) {
 const target = document.getElementById(targetId);
 if (target) {
 target.scrollIntoView({ behavior: 'smooth' });
 }
 }
 });
 });

 return section;
}
