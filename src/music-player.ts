/* ==========================================================
 Music Player Mini, Fixed Position
 Plain <audio> element + event listeners.
 ========================================================== */

import { iconPlay, iconPause, iconMusic } from './icons';

export function renderMusicPlayer(): HTMLElement {
 const player = document.createElement('div');
 player.className = 'music-player';
 player.id = 'music';

 player.innerHTML = `
 <button class="music-player-btn" id="music-toggle" aria-label="Play music">
 ${iconPlay()}
 </button>
 <div class="music-player-info">
 <span class="music-player-title">Kalyani (Remix)</span>
 <span class="music-player-status" id="music-status">Tap to play</span>
 </div>
 <div class="music-player-waveform">
 <span class="music-player-bar"></span>
 <span class="music-player-bar"></span>
 <span class="music-player-bar"></span>
 <span class="music-player-bar"></span>
 <span class="music-player-bar"></span>
 </div>
 <div class="music-player-progress" id="music-progress" style="width: 0%;"></div>
 `;

 let audio: HTMLAudioElement | null = null;
 let isPlaying = false;
 let autoPausedByVideo = false;

 const toggleBtn = player.querySelector('#music-toggle') as HTMLButtonElement;
 const statusEl = player.querySelector('#music-status') as HTMLElement;
 const progressEl = player.querySelector('#music-progress') as HTMLElement;

 const initAudio = () => {
 if (audio) return audio;
 audio = new Audio('/music/kalyani.mp3');
 audio.loop = true;
 audio.volume = 0.2; // Low ambient volume

 audio.addEventListener('timeupdate', () => {
 if (audio && audio.duration) {
 const pct = (audio.currentTime / audio.duration) * 100;
 progressEl.style.width = `${pct}%`;
 }
 });

 audio.addEventListener('play', () => {
 isPlaying = true;
 player.classList.add('playing');
 toggleBtn.innerHTML = iconPause();
 toggleBtn.setAttribute('aria-label', 'Pause music');
 statusEl.textContent = 'Playing';
 });

 audio.addEventListener('pause', () => {
 isPlaying = false;
 player.classList.remove('playing');
 toggleBtn.innerHTML = iconPlay();
 toggleBtn.setAttribute('aria-label', 'Play music');
 statusEl.textContent = 'Paused';
 });

 return audio;
 };

 // Manual toggle
 toggleBtn.addEventListener('click', (e) => {
 e.stopPropagation(); // prevent triggering global interaction
 const a = initAudio();
 if (isPlaying) {
 a.pause();
 autoPausedByVideo = false; // user manually paused
 } else {
 a.play().catch(() => {
 statusEl.textContent = 'Tap again';
 });
 autoPausedByVideo = false; // user manually played
 }
 });

 // Autoplay on first interaction
 const handleFirstInteraction = () => {
 if (!isPlaying) {
 const a = initAudio();
 a.play().catch(() => {});
 }
 document.removeEventListener('click', handleFirstInteraction);
 document.removeEventListener('keydown', handleFirstInteraction);
 document.removeEventListener('touchstart', handleFirstInteraction);
 };
 
 document.addEventListener('click', handleFirstInteraction);
 document.addEventListener('keydown', handleFirstInteraction);
 document.addEventListener('touchstart', handleFirstInteraction);

 // Global listeners for video playback
 document.addEventListener('play', (e) => {
 if (e.target instanceof HTMLVideoElement) {
 if (audio && isPlaying) {
 audio.pause();
 autoPausedByVideo = true;
 }
 }
 }, true);

 document.addEventListener('pause', (e) => {
 if (e.target instanceof HTMLVideoElement) {
 if (audio && autoPausedByVideo) {
 audio.play().catch(() => {});
 autoPausedByVideo = false;
 }
 }
 }, true);

 document.addEventListener('ended', (e) => {
 if (e.target instanceof HTMLVideoElement) {
 if (audio && autoPausedByVideo) {
 audio.play().catch(() => {});
 autoPausedByVideo = false;
 }
 }
 }, true);

 return player;
}
