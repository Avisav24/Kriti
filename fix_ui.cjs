const fs = require('fs');

// 1. Fix music-player.ts (Remove square art container)
let tsContent = fs.readFileSync('src/music-player.ts', 'utf-8');

const tsToReplace = `      <div class="music-mini-art-container">
        <img class="music-mini-art" id="music-art" src="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100%' height='100%' fill='%230A58FF'/><text x='50%' y='55%' font-size='40' text-anchor='middle' dominant-baseline='middle'>🎵</text></svg>" alt="">
      </div>`;

if (tsContent.includes(tsToReplace)) {
  tsContent = tsContent.replace(tsToReplace, '');
  // Also remove updateNowPlayingMeta updating artEl since it no longer exists
  tsContent = tsContent.replace(/const artEl = player\.querySelector\('#music-art'\) as HTMLImageElement;\\n/, '');
  tsContent = tsContent.replace(/artEl\.src = thumbUrl;\\n/, '');
  tsContent = tsContent.replace(/artEl\.src = fallbackSrc;\\n/, '');
  fs.writeFileSync('src/music-player.ts', tsContent);
  console.log('Fixed music-player.ts');
}

// 2. Rewrite music-player.css
const cssContent = `/* ==========================================================
 Music Player (mini, fixed position)
 ========================================================== */

.music-player {
  position: fixed;
  bottom: var(--space-xl);
  right: var(--space-xl);
  width: 340px;
  background: var(--structural-white);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding: var(--space-md);
  z-index: 150;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.music-player:hover {
  transform: scale(1.02);
  box-shadow: var(--shadow-xl);
}

/* Mini Player Top Area */
.music-mini-top {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.music-mini-info {
  flex: 1;
  min-width: 0;
}

.music-mini-title-container {
  display: flex;
  align-items: center;
}

.music-mini-title {
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--ink);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.music-mini-channel {
  font-family: var(--font-body);
  font-size: 0.75rem;
  color: var(--body-text);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Rotating CD */
.music-mini-cd {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: repeating-radial-gradient(
    #111 0,
    #111 2px,
    #2a2a2a 4px
  );
  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  animation: spinCd 4s linear infinite;
  animation-play-state: paused;
}

.music-player.playing .music-mini-cd {
  animation-play-state: running;
}

.music-mini-cd-art {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid rgba(255, 255, 255, 0.4);
}

@keyframes spinCd {
  to { transform: rotate(360deg); }
}

/* Progress */
.music-mini-progress {
  display: flex;
  align-items: center;
  gap: 8px;
}

.music-mini-time {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: var(--body-text);
  min-width: 32px;
}

.music-mini-time:first-child {
  text-align: right;
}

.music-mini-scrubber {
  flex: 1;
  -webkit-appearance: none;
  height: 4px;
  background: var(--border);
  border-radius: 2px;
  outline: none;
  cursor: pointer;
}

.music-mini-scrubber::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--ink);
  cursor: pointer;
}

/* Controls */
.music-mini-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-xs);
}

.music-mini-btn {
  background: none;
  border: none;
  color: var(--ink);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  transition: background 0.2s, transform 0.2s;
}

.music-mini-btn:hover {
  background: rgba(0,0,0,0.05);
}

.music-mini-btn svg {
  width: 18px;
  height: 18px;
}

.music-mini-btn.play-btn {
  background: var(--ink);
  color: var(--structural-white);
}

.music-mini-btn.play-btn:hover {
  transform: scale(1.05);
}

.music-mini-btn.active {
  color: var(--accent-pink);
}

/* Mobile Horizontal Bar */
@media (max-width: 768px) {
  .music-player {
    bottom: var(--space-sm);
    left: var(--space-sm);
    right: var(--space-sm);
    width: auto;
    max-width: none;
    flex-direction: row;
    padding: var(--space-sm) var(--space-md);
    border-radius: var(--radius-full);
  }
  .music-mini-top {
    flex: 1;
  }
  .music-mini-progress {
    display: none;
  }
  .music-mini-controls {
    gap: 4px;
  }
  .music-mini-btn {
    width: 28px;
    height: 28px;
  }
}

/* ==========================================================
   Full Screen Player Dialog
   ========================================================== */
.music-full-player {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100dvh;
  margin: 0;
  padding: 0;
  border: none;
  background: linear-gradient(135deg, #fdfbf7 0%, #f6efe9 100%);
  color: var(--ink);
  z-index: 10000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.4s ease, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.music-full-player[open] {
  opacity: 1;
  transform: translateY(0);
}

.music-full-player::backdrop {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
}

/* Header */
.music-full-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-lg) var(--space-md);
  position: relative;
  z-index: 2;
}

.music-full-header-text {
  text-align: center;
}

.music-full-header-label {
  font-family: var(--font-body);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.7;
}

.music-full-header-title {
  font-family: var(--font-heading);
  font-size: 1rem;
  margin: 0;
}

.music-full-header-actions {
  display: flex;
  gap: 8px;
}

.music-full-btn {
  background: none;
  border: none;
  color: var(--ink);
  padding: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s, transform 0.2s;
}

.music-full-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  transform: scale(1.1);
}

.music-full-btn svg {
  width: 24px;
  height: 24px;
}

/* Art Section */
.music-full-art-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-md);
  position: relative;
  z-index: 2;
}

.music-full-cd {
  width: 85vw;
  max-width: 320px;
  height: 85vw;
  max-height: 320px;
  border-radius: 50%;
  background: repeating-radial-gradient(
    #111 0,
    #111 2px,
    #2a2a2a 4px
  );
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  animation: spinCd 10s linear infinite;
  animation-play-state: paused;
}

.music-full-player.playing .music-full-cd {
  animation-play-state: running;
}

.music-full-cd-art {
  width: 40%;
  height: 40%;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #111;
}

/* Info Section */
.music-full-info {
  text-align: center;
  padding: 0 var(--space-xl);
  margin-bottom: var(--space-xl);
  position: relative;
  z-index: 2;
}

.music-full-title {
  font-family: var(--font-heading);
  font-size: 1.5rem;
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.music-full-channel {
  font-family: var(--font-body);
  font-size: 1rem;
  opacity: 0.7;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Bottom Section */
.music-full-bottom-section {
  padding: 0 var(--space-xl) 80px var(--space-xl);
  position: relative;
  z-index: 2;
}

.music-full-progress {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: var(--space-xl);
}

.music-full-time-row {
  display: flex;
  justify-content: space-between;
}

.music-full-time {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  opacity: 0.6;
}

.music-full-scrubber {
  -webkit-appearance: none;
  width: 100%;
  height: 6px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
  outline: none;
  cursor: pointer;
}

.music-full-scrubber::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--ink);
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  cursor: pointer;
  transition: transform 0.2s;
}

.music-full-scrubber::-webkit-slider-thumb:hover {
  transform: scale(1.3);
}

/* Controls */
.music-full-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 320px;
  margin: 0 auto;
}

.music-full-ctrl-btn {
  background: none;
  border: none;
  color: var(--ink);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s, color 0.2s;
}

.music-full-ctrl-btn svg {
  width: 24px;
  height: 24px;
}

.music-full-ctrl-btn:hover {
  transform: scale(1.1);
}

.music-full-ctrl-btn.active {
  color: var(--accent-pink);
}

.music-full-ctrl-btn.play-btn {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--ink);
  color: white;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.music-full-ctrl-btn.play-btn svg {
  width: 32px;
  height: 32px;
}

.music-full-ctrl-btn.play-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(0,0,0,0.3);
}

/* Background Waves */
.music-full-waves {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 25vh;
  z-index: 1;
  pointer-events: none;
  overflow: hidden;
}

.music-full-wave {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 200%;
  height: 100%;
  background-repeat: repeat-x;
  background-size: 50% 100%;
}

.wave1 {
  background-image: url('data:image/svg+xml;utf8,<svg viewBox="0 0 1440 320" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><path fill="%23E092A2" fill-opacity="0.4" d="M0,160L48,170.7C96,181,192,203,288,208C384,213,480,203,576,192C672,181,768,171,864,181.3C960,192,1056,224,1152,213.3C1248,203,1344,149,1392,122.7L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>');
  animation: moveWave 12s linear infinite;
}

.wave2 {
  background-image: url('data:image/svg+xml;utf8,<svg viewBox="0 0 1440 320" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><path fill="%23E092A2" fill-opacity="0.6" d="M0,256L48,245.3C96,235,192,213,288,213.3C384,213,480,235,576,218.7C672,203,768,149,864,144C960,139,1056,181,1152,197.3C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>');
  animation: moveWave 8s linear infinite reverse;
}

@keyframes moveWave {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

/* Desktop Styles */
@media (min-width: 769px) {
  .music-full-player {
    width: 400px;
    height: 700px;
    margin: auto;
    border-radius: var(--radius-lg);
    box-shadow: 0 20px 40px rgba(0,0,0,0.3);
  }
}
`

fs.writeFileSync('src/styles/components/music-player.css', cssContent);
console.log('Fixed music-player.css');
