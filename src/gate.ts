/* ==========================================================
 Access Gate
 Client-side passphrase screen using Web Crypto API.
 ========================================================== */

const STORAGE_KEY = 'koko-access';

async function hashPassphrase(passphrase: string): Promise<string> {
 const encoder = new TextEncoder();
 const data = encoder.encode(passphrase.trim().toLowerCase());
 const hashBuffer = await crypto.subtle.digest('SHA-256', data);
 const hashArray = Array.from(new Uint8Array(hashBuffer));
 return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function isAccessGranted(): boolean {
 return localStorage.getItem(STORAGE_KEY) === 'granted';
}

export function renderGate(onSuccess: () => void): HTMLElement {
 const gate = document.createElement('div');
 gate.className = 'gate';
 gate.id = 'access-gate';

 // The expected hash from env var (injected at build time by Vite)
 const expectedHash = import.meta.env.VITE_ACCESS_PASSPHRASE_HASH || '';

 gate.innerHTML = `
 <div class="gate-card">
 <span class="gate-heart"></span>
 <h1 class="gate-title">This place is just for you</h1>
 <p class="gate-subtitle">Answer the question only you'd know the answer to.</p>
 <form id="gate-form">
 <input
 type="text"
 class="gate-input"
 id="gate-input"
 placeholder="What's the answer?"
 autocomplete="off"
 autocapitalize="off"
 spellcheck="false"
 autofocus
 />
 <button type="submit" class="btn-primary gate-submit">Enter</button>
 </form>
 <p class="gate-error" id="gate-error">That's not it try again?</p>
 </div>
 `;

 // Handle form submission
 const form = gate.querySelector('#gate-form') as HTMLFormElement;
 const input = gate.querySelector('#gate-input') as HTMLInputElement;
 const error = gate.querySelector('#gate-error') as HTMLElement;

 form.addEventListener('submit', async (e) => {
 e.preventDefault();
 const value = input.value.trim();
 if (!value) return;

 // If no hash is configured, allow any input (dev mode)
 if (!expectedHash) {
 localStorage.setItem(STORAGE_KEY, 'granted');
 gate.classList.add('gate-exit');
 setTimeout(() => {
 gate.remove();
 onSuccess();
 }, 400);
 return;
 }

 const hash = await hashPassphrase(value);
 if (hash === expectedHash.toLowerCase()) {
 localStorage.setItem(STORAGE_KEY, 'granted');
 gate.classList.add('gate-exit');
 setTimeout(() => {
 gate.remove();
 onSuccess();
 }, 400);
 } else {
 error.classList.add('visible');
 input.value = '';
 input.focus();
 // Hide error after 3s
 setTimeout(() => error.classList.remove('visible'), 3000);
 }
 });

 return gate;
}
