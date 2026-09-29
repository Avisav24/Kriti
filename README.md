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

**KOKO** is a private, passphrase-protected Progressive Web App built as a love letter. It is designed to be a personal comfort space for one person — filled with handwritten-style letters, comfort videos, journal entries, reminders of love, and a place to ask for support when needed.

The app uses zero frameworks: it is built with vanilla TypeScript, rendered entirely with DOM APIs, and styled with custom CSS and a hand-crafted design system.

## ✨ Features

### 🔒 Access Gate

- Client-side passphrase authentication using the **Web Crypto API** and SHA-256 hashing.
- The expected passphrase hash is provided through the `VITE_ACCESS_PASSPHRASE_HASH` environment variable.
- The original passphrase is never stored in the source code or sent to a server.
- Access state is persisted in `localStorage`, allowing returning visitors to skip the gate.

> This is a client-side privacy feature, not server-side security. Anyone with access to the deployed application and its environment can inspect the client bundle.

### 🎬 Cinematic Landing

- Full-screen hero with an ambient looping background video at `/videos/ambient-hero-loop.mp4`.
- Connection-aware behavior that gracefully degrades on slow networks, including 2G, 3G, and Save-Data connections.
- Smooth fade-in and rise animations with an “Enter your little place” call to action.
- The landing screen is shown once per browser session using `sessionStorage`.

### 📊 Dashboard

- Card-based navigation to each section of the app:
  - 💌 Letters
  - 🎬 Videos
  - 📔 Journal
  - 💙 Love Reasons
  - 🤍 Need Me

### 📱 Installable PWA

- Designed to work as an installable Progressive Web App.
- Responsive layout for desktop and mobile screens.
- Uses Vite for local development and production builds.

## 🛠️ Tech Stack

- **TypeScript** with strict type checking
- **Vite** for development and bundling
- **Vanilla DOM APIs** for rendering and interaction
- **Custom CSS** for the visual design system
- **Web Crypto API** for passphrase hashing
- **Vercel** for deployment

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or newer
- npm

### Installation

```bash
npm install
```

### Configure the passphrase hash

Create a `.env.local` file in the project root:

```env
VITE_ACCESS_PASSPHRASE_HASH=your_sha256_hash_here
```

The value must be the SHA-256 hash of the passphrase users should enter. Do not commit `.env.local` or any file containing a real secret.

### Start the development server

```bash
npm run dev
```

### Create a production build

```bash
npm run build
```

### Preview the production build locally

```bash
npm run preview
```

## 📁 Static Assets

Place the landing-page background video at:

```text
public/videos/ambient-hero-loop.mp4
```

Vite serves files in `public/` from the site root, so the video is referenced in the app as `/videos/ambient-hero-loop.mp4`.

## ☁️ Deployment

The project can be deployed to Vercel or any static host that supports Vite builds.

When deploying, configure the following environment variable in the hosting provider:

```text
VITE_ACCESS_PASSPHRASE_HASH
```

The build command is:

```bash
npm run build
```

## 📜 Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check and create a production build |
| `npm run preview` | Preview the production build locally |

---

<p align="center">
  Made with 💙 for Kriti.
</p>
