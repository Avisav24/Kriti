/* ==========================================================
 Navigation
 Sticky, backdrop-blur, scroll spy, mobile drawer.
 ========================================================== */

import { iconHeart, iconMenu, iconX } from './icons';

const NAV_ITEMS = [
 { label: 'Home', href: '#dashboard' },
 { label: 'Videos', href: '#comfort-videos' },
 { label: 'Letters', href: '#open-when' },
 { label: 'Need Me', href: '#need-me' },
 { label: 'Journal', href: '#journal' },
 { label: 'Love', href: '#love-reasons' },
];

export function renderNav(): HTMLElement {
 const nav = document.createElement('nav');
 nav.className = 'nav';
 nav.id = 'main-nav';

 const linksHTML = NAV_ITEMS.map(
 (item) =>
 `<a href="${item.href}" class="nav-link" data-section="${item.href.slice(1)}">${item.label}</a>`
 ).join('');

 const drawerLinksHTML = NAV_ITEMS.map(
 (item) =>
 `<a href="${item.href}" class="nav-drawer-link" data-section="${item.href.slice(1)}">${item.label}</a>`
 ).join('');

 nav.innerHTML = `
 <a href="#dashboard" class="nav-brand">
 <span class="nav-heart heartbeat">${iconHeart('nav-heart')}</span>
 <span class="nav-wordmark">Kriti's Little Place</span>
 </a>
 <div class="nav-links">${linksHTML}</div>
 <button class="nav-hamburger" id="nav-hamburger" aria-label="Open menu">
 ${iconMenu()}
 </button>
 <div class="nav-drawer-backdrop" id="nav-drawer-backdrop"></div>
 <div class="nav-drawer" id="nav-drawer">
 <button class="nav-drawer-close" id="nav-drawer-close" aria-label="Close menu">
 ${iconX()}
 </button>
 ${drawerLinksHTML}
 </div>
 `;

 // Scroll state blur/border after 50px
 const SCROLL_THRESHOLD = 50;
 const updateScrollState = () => {
 if (window.scrollY > SCROLL_THRESHOLD) {
 nav.classList.add('scrolled');
 } else {
 nav.classList.remove('scrolled');
 }
 };
 window.addEventListener('scroll', updateScrollState, { passive: true });
 updateScrollState();

 // Active section detection reverse-iterate
 const sectionIds = NAV_ITEMS.map((item) => item.href.slice(1));
 const navLinks = nav.querySelectorAll('.nav-link');
 const drawerLinks = nav.querySelectorAll('.nav-drawer-link');

 const updateActiveSection = () => {
 const scrollY = window.scrollY + 100;

 for (let i = sectionIds.length - 1; i >= 0; i--) {
 const section = document.getElementById(sectionIds[i]);
 if (section && section.offsetTop <= scrollY) {
 navLinks.forEach((link, j) => {
 link.classList.toggle('active', j === i);
 });
 drawerLinks.forEach((link, j) => {
 link.classList.toggle('active', j === i);
 });
 break;
 }
 }
 };
 window.addEventListener('scroll', updateActiveSection, { passive: true });

 // Mobile drawer toggle
 const hamburger = nav.querySelector('#nav-hamburger') as HTMLButtonElement;
 const drawer = nav.querySelector('#nav-drawer') as HTMLElement;
 const backdrop = nav.querySelector('#nav-drawer-backdrop') as HTMLElement;
 const drawerClose = nav.querySelector('#nav-drawer-close') as HTMLButtonElement;

 const openDrawer = () => {
 drawer.classList.add('open');
 backdrop.classList.add('open');
 document.body.style.overflow = 'hidden';
 };

 const closeDrawer = () => {
 drawer.classList.remove('open');
 backdrop.classList.remove('open');
 document.body.style.overflow = '';
 };

 hamburger.addEventListener('click', openDrawer);
 drawerClose.addEventListener('click', closeDrawer);
 backdrop.addEventListener('click', closeDrawer);

 // Close drawer when a link is clicked
 drawerLinks.forEach((link) => {
 link.addEventListener('click', closeDrawer);
 });

 // Smooth scroll for all nav links
 [...navLinks, ...drawerLinks].forEach((link) => {
 link.addEventListener('click', (e) => {
 e.preventDefault();
 const href = (link as HTMLAnchorElement).getAttribute('href');
 if (href) {
 const target = document.querySelector(href);
 if (target) {
 target.scrollIntoView({ behavior: 'smooth' });
 }
 }
 });
 });

 return nav;
}
