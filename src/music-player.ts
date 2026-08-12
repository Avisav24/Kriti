/* ==========================================================
 Music Player & YouTube Search Panel
 Dual engine: local <audio> (kalyani.mp3) + YouTube IFrame API
 ========================================================== */

import { iconPlay, iconPause, iconSearch, iconX, iconHeart, iconHeartFill, iconRepeat } from './icons';

// Types
interface YouTubeSearchResult {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
}

type PlayerEngine = 'local' | 'youtube';

// YouTube IFrame API types
declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

const SAVED_KEY = 'koko-saved-songs';

const formatTime = (seconds: number) => {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export function renderMusicPlayer(): HTMLElement {
  // 1. Create Dark Mini-Player Overlay
  const player = document.createElement('div');
  player.className = 'music-player';
  player.id = 'music';

  player.innerHTML = `
    <div class="music-mini-top" id="music-mini-top">

      <div class="music-mini-cd" aria-hidden="true">
        <img class="music-mini-cd-art" id="music-cd-art" src="" alt="">
      </div>
      <div class="music-mini-info">
        <div class="music-mini-title-container">
          <h3 class="music-mini-title ticker-shimmer-text" id="music-title">Kalyani (Remix)</h3>
        </div>
        <p class="music-mini-channel" id="music-channel">Local Audio</p>
      </div>
    </div>
    
    <div class="music-mini-progress">
      <span class="music-mini-time" id="music-current">0:00</span>
      <input type="range" class="music-mini-scrubber" id="music-scrubber" value="0" min="0" max="100" step="0.1" aria-label="Seek">
      <span class="music-mini-time" id="music-total">0:00</span>
    </div>

    <div class="music-mini-controls">
      <button class="music-mini-btn" id="music-loop-toggle" aria-label="Toggle loop" title="Loop">
        ${iconRepeat()}
      </button>
      <button class="music-mini-btn" id="music-prev" aria-label="Previous" title="Previous">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
      </button>
      <button class="music-mini-btn play-btn" id="music-toggle" aria-label="Play music" title="Play">
        ${iconPlay()}
      </button>
      <button class="music-mini-btn" id="music-next" aria-label="Next" title="Next">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
      </button>
      <button class="music-mini-btn" id="music-mini-heart" aria-label="Add to playlist" title="Save to Playlist">
        ${iconHeart()}
      </button>
      <button class="music-mini-btn" id="music-search-open" aria-label="Search" title="Search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
      </button>
    </div>
  `;

  // 2. Create Search Panel Dialog
  const dialog = document.createElement('dialog');
  dialog.className = 'music-panel-dialog';
  dialog.id = 'music-panel';
  
  dialog.innerHTML = `
    <div class="music-panel-header">
      <div class="music-panel-handle"></div>
      <div class="music-panel-search">
        ${iconSearch()}
        <input type="text" id="music-search-input" placeholder="Search for a song..." autocomplete="off">
        <button class="music-search-clear" id="music-search-clear" aria-label="Clear search" style="display: none;">
          Clear
        </button>
      </div>
      <button class="music-panel-close" id="music-panel-close" aria-label="Close panel">
        ${iconX()}
      </button>
    </div>
    <div class="music-panel-content">
      <div class="music-panel-pinned" id="music-pinned-song">
        <!-- Injected via TS -->
      </div>
      
      <div class="music-saved-header-wrapper" id="music-saved-header" style="display: none;">
        <h3 class="music-panel-section-header">Your Saved Tracks</h3>
        <div class="music-playlist-actions">
          <button class="music-play-playlist-btn" id="music-play-playlist">Play Playlist</button>
          <button class="music-clear-playlist-btn" id="music-clear-playlist">Clear</button>
        </div>
      </div>
      <ul class="music-panel-results" id="music-saved-results"></ul>
      
      <div id="music-search-state" class="music-panel-state" style="display: none;"></div>
      <ul class="music-panel-results" id="music-search-results"></ul>
    </div>
    <div id="youtube-player-container"></div>
  `;
  
  document.body.appendChild(dialog);

  // 3. Create Full Screen Player Dialog
  const fullPlayerDialog = document.createElement('dialog');
  fullPlayerDialog.className = 'music-full-player';
  fullPlayerDialog.id = 'music-full-player';
  
  fullPlayerDialog.innerHTML = `
    <div class="music-full-header">
      <button class="music-full-btn" id="music-full-close" aria-label="Close full player">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
      </button>
      <div class="music-full-header-text">
        <span class="music-full-header-label">Playing for</span>
        <h4 class="music-full-header-title">Kriti</h4>
      </div>
      <div class="music-full-header-actions">
        <button class="music-full-btn" id="music-full-search" aria-label="Search">
          ${iconSearch()}
        </button>
        <button class="music-full-btn" id="music-full-playlist" aria-label="Playlist">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15V6"/><path d="M18.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"/><path d="M12 12H3"/><path d="M16 6H3"/><path d="M12 18H3"/></svg>
        </button>
      </div>
    </div>
    
    <div class="music-full-art-section">
      <div class="music-full-cd" aria-hidden="true">
        <img class="music-full-cd-art" id="music-full-art" src="" alt="">
      </div>
    </div>
    
    <div class="music-full-info">
      <div class="music-full-title-wrapper">
        <h2 class="music-full-title ticker-shimmer-text-dark" id="music-full-title">Kalyani (Remix)</h2>
      </div>
      <p class="music-full-channel" id="music-full-channel">Local Audio</p>
    </div>
    
    <div class="music-full-bottom-section">
      <div class="music-full-progress">
        <input type="range" class="music-full-scrubber" id="music-full-scrubber" value="0" min="0" max="100" step="0.1" aria-label="Seek">
        <div class="music-full-time-row">
          <span class="music-full-time" id="music-full-current">0:00</span>
          <span class="music-full-time" id="music-full-total">0:00</span>
        </div>
      </div>
      <div class="music-full-controls">
        <button class="music-full-ctrl-btn" id="music-full-loop" aria-label="Toggle loop" title="Loop">
          ${iconRepeat()}
        </button>
        <button class="music-full-ctrl-btn" id="music-full-prev" aria-label="Previous" title="Previous">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
        </button>
        <button class="music-full-ctrl-btn play-btn" id="music-full-toggle" aria-label="Play music" title="Play">
          ${iconPlay()}
        </button>
        <button class="music-full-ctrl-btn" id="music-full-next" aria-label="Next" title="Next">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
        </button>
        <button class="music-full-ctrl-btn" id="music-full-heart" aria-label="Add to playlist" title="Save to Playlist">
          ${iconHeart()}
        </button>
      </div>
    </div>
    
    <div class="music-full-light-leaks">
      <div class="light-leak-1"></div>
      <div class="light-leak-2"></div>
      <div class="light-streak"></div>
    </div>
    <div class="music-tooltip" id="music-tooltip"></div>
  `;
  document.body.appendChild(fullPlayerDialog);

  // -- State --
  let currentEngine: PlayerEngine = 'local';
  let isPlaying = false;
  let isLooping = false;
  let isScrubbing = false;
  let currentYtVideoId: string | null = null;
  let currentYtTitle: string | null = null;
  let currentYtChannelTitle: string | null = null;
  let currentYtThumbnailUrl: string | null = null;
  let playHistory: YouTubeSearchResult[] = [];
  let savedSongs: YouTubeSearchResult[] = JSON.parse(localStorage.getItem(SAVED_KEY) || '[]');
  let defaultSong: YouTubeSearchResult | null = JSON.parse(localStorage.getItem('koko-default-song') || 'null');

  // -- Local Audio Engine --
  let audio: HTMLAudioElement | null = null;
  
  // -- YouTube Engine --
  let ytPlayer: any = null;
  let isYtApiLoaded = false;
  let isYtReady = false;
  let ytProgressInterval: number | null = null;

  // -- DOM Elements (Player) --
  const toggleBtn = player.querySelector('#music-toggle') as HTMLButtonElement;
  const prevBtn = player.querySelector('#music-prev') as HTMLButtonElement;
  const nextBtn = player.querySelector('#music-next') as HTMLButtonElement;
  const loopBtn = player.querySelector('#music-loop-toggle') as HTMLButtonElement;
  const searchOpenBtn = player.querySelector('#music-search-open') as HTMLButtonElement;
  const miniHeartBtn = player.querySelector('#music-mini-heart') as HTMLButtonElement;
  const miniTopArea = player.querySelector('#music-mini-top') as HTMLElement;
  
  const scrubber = player.querySelector('#music-scrubber') as HTMLInputElement;
  const currentEl = player.querySelector('#music-current') as HTMLElement;
  const totalEl = player.querySelector('#music-total') as HTMLElement;
  
  const titleEl = player.querySelector('#music-title') as HTMLElement;
  const channelEl = player.querySelector('#music-channel') as HTMLElement;
  const cdArtEl = player.querySelector('#music-cd-art') as HTMLImageElement;

  // -- DOM Elements (Full Player) --
  const fToggleBtn = fullPlayerDialog.querySelector('#music-full-toggle') as HTMLButtonElement;
  const fPrevBtn = fullPlayerDialog.querySelector('#music-full-prev') as HTMLButtonElement;
  const fNextBtn = fullPlayerDialog.querySelector('#music-full-next') as HTMLButtonElement;
  const fLoopBtn = fullPlayerDialog.querySelector('#music-full-loop') as HTMLButtonElement;
  const fHeartBtn = fullPlayerDialog.querySelector('#music-full-heart') as HTMLButtonElement;
  const tooltipEl = fullPlayerDialog.querySelector('#music-tooltip') as HTMLElement;
  
  let tooltipTimeout: any;
  const showTooltip = (msg: string) => {
    if (!tooltipEl) return;
    tooltipEl.textContent = msg;
    tooltipEl.classList.add('show');
    clearTimeout(tooltipTimeout);
    tooltipTimeout = setTimeout(() => {
      tooltipEl.classList.remove('show');
    }, 2000);
  };
  
  const fScrubber = fullPlayerDialog.querySelector('#music-full-scrubber') as HTMLInputElement;
  const fCurrentEl = fullPlayerDialog.querySelector('#music-full-current') as HTMLElement;
  const fTotalEl = fullPlayerDialog.querySelector('#music-full-total') as HTMLElement;
  
  const fTitleEl = fullPlayerDialog.querySelector('#music-full-title') as HTMLElement;
  const fChannelEl = fullPlayerDialog.querySelector('#music-full-channel') as HTMLElement;
  const fArtEl = fullPlayerDialog.querySelector('#music-full-art') as HTMLImageElement;
  
  const fCloseBtn = fullPlayerDialog.querySelector('#music-full-close') as HTMLButtonElement;
  const fSearchBtn = fullPlayerDialog.querySelector('#music-full-search') as HTMLButtonElement;
  const fPlaylistBtn = fullPlayerDialog.querySelector('#music-full-playlist') as HTMLButtonElement;
  
  // -- DOM Elements (Panel) --
  const closeBtn = dialog.querySelector('#music-panel-close') as HTMLButtonElement;
  const searchInput = dialog.querySelector('#music-search-input') as HTMLInputElement;
  const searchClearBtn = dialog.querySelector('#music-search-clear') as HTMLButtonElement;
  const resultsList = dialog.querySelector('#music-search-results') as HTMLElement;
  const stateContainer = dialog.querySelector('#music-search-state') as HTMLElement;
  
  const savedHeader = dialog.querySelector('#music-saved-header') as HTMLElement;
  const clearPlaylistBtn = dialog.querySelector('#music-clear-playlist') as HTMLButtonElement;
  const playPlaylistBtn = dialog.querySelector('#music-play-playlist') as HTMLButtonElement;
  const savedList = dialog.querySelector('#music-saved-results') as HTMLElement;
  
  const pinnedSong = dialog.querySelector('#music-pinned-song') as HTMLElement;

  // -- Common UI Updaters --
  const updatePillUI = (playing: boolean, titleText: string, channelText: string) => {
    if (playing) {
      player.classList.add('playing');
      fullPlayerDialog.classList.add('playing');
      toggleBtn.innerHTML = iconPause();
      fToggleBtn.innerHTML = iconPause();
    } else {
      player.classList.remove('playing');
      fullPlayerDialog.classList.remove('playing');
      toggleBtn.innerHTML = iconPlay();
      fToggleBtn.innerHTML = iconPlay();
    }
  };

  const updateHeartUI = () => {
    const isSaved = currentEngine === 'youtube' && currentYtVideoId 
      ? savedSongs.some(s => s.videoId === currentYtVideoId)
      : false;
      
    const heartIcon = isSaved ? iconHeartFill() : iconHeart();
    if (isSaved) {
      fHeartBtn.classList.add('active');
      miniHeartBtn.classList.add('active');
    } else {
      fHeartBtn.classList.remove('active');
      miniHeartBtn.classList.remove('active');
    }
    fHeartBtn.innerHTML = heartIcon;
    miniHeartBtn.innerHTML = heartIcon;
  };

  const updateNowPlayingMeta = (title: string, channel: string, thumbUrl: string) => {
    titleEl.textContent = title;
    fTitleEl.textContent = title;
    channelEl.textContent = channel;
    fChannelEl.textContent = channel;
    
    const fallbackSrc = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100%' height='100%' fill='%230A58FF'/><text x='50%' y='55%' font-size='40' text-anchor='middle' dominant-baseline='middle'>🎵</text></svg>";
    if (thumbUrl) {
      fArtEl.src = thumbUrl;
      cdArtEl.src = thumbUrl;
    } else {
      fArtEl.src = fallbackSrc;
      cdArtEl.src = fallbackSrc;
    }
  };

  const updateProgressUI = (currentTime: number, duration: number) => {
    if (!isScrubbing) {
      const pct = duration > 0 ? (currentTime / duration) * 100 : 0;
      scrubber.value = pct.toString();
      fScrubber.value = pct.toString();
      const currFormatted = formatTime(currentTime);
      const totFormatted = formatTime(duration);
      currentEl.textContent = currFormatted;
      fCurrentEl.textContent = currFormatted;
      totalEl.textContent = totFormatted;
      fTotalEl.textContent = totFormatted;
    }
  };

  const handleScrubInput = (e: Event) => {
    isScrubbing = true;
    const target = e.target as HTMLInputElement;
    const pct = parseFloat(target.value);
    
    scrubber.value = pct.toString();
    fScrubber.value = pct.toString();
    
    let duration = 0;
    if (currentEngine === 'local' && audio) duration = audio.duration;
    if (currentEngine === 'youtube' && isYtReady) duration = ytPlayer.getDuration();
    
    if (duration) {
      const targetTime = (pct / 100) * duration;
      currentEl.textContent = formatTime(targetTime);
      fCurrentEl.textContent = formatTime(targetTime);
    }
  };
  
  const handleScrubChange = (e: Event) => {
    isScrubbing = false;
    const target = e.target as HTMLInputElement;
    const pct = parseFloat(target.value);
    
    let duration = 0;
    if (currentEngine === 'local' && audio) duration = audio.duration;
    if (currentEngine === 'youtube' && isYtReady) duration = ytPlayer.getDuration();
    
    if (duration) {
      const targetTime = (pct / 100) * duration;
      if (currentEngine === 'local' && audio) audio.currentTime = targetTime;
      if (currentEngine === 'youtube' && isYtReady) ytPlayer.seekTo(targetTime, true);
    }
  };
  
  scrubber.addEventListener('input', handleScrubInput);
  scrubber.addEventListener('change', handleScrubChange);
  
  fScrubber.addEventListener('input', handleScrubInput);
  fScrubber.addEventListener('change', handleScrubChange);

  // ==========================================
  // Local Engine Methods
  // ==========================================
  const initAudio = () => {
    if (!audio) {
      audio = new Audio('/music/kalyani.mp3');
      audio.loop = isLooping;
      
      audio.addEventListener('play', () => {
        isPlaying = true;
        updatePillUI(true, 'Kalyani (Remix)', 'Local Audio');
        updateNowPlayingMeta('Kalyani (Remix)', 'Local Audio', '');
      });
      
      audio.addEventListener('pause', () => {
        isPlaying = false;
        updatePillUI(false, 'Kalyani (Remix)', 'Local Audio');
      });
      
      audio.addEventListener('timeupdate', () => {
        if (currentEngine === 'local' && audio) {
          updateProgressUI(audio.currentTime, audio.duration);
        }
      });
      
      audio.addEventListener('ended', () => {
        if (!isLooping) {
          playNext();
        }
      });
    }
    return audio;
  };

  const playLocal = () => {
    if (currentEngine === 'youtube' && ytPlayer && isYtReady) {
      ytPlayer.pauseVideo();
    }
    currentEngine = 'local';
    const a = initAudio();
    updateNowPlayingMeta('Kalyani (Remix)', 'Local Audio', '');
    updateHeartUI();
    a.play().catch(e => console.error('Audio playback blocked:', e));
  };

  const pauseLocal = () => {
    if (audio) audio.pause();
  };

  // ==========================================
  // YouTube Engine Methods
  // ==========================================
  const loadYouTubeApi = () => {
    if (isYtApiLoaded) return;
    isYtApiLoaded = true;
    
    window.onYouTubeIframeAPIReady = () => {
      ytPlayer = new window.YT.Player('youtube-player-container', {
        height: '0',
        width: '0',
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          rel: 0,
        },
        events: {
          onReady: () => {
            isYtReady = true;
          },
          onStateChange: (event: any) => {
            // event.data: 1 = playing, 2 = paused, 0 = ended
            if (event.data === 1) {
              isPlaying = true;
              updatePillUI(true, currentYtTitle || 'YouTube Track', currentYtChannelTitle || 'YouTube Music');
              startYtProgress();
            } else if (event.data === 2 || event.data === 0 || event.data === -1) {
              isPlaying = false;
              updatePillUI(false, currentYtTitle || 'YouTube Track', currentYtChannelTitle || 'YouTube Music');
              stopYtProgress();
            }
            
            if (event.data === 0) { // ended
              if (isLooping && ytPlayer) {
                ytPlayer.seekTo(0);
                ytPlayer.playVideo();
              } else {
                setTimeout(() => playNext(), 100); // Auto-advance playlist with slight delay
              }
            }
          }
        }
      });
    };

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
  };

  const startYtProgress = () => {
    if (ytProgressInterval) clearInterval(ytProgressInterval);
    ytProgressInterval = window.setInterval(() => {
      if (currentEngine === 'youtube' && isYtReady && ytPlayer && isPlaying) {
        updateProgressUI(ytPlayer.getCurrentTime(), ytPlayer.getDuration());
      }
    }, 1000);
  };

  const stopYtProgress = () => {
    if (ytProgressInterval) clearInterval(ytProgressInterval);
  };

  const playYouTube = (song: YouTubeSearchResult) => {
    if (!isYtApiLoaded) loadYouTubeApi();

    if (currentEngine === 'local' && audio) {
      audio.pause();
    }
    currentEngine = 'youtube';
    currentYtVideoId = song.videoId;
    currentYtTitle = song.title;
    currentYtChannelTitle = song.channelTitle;
    currentYtThumbnailUrl = song.thumbnailUrl;
    
    if (playHistory.length === 0 || playHistory[playHistory.length - 1].videoId !== song.videoId) {
      playHistory.push(song);
    }
    
    updateNowPlayingMeta(song.title, song.channelTitle, song.thumbnailUrl);
    updateHeartUI();
    
    if (isYtReady && ytPlayer) {
      ytPlayer.loadVideoById(song.videoId);
    } else {
      // If user clicked play but API is still loading
      const checkReady = setInterval(() => {
        if (isYtReady && ytPlayer) {
          clearInterval(checkReady);
          ytPlayer.loadVideoById(song.videoId);
        }
      }, 500);
    }
  };

  const pauseYouTube = () => {
    if (isYtReady && ytPlayer) {
      ytPlayer.pauseVideo();
    }
  };

  // ==========================================
  // Unified Controls
  // ==========================================
  const playCurrent = () => {
    if (currentEngine === 'local') {
      const a = initAudio();
      a.play().catch(console.error);
    } else {
      if (isYtReady && ytPlayer) ytPlayer.playVideo();
    }
  };

  const pauseAll = () => {
    pauseLocal();
    pauseYouTube();
  };

  const playNext = async () => {
    if (currentEngine === 'local') {
      if (savedSongs.length > 0) {
        playYouTube(savedSongs[0]);
      } else if (defaultSong) {
        playYouTube(defaultSong);
      } else if (audio) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      }
      return;
    }

    // If currently playing a saved song, loop through the playlist
    const savedIdx = savedSongs.findIndex(s => s.videoId === currentYtVideoId);
    if (savedIdx >= 0) {
      if (savedIdx < savedSongs.length - 1) {
        playYouTube(savedSongs[savedIdx + 1]);
      } else {
        playYouTube(savedSongs[0]); // Loop back to the start of the playlist
      }
      return;
    }

    if (currentYtTitle) {
      updatePillUI(false, 'Loading Next...', 'Recommendation');
      try {
        const query = encodeURIComponent(`${currentYtTitle} ${currentYtChannelTitle || ''} song audio`);
        const res = await fetch(`/api/youtube-search?q=${query}`);
        if (res.ok) {
          const results: YouTubeSearchResult[] = await res.json();
          // Find first result that isn't the current song
          const nextSong = results.find(r => r.videoId !== currentYtVideoId);
          if (nextSong) {
            playYouTube(nextSong);
            return;
          }
        }
      } catch (err) {
        console.error('Failed to fetch recommendation', err);
      }
    }

    // Fallback to saved songs loop if recommendation fails or is empty
    if (savedSongs.length > 0) {
      playYouTube(savedSongs[0]);
    } else if (defaultSong && defaultSong.videoId !== currentYtVideoId) {
      playYouTube(defaultSong);
    } else {
      // Replay current song if nothing else is available
      if (ytPlayer && isYtReady) {
        ytPlayer.seekTo(0);
        ytPlayer.playVideo();
      }
    }
  };

  const playPrev = () => {
    if (currentEngine === 'youtube' && isYtReady && ytPlayer && ytPlayer.getCurrentTime() > 3) {
      ytPlayer.seekTo(0, true);
      return;
    }
    if (currentEngine === 'local' && audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    
    if (playHistory.length > 1) {
      playHistory.pop(); // remove current song
      const prevSong = playHistory.pop();
      if (prevSong) {
        playYouTube(prevSong);
      }
      return;
    }

    if (savedSongs.length === 0) return;
    if (currentEngine === 'local') {
      playYouTube(savedSongs[savedSongs.length - 1]);
      return;
    }
    const idx = savedSongs.findIndex(s => s.videoId === currentYtVideoId);
    if (idx > 0) {
      playYouTube(savedSongs[idx - 1]);
    } else {
      playYouTube(savedSongs[savedSongs.length - 1]);
    }
  };

  // Bind controls for both mini and full players
  const handleToggle = (e: Event) => {
    e.stopPropagation();
    if (isPlaying) pauseAll();
    else playCurrent();
  };
  toggleBtn.addEventListener('click', handleToggle);
  fToggleBtn.addEventListener('click', handleToggle);

  const handlePrev = (e: Event) => {
    e.stopPropagation();
    playPrev();
  };
  prevBtn.addEventListener('click', handlePrev);
  fPrevBtn.addEventListener('click', handlePrev);

  const handleNext = (e: Event) => {
    e.stopPropagation();
    playNext();
  };
  nextBtn.addEventListener('click', handleNext);
  fNextBtn.addEventListener('click', handleNext);

  const handleLoop = (e: Event) => {
    e.stopPropagation();
    isLooping = !isLooping;
    if (isLooping) {
      loopBtn.classList.add('active');
      fLoopBtn.classList.add('active');
      showTooltip("Looping enabled");
    } else {
      loopBtn.classList.remove('active');
      fLoopBtn.classList.remove('active');
      showTooltip("Looping disabled");
    }
    if (audio) audio.loop = isLooping;
  };
  loopBtn.addEventListener('click', handleLoop);
  fLoopBtn.addEventListener('click', handleLoop);

  const handlePlayerHeartClick = (e: Event) => {
    e.stopPropagation();
    if (currentEngine !== 'youtube' || !currentYtVideoId) {
      showTooltip("Only YouTube songs can be saved");
      return;
    }
    
    const index = savedSongs.findIndex(s => s.videoId === currentYtVideoId);
    if (index >= 0) {
      savedSongs.splice(index, 1);
      showTooltip("Removed from playlist");
    } else {
      savedSongs.push({
        videoId: currentYtVideoId,
        title: currentYtTitle || 'Unknown Title',
        channelTitle: currentYtChannelTitle || 'Unknown Channel',
        thumbnailUrl: currentYtThumbnailUrl || ''
      });
      showTooltip("Added to playlist");
    }
    localStorage.setItem(SAVED_KEY, JSON.stringify(savedSongs));
    renderSavedSongs();
    updateHeartUI();
    
    if (currentYtVideoId) {
      const searchBtns = document.querySelectorAll(`.music-result-save[data-id="${currentYtVideoId}"]`);
      searchBtns.forEach(el => {
        if (index >= 0) {
          el.classList.remove('saved');
          el.innerHTML = iconHeart();
        } else {
          el.classList.add('saved');
          el.innerHTML = iconHeartFill();
        }
      });
    }
  };

  fHeartBtn.addEventListener('click', handlePlayerHeartClick);

  // Search Open (Mini Player)
  searchOpenBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dialog.showModal();
    loadYouTubeApi();
    renderPinnedSong();
    renderSavedSongs();
    if (!searchInput.value) searchInput.focus();
  });

  // Open Full Player
  player.addEventListener('click', () => {
    fullPlayerDialog.showModal();
  });

  const controlsContainer = player.querySelector('.music-mini-controls') as HTMLElement;
  if (controlsContainer) {
    controlsContainer.addEventListener('click', (e) => e.stopPropagation());
  }

  // Mini Player Clicks
  miniHeartBtn.addEventListener('click', handlePlayerHeartClick);

  miniTopArea.addEventListener('click', () => {fullPlayerDialog.showModal()});

  // Full Player Actions
  fCloseBtn.addEventListener('click', () => fullPlayerDialog.close());
  
  fSearchBtn.addEventListener('click', () => {
    fullPlayerDialog.close();
    dialog.showModal();
    loadYouTubeApi();
    renderPinnedSong();
    renderSavedSongs();
    if (!searchInput.value) searchInput.focus();
  });
  
  fPlaylistBtn.addEventListener('click', () => {
    fullPlayerDialog.close();
    dialog.showModal();
    loadYouTubeApi();
    renderPinnedSong();
    renderSavedSongs();
  });

  // Global Event from Navbar
  document.addEventListener('koko:open-playlist', () => {
    dialog.showModal();
    loadYouTubeApi();
    renderPinnedSong();
    renderSavedSongs();
  });

  // Search Panel Close
  closeBtn.addEventListener('click', () => dialog.close());

  // Click outside to close Search Panel
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });
  
  // Click outside to close Full Player (mostly for desktop card mode)
  fullPlayerDialog.addEventListener('click', (e) => {
    if (e.target === fullPlayerDialog) fullPlayerDialog.close();
  });

  // ==========================================
  // Pinned/Default Song Logic
  // ==========================================
  const renderPinnedSong = () => {
    if (defaultSong) {
      pinnedSong.innerHTML = `
        <div class="music-panel-pinned-icon">
          <img src="${defaultSong.thumbnailUrl}" style="width:100%; height:100%; object-fit:cover; border-radius:4px;">
        </div>
        <div class="music-panel-pinned-info">
          <h4 class="music-panel-pinned-title">${defaultSong.title}</h4>
          <span class="music-panel-pinned-subtitle">Default Track</span>
        </div>
        <span class="music-panel-pinned-action">Play</span>
      `;
    } else {
      pinnedSong.innerHTML = `
        <div class="music-panel-pinned-icon">
          ${iconHeartFill()}
        </div>
        <div class="music-panel-pinned-info">
          <h4 class="music-panel-pinned-title">Kalyani (Remix)</h4>
          <span class="music-panel-pinned-subtitle">Local Audio</span>
        </div>
        <span class="music-panel-pinned-action">Play</span>
      `;
    }
  };

  pinnedSong.addEventListener('click', () => {
    if (defaultSong) {
      playYouTube(defaultSong);
    } else {
      playLocal();
    }
  });

  // ==========================================
  // Playlist / Saved Songs Logic
  // ==========================================
  const toggleSaveSong = (e: Event, res: YouTubeSearchResult, btn: HTMLElement) => {
    e.stopPropagation();
    const index = savedSongs.findIndex(s => s.videoId === res.videoId);
    if (index >= 0) {
      savedSongs.splice(index, 1);
      btn.classList.remove('saved');
      btn.innerHTML = iconHeart();
    } else {
      savedSongs.push(res);
      btn.classList.add('saved');
      btn.innerHTML = iconHeartFill();
    }
    localStorage.setItem(SAVED_KEY, JSON.stringify(savedSongs));
    renderSavedSongs(); 
    updateHeartUI();
    
    const searchBtns = resultsList.querySelectorAll(`.music-result-save[data-id="${res.videoId}"]`);
    searchBtns.forEach(el => {
      if (index >= 0) {
        el.classList.remove('saved');
        el.innerHTML = iconHeart();
      } else {
        el.classList.add('saved');
        el.innerHTML = iconHeartFill();
      }
    });
  };

  const iconPin = () => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><g transform="rotate(-45 12 12)"><line x1="12" y1="17" x2="12" y2="22"></line><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 11.2V6a3 3 0 0 0-6 0v5.2a2 2 0 0 1-1.11 1.35l-1.78.9A2 2 0 0 0 5 15.24Z"></path></g></svg>`;
  const iconPinFill = () => `<svg viewBox="0 0 24 24" fill="currentColor"><g transform="rotate(-45 12 12)"><line x1="12" y1="17" x2="12" y2="22" stroke="currentColor" stroke-width="2" stroke-linecap="round"></line><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 11.2V6a3 3 0 0 0-6 0v5.2a2 2 0 0 1-1.11 1.35l-1.78.9A2 2 0 0 0 5 15.24Z"></path></g></svg>`;

  const togglePinSong = (e: Event, res: YouTubeSearchResult, btn: HTMLElement) => {
    e.stopPropagation();
    if (defaultSong && defaultSong.videoId === res.videoId) {
      defaultSong = null;
      btn.classList.remove('pinned');
      btn.innerHTML = iconPin();
    } else {
      defaultSong = res;
      btn.classList.add('pinned');
      btn.innerHTML = iconPinFill();
    }
    localStorage.setItem('koko-default-song', JSON.stringify(defaultSong));
    renderPinnedSong();
    
    const allPinBtns = document.querySelectorAll('.music-result-pin');
    allPinBtns.forEach(el => {
      const vidId = el.getAttribute('data-id');
      if (defaultSong && defaultSong.videoId === vidId) {
        el.classList.add('pinned');
        el.innerHTML = iconPinFill();
      } else {
        el.classList.remove('pinned');
        el.innerHTML = iconPin();
      }
    });
  };

  const createResultItem = (res: YouTubeSearchResult) => {
    const li = document.createElement('li');
    li.className = 'music-result-item';
    
    const isSaved = savedSongs.some(s => s.videoId === res.videoId);
    const isPinned = defaultSong && defaultSong.videoId === res.videoId;
    
    li.innerHTML = `
      <img class="music-result-thumb" src="${res.thumbnailUrl}" alt="" loading="lazy">
      <div class="music-result-info">
        <h4 class="music-result-title">${res.title}</h4>
        <span class="music-result-channel">${res.channelTitle}</span>
      </div>
      <div class="music-result-actions">
        <button class="music-result-pin ${isPinned ? 'pinned' : ''}" data-id="${res.videoId}" aria-label="Set as default">
          ${isPinned ? iconPinFill() : iconPin()}
        </button>
        <button class="music-result-save ${isSaved ? 'saved' : ''}" data-id="${res.videoId}" aria-label="Save song">
          ${isSaved ? iconHeartFill() : iconHeart()}
        </button>
      </div>
    `;
    
    const saveBtn = li.querySelector('.music-result-save') as HTMLElement;
    saveBtn.addEventListener('click', (e) => toggleSaveSong(e, res, saveBtn));
    
    const pinBtn = li.querySelector('.music-result-pin') as HTMLElement;
    pinBtn.addEventListener('click', (e) => togglePinSong(e, res, pinBtn));
    
    li.addEventListener('click', () => {
      dialog.close();
      playYouTube(res);
      fullPlayerDialog.showModal();
    });
    
    return li;
  };

  const renderSavedSongs = () => {
    savedList.innerHTML = '';
    if (savedSongs.length === 0) {
      savedHeader.style.display = 'none';
      return;
    }
    savedHeader.style.display = 'flex';
    [...savedSongs].reverse().forEach(res => {
      savedList.appendChild(createResultItem(res));
    });
  };

  // ==========================================
  // Event Listeners for Search Panel
  // ==========================================
  searchClearBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchClearBtn.style.display = 'none';
    resultsList.innerHTML = '';
    stateContainer.style.display = 'none';
    searchInput.focus();
  });

  playPlaylistBtn.addEventListener('click', () => {
    if (savedSongs.length > 0) {
      dialog.close();
      playYouTube(savedSongs[0]);
      fullPlayerDialog.showModal();
    }
  });

  clearPlaylistBtn.addEventListener('click', () => {
    savedSongs = [];
    localStorage.setItem('koko-saved-songs', JSON.stringify([]));
    renderSavedSongs();
    
    // Disable the heart buttons if active
    updateHeartUI();
  });

  // ==========================================
  // Search UI Logic
  // ==========================================
  let searchTimeout: number;

  const showPanelState = (type: 'loading' | 'empty' | 'error' | 'offline', msg?: string) => {
    resultsList.innerHTML = '';
    stateContainer.style.display = 'block';
    
    if (type === 'loading') {
      stateContainer.innerHTML = `
        <div class="skeleton-row shimmer">
          <div class="skeleton-thumb"></div>
          <div class="skeleton-text-container">
            <div class="skeleton-text-1"></div>
            <div class="skeleton-text-2"></div>
          </div>
        </div>
      `;
    } else if (type === 'empty') {
      stateContainer.innerHTML = `
        ${iconSearch()}
        <div>No results found for that search.</div>
      `;
    } else if (type === 'error') {
      stateContainer.innerHTML = `
        <div class="music-panel-error">
          ${iconX()}
          <div>${msg || 'Something went wrong.'}</div>
        </div>
      `;
    } else if (type === 'offline') {
      stateContainer.innerHTML = `
        <div>You seem to be offline. YouTube search requires an internet connection.</div>
      `;
    }
  };

  searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim();
    clearTimeout(searchTimeout);
    
    if (searchInput.value.length > 0) {
      searchClearBtn.style.display = 'flex';
    } else {
      searchClearBtn.style.display = 'none';
    }
    
    if (!navigator.onLine) {
      showPanelState('offline');
      return;
    }

    if (!query) {
      stateContainer.style.display = 'none';
      resultsList.innerHTML = '';
      return;
    }

    searchTimeout = window.setTimeout(async () => {
      try {
        if (query.length < 3) {
           resultsList.innerHTML = '<div style="padding: 1rem; color: var(--body-text); text-align: center;">Please type at least 3 characters to search.</div>';
           return;
        }
        showPanelState('loading');
        
        // Local Client-side Cache to save massive API quota
        const cacheKey = `koko-search-cache-${query.toLowerCase()}`;
        const cachedStr = localStorage.getItem(cacheKey);
        if (cachedStr) {
          const cached = JSON.parse(cachedStr);
          if (Date.now() - cached.timestamp < 1000 * 60 * 60 * 24 * 7) { // 7 days cache!
            stateContainer.style.display = 'none';
            resultsList.innerHTML = '';
            
            if (cached.data.length === 0) {
              showPanelState('empty');
              return;
            }

            cached.data.forEach((res: YouTubeSearchResult) => {
              resultsList.appendChild(createResultItem(res));
            });
            return;
          }
        }

        const res = await fetch(`/api/youtube-search?q=${encodeURIComponent(query)}`);
        
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          if (data.error === 'quota_exceeded') {
            showPanelState('error', data.message);
          } else {
            showPanelState('error', data.error || 'Failed to search');
          }
          return;
        }

        const results: YouTubeSearchResult[] = await res.json();
        
        // Save to LocalStorage
        localStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data: results }));
        
        stateContainer.style.display = 'none';
        resultsList.innerHTML = '';
        
        if (results.length === 0) {
          showPanelState('empty');
          return;
        }

        results.forEach(res => {
          resultsList.appendChild(createResultItem(res));
        });
      } catch (err) {
        showPanelState('error', 'Network error while searching.');
      }
    }, 1000); // 1 full second debounce to save API requests
  });

  searchClearBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchClearBtn.style.display = 'none';
    stateContainer.style.display = 'none';
    resultsList.innerHTML = '';
    searchInput.focus();
  });

  // ==========================================
  // Global Event Listeners
  // ==========================================
  const handleFirstInteraction = () => {
    if (!isPlaying) {
      if (defaultSong) {
        if (!isYtApiLoaded) loadYouTubeApi();
        playYouTube(defaultSong);
      } else if (currentEngine === 'local') {
        const a = initAudio();
        a.play().catch(() => {});
      }
    }
    document.removeEventListener('click', handleFirstInteraction);
    document.removeEventListener('keydown', handleFirstInteraction);
    document.removeEventListener('touchstart', handleFirstInteraction);
  };
  
  document.addEventListener('click', handleFirstInteraction);
  document.addEventListener('keydown', handleFirstInteraction);
  document.addEventListener('touchstart', handleFirstInteraction);

  setTimeout(() => {
    if (!isPlaying) {
      if (defaultSong) {
        if (!isYtApiLoaded) loadYouTubeApi();
        playYouTube(defaultSong);
      } else if (currentEngine === 'local') {
        const a = initAudio();
        a.play().catch(() => {});
      }
    }
  }, 500);

  // Initialize Pinned Song UI on mount
  renderPinnedSong();

  // Proactively load the YouTube API so it's ready when needed
  loadYouTubeApi();

  return player;
}
