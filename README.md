<p align="center">
  <strong>💙</strong>
</p>
<h1 align="center">Kriti's Little Place</h1>
<p align="center">
  <em>A quiet corner of the internet — filled with love, letters, and comfort.</em>
</p>
<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-6.x-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/PWA-installable-5A0FC8?style=flat-square&logo=pwa&logoColor=white" alt="PWA" />
  <img src="https://img.shields.io/badge/deploy-Vercel-000?style=flat-square&logo=vercel&logoColor=white" alt="Vercel" />
</p>
---
**KOKO** is a private, passphrase-protected Progressive Web App built as a love letter. It's designed to be a personal comfort space for one person — filled with handwritten-style letters, comfort videos, a journal that sends entries via Telegram, a full music player with YouTube search, and a "reasons I love you" card deck.
Zero frameworks. Vanilla TypeScript, rendered entirely with DOM APIs. Styled with custom CSS and a hand-crafted design system.
---
## ✨ Features
### 🔒 Access Gate
- Client-side passphrase authentication using the **Web Crypto API** (SHA-256 hashing).
- Passphrase hash stored in a `VITE_ACCESS_PASSPHRASE_HASH` env var — the actual passphrase never leaves the user's device.
- Access state persisted in `localStorage` so returning visitors skip the gate.
### 🎬 Cinematic Landing
- Full-screen hero with an ambient looping background video (`/videos/ambient-hero-loop.mp4`).
- Connection-aware: gracefully degrades on slow networks (2G/3G/save-data).
- Smooth fade-in/rise animations with a "Enter your little place" CTA.
- Landing is shown once per session (`sessionStorage`).
### 📊 Dashboard
- Card grid with emoji-led navigation to every section: Letters, Videos, Journal, Love Reasons, Need Me.
