// ---- Lyric subtitle: The Marías - Sienna ----
// Paste your own favorite lines from the song here (kept local to your copy).
const LYRIC_LINES = [
  'Sienna — The Marías',
  'Please tell me not to go',
  'We\'ve been here long before',
  'I live under your eyelids',
  'I\'ll always be yours',
  'I\'ll lay on your rooftop in the freezing cold',
  'And I\'ll watch the sunset wearing all your clothes',
  'I can feel you with me like I did before'
].concat([
  'Like when I sang you a love song by Norah Jones',
  'Ooh, Sienna',
  'Would\'ve been cute',
  'Ooh, Sienna',
  'Would look just like you',
  'I came clean',
  'And it feels so good',
  'If I feel seen, mm',
  'Only through you',
  'I\'ll wait here tomorrow, outside your door'
]).concat([
  'Like I did in December, when you held me close',
  'Coming up on your corner, pulling out my hair',
  'Hear the creak in the floorboards going up the stairs',
  'Ooh, Sienna',
  'Would\'ve been cute',
  'Ooh, Sienna',
  'Would look just like you',
  'With a temper like you, run around like you',
  'Jumping in the pool, like you',
  'Sing to all her pets in the way I did'
]).concat([
  'Be sensitive like you',
  'And I smile when I think of all the times we had',
  'On the beach in the winter, when the waves were mad',
  'Down by the water, crystal clear',
  'See her face in the forest, then it disappears'
]);

const lyricLine = document.getElementById('lyricLine');
const LYRIC_HOLD_MS = 2600; // how long each line stays fully visible
const LYRIC_FADE_MS = 600;  // must match the CSS transition duration
let lyricsStarted = false;

function showNextLyric(lyricIndex = 0) {
  lyricLine.textContent = LYRIC_LINES[lyricIndex];
  lyricLine.classList.add('visible');
  const nextIndex = (lyricIndex + 1) % LYRIC_LINES.length;

  setTimeout(() => {
    lyricLine.classList.remove('visible');
    setTimeout(() => showNextLyric(nextIndex), LYRIC_FADE_MS);
  }, LYRIC_HOLD_MS);
}

function startLyrics() {
  if (lyricsStarted || !lyricLine) return;
  lyricsStarted = true;
  showNextLyric();
}

// Unlike audio, scrolling text isn't blocked by browser autoplay policy,
// so the lyric subtitle can just start right away on page load.
startLyrics();

const steps = document.querySelectorAll('.step');

function goToStep(stepNumber) {
  steps.forEach((el) => {
    el.classList.toggle('active', Number(el.dataset.step) === stepNumber);
  });
}

document.getElementById('btnStep2').addEventListener('click', () => goToStep(2));
document.getElementById('btnOpenEnvelope').addEventListener('click', () => goToStep(3));
document.getElementById('envelopeImg').addEventListener('click', () => goToStep(3));

// ---- Draggable memory photos (Step 1) ----
const stack = document.getElementById('photoStack');
const photoItems = Array.from(document.querySelectorAll('.photo-item'));
let topZ = photoItems.length;

photoItems.forEach((el, i) => {
  el.style.left = `${el.dataset.left}%`;
  el.style.top = `${el.dataset.top}%`;
  el.style.setProperty('--rot', `${el.dataset.rot}deg`);
  el.style.setProperty('--delay', `${i * 0.4}s`);
  el.style.zIndex = i + 1;

  let dragging = false;
  let moved = false;
  let startX = 0, startY = 0, startLeft = 0, startTop = 0;

  el.addEventListener('pointerdown', (e) => {
    dragging = true;
    moved = false;
    el.setPointerCapture(e.pointerId);
    startX = e.clientX;
    startY = e.clientY;
    startLeft = parseFloat(el.style.left);
    startTop = parseFloat(el.style.top);
    topZ += 1;
    el.style.zIndex = topZ;
    el.classList.add('dragging');
  });

  el.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) moved = true;
    const rect = stack.getBoundingClientRect();
    const newLeft = startLeft + (dx / rect.width) * 100;
    const newTop = startTop + (dy / rect.height) * 100;
    el.style.left = `${Math.min(96, Math.max(4, newLeft))}%`;
    el.style.top = `${Math.min(96, Math.max(4, newTop))}%`;
  });

  const endDrag = () => {
    if (!dragging) return;
    dragging = false;
    el.classList.remove('dragging');
    if (!moved) {
      openLightbox(el.querySelector('img').src, el.querySelector('img').alt);
    }
  };

  el.addEventListener('pointerup', endDrag);
  el.addEventListener('pointercancel', endDrag);
});

// ---- Lightbox ----
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');

