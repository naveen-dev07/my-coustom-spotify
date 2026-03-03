// ===== ELEMENTS =====
const audioPlayer    = document.getElementById('audioPlayer');
const mainPlayBtn    = document.getElementById('mainPlayBtn');
const songSeekBar    = document.getElementById('songSeekBar');
const volumeBar      = document.getElementById('myProgressBar');
const masterImg      = document.getElementById('masterImg');
const masterSongName = document.getElementById('masterSongName');
const masterArtist   = document.getElementById('masterArtistName');
const currentTimeEl  = document.getElementById('currentTime');
const totalTimeEl    = document.getElementById('totalTime');
const prevBtn        = document.getElementById('prevBtn');
const nextBtn        = document.getElementById('nextBtn');
const volumeIcon     = document.getElementById('volumeIcon');

// ===== ALL CARDS =====
const cards = Array.from(document.querySelectorAll('.card'));

let currentIndex = -1;
let isPlaying    = false;

// ===== FORMAT TIME (seconds → m:ss) =====
function formatTime(sec) {
  if (isNaN(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// ===== LOAD & PLAY A SONG BY INDEX =====
function loadSong(index) {
  if (index < 0 || index >= cards.length) return;

  currentIndex = index;
  const card   = cards[index];

  const src    = card.dataset.song;
  const img    = card.dataset.img;
  const title  = card.dataset.title;
  const artist = card.dataset.artist;

  // Update bottom bar info
  masterImg.src       = img;
  masterSongName.textContent = title;
  masterArtist.textContent   = artist;

  // Load audio
  audioPlayer.src = src;
  audioPlayer.volume = volumeBar.value / 100;
  audioPlayer.play()
    .then(() => setPlaying(true))
    .catch(() => setPlaying(false)); // file might not exist

  // Highlight active card
  cards.forEach(c => c.style.outline = 'none');
  card.style.outline = '2px solid #1db954';
}

// ===== SET PLAY / PAUSE UI =====
function setPlaying(state) {
  isPlaying = state;
  // Bottom bar button
  mainPlayBtn.className = state
    ? 'fas fa-pause-circle play-btn'
    : 'fas fa-play-circle play-btn';

  // All card play icons — update only the active card's icon
  cards.forEach((c, i) => {
    const icon = c.querySelector('.player-slider i');
    if (icon) {
      icon.className = (state && i === currentIndex)
        ? 'fa-solid fa-pause'
        : 'fa-solid fa-play';
    }
  });
}

// ===== CARD CLICK: Green Play Button =====
cards.forEach((card, index) => {
  const btn = card.querySelector('.player-slider');
  btn.addEventListener('click', (e) => {
    e.stopPropagation();

    if (currentIndex === index) {
      // Toggle play/pause for same song
      if (isPlaying) {
        audioPlayer.pause();
        setPlaying(false);
      } else {
        audioPlayer.play();
        setPlaying(true);
      }
    } else {
      loadSong(index);
    }
  });

  // Also click anywhere on card
  card.addEventListener('click', () => {
    if (currentIndex === index) {
      if (isPlaying) { audioPlayer.pause(); setPlaying(false); }
      else           { audioPlayer.play();  setPlaying(true);  }
    } else {
      loadSong(index);
    }
  });
});

// ===== MAIN PLAY/PAUSE BUTTON =====
mainPlayBtn.addEventListener('click', () => {
  if (currentIndex === -1) {
    loadSong(0);
    return;
  }
  if (isPlaying) {
    audioPlayer.pause();
    setPlaying(false);
  } else {
    audioPlayer.play();
    setPlaying(true);
  }
});

// ===== PREVIOUS BUTTON =====
prevBtn.addEventListener('click', () => {
  if (currentIndex <= 0) loadSong(cards.length - 1);
  else loadSong(currentIndex - 1);
});

// ===== NEXT BUTTON =====
nextBtn.addEventListener('click', () => {
  if (currentIndex >= cards.length - 1) loadSong(0);
  else loadSong(currentIndex + 1);
});

// ===== AUTO NEXT when song ends =====
audioPlayer.addEventListener('ended', () => {
  if (currentIndex >= cards.length - 1) loadSong(0);
  else loadSong(currentIndex + 1);
});

// ===== UPDATE SONG SEEK BAR as song plays =====
audioPlayer.addEventListener('timeupdate', () => {
  if (!audioPlayer.duration) return;
  const pct = (audioPlayer.currentTime / audioPlayer.duration) * 100;
  songSeekBar.value     = pct;
  currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
  totalTimeEl.textContent   = formatTime(audioPlayer.duration);

  // Update seek bar fill color
  updateSliderFill(songSeekBar);
});

// ===== SONG SEEK BAR — user drags =====
songSeekBar.addEventListener('input', () => {
  if (!audioPlayer.duration) return;
  audioPlayer.currentTime = (songSeekBar.value / 100) * audioPlayer.duration;
  updateSliderFill(songSeekBar);
});

// ===== VOLUME BAR =====
volumeBar.addEventListener('input', () => {
  const vol = volumeBar.value / 100;
  audioPlayer.volume = vol;
  updateSliderFill(volumeBar);

  // Update volume icon
  if (vol === 0) {
    volumeIcon.className = 'fas fa-volume-mute';
  } else if (vol < 0.5) {
    volumeIcon.className = 'fas fa-volume-down';
  } else {
    volumeIcon.className = 'fas fa-volume-up';
  }
});

// ===== VOLUME ICON CLICK — Mute toggle =====
let lastVolume = 80;
volumeIcon.addEventListener('click', () => {
  if (audioPlayer.volume > 0) {
    lastVolume = volumeBar.value;
    audioPlayer.volume = 0;
    volumeBar.value = 0;
    volumeIcon.className = 'fas fa-volume-mute';
  } else {
    volumeBar.value = lastVolume;
    audioPlayer.volume = lastVolume / 100;
    volumeIcon.className = 'fas fa-volume-up';
  }
  updateSliderFill(volumeBar);
});

// ===== SET INITIAL VOLUME =====
audioPlayer.volume = volumeBar.value / 100;

// ===== HELPER: Update slider green fill =====
function updateSliderFill(slider) {
  const pct = slider.value;
  slider.style.background = `linear-gradient(to right, #1db954 ${pct}%, #535353 ${pct}%)`;
}

// Init fill on load
updateSliderFill(songSeekBar);
updateSliderFill(volumeBar);
