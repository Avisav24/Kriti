/* ==========================================================
 Shared IntersectionObserver
 One observer instance for all scroll-triggered animations.
 ========================================================== */

let observer: IntersectionObserver | null = null;

export function initObserver(): void {
 if (observer) return;

 // Respect reduced motion preference
 const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 if (prefersReducedMotion) {
 // Show everything immediately
 document.querySelectorAll('.observe-fade').forEach((el) => {
 el.classList.remove('observe-fade');
 });
 return;
 }

 observer = new IntersectionObserver(
 (entries) => {
 entries.forEach((entry) => {
 if (entry.isIntersecting) {
 const el = entry.target;
 // Check for stagger delay data attribute
 const delay = el.getAttribute('data-fade-delay');
 if (delay === '1') {
 el.classList.add('fade-rise-delay');
 } else if (delay === '2') {
 el.classList.add('fade-rise-delay-2');
 } else {
 el.classList.add('fade-rise');
 }
 el.classList.remove('observe-fade');
 observer!.unobserve(el);
 }
 });
 },
 {
 threshold: 0.1,
 rootMargin: '0px 0px -40px 0px',
 }
 );
}

export function observe(el: Element): void {
 if (observer) {
 observer.observe(el);
 } else {
 // Reduced motion already visible
 el.classList.remove('observe-fade');
 }
}

export function observeAll(container?: Element): void {
 const root = container || document;
 root.querySelectorAll('.observe-fade').forEach((el) => {
 observe(el);
 });
}