function openLightbox(src, alt) {
  lightboxImg.src = src;
  lightboxImg.alt = alt;
  lightbox.classList.add('active');
}

function closeLightbox() {
  lightbox.classList.remove('active');
}

lightbox.addEventListener('click', closeLightbox);

// ---- Music player: The Marías - Sienna (via Spotify iFrame API) ----
const musicArt = document.getElementById('musicArt');
const musicToggle = document.getElementById('musicToggle');
const iconPlay = musicToggle.querySelector('.icon-play');
const iconPause = musicToggle.querySelector('.icon-pause');
let spotifyController = null;
let isPlaying = false;

function setPlayingUI(playing) {
  isPlaying = playing;
  musicArt.classList.toggle('spinning', playing);
  iconPlay.style.display = playing ? 'none' : 'block';
  iconPause.style.display = playing ? 'block' : 'none';
}

function forceHideSpotifyIframe(iframe) {
  iframe.style.setProperty('position', 'fixed', 'important');
  iframe.style.setProperty('left', '0', 'important');
  iframe.style.setProperty('bottom', '0', 'important');
  iframe.style.setProperty('width', '1px', 'important');
  iframe.style.setProperty('height', '1px', 'important');
  iframe.style.setProperty('opacity', '0', 'important');
  iframe.style.setProperty('pointer-events', 'none', 'important');
  iframe.setAttribute('tabindex', '-1');
}

// Browsers only allow audio to start playing in direct response to a real
// user gesture (click/tap/keypress) — and it must happen synchronously
// inside that gesture's event handler, not "later" once Spotify is ready.
// So instead of a single one-time attempt, we retry on every tap/keypress
// until Spotify actually confirms playback started (see playback_update).
function tryAutoplay() {
  if (spotifyController && !isPlaying) {
    spotifyController.play();
  }
}

['pointerdown', 'keydown'].forEach((evt) => {
  document.addEventListener(evt, () => {
    tryAutoplay();
  });
});

// ---- Tap/click heart burst ----
const HEART_COLORS = ['#fb7185', '#f43f5e', '#d4a574', '#e05a76'];
const HEART_PATH = 'M12 21s-6.7-4.3-9.6-8.3C.6 9.9 1.4 6.4 4.3 4.9c2.3-1.2 5-.5 6.6 1.4l1.1 1.3 1.1-1.3c1.6-1.9 4.3-2.6 6.6-1.4 2.9 1.5 3.7 5 1.9 7.8C18.7 16.7 12 21 12 21z';

function spawnHeart(x, y) {
  const heart = document.createElement('div');
  heart.className = 'tap-heart';
  heart.style.left = `${x}px`;
  heart.style.top = `${y}px`;

  const size = 16 + Math.random() * 14;
  const color = HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)];
  const rot = (Math.random() - 0.5) * 50;
  const drift = (Math.random() - 0.5) * 80;
  heart.style.setProperty('--heart-rot', `${rot}deg`);
  heart.style.setProperty('--heart-drift', `${drift}px`);

  heart.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}"><path d="${HEART_PATH}"/></svg>`;

  document.body.appendChild(heart);
  heart.addEventListener('animationend', () => heart.remove());
}

document.addEventListener('pointerdown', (e) => {
  const burstCount = 1 + Math.floor(Math.random() * 2);
  for (let i = 0; i < burstCount; i++) {
    const offsetX = (Math.random() - 0.5) * 20;
    const offsetY = (Math.random() - 0.5) * 20;
    spawnHeart(e.clientX + offsetX, e.clientY + offsetY);
  }
});

window.onSpotifyIframeApiReady = (IFrameAPI) => {
  const element = document.getElementById('spotifyEmbed');
  const options = {
    uri: 'spotify:track:0InIeZW4P6VO7dUGRM4AKH',
    width: '300',
    height: '80',
  };
  IFrameAPI.createController(element, options, (EmbedController) => {
    spotifyController = EmbedController;
    EmbedController.addListener('playback_update', (e) => {
      setPlayingUI(!e.data.isPaused && !e.data.isBuffering);
    });

    const iframe = element.querySelector('iframe');
    if (iframe) {
      forceHideSpotifyIframe(iframe);
      // Spotify's SDK sometimes rewrites the iframe's inline style
      // (e.g. on resize/expand) — reapply our hidden sizing whenever it does.
      const observer = new MutationObserver(() => {
        if (iframe.style.width !== '1px') forceHideSpotifyIframe(iframe);
      });
      observer.observe(iframe, { attributes: true, attributeFilter: ['style'] });
    }

    tryAutoplay();
  });
};

musicToggle.addEventListener('click', () => {
  if (spotifyController) spotifyController.togglePlay();
});
