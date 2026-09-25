const sitePage = document.body;
if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}
window.scrollTo(0, 0);

const openingScreen = document.getElementById("openingScreen");
const envelopeButton = document.getElementById("envelopeButton");
const heartSnow = document.getElementById("heartSnow");
const celebrationBurst = document.getElementById("celebrationBurst");
const weddingMusic = document.getElementById("weddingMusic");
const musicToggle = document.getElementById("musicToggle");
const themeColor = document.querySelector('meta[name="theme-color"]');

const palette = ["#c43643", "#e7b3b4", "#bf8a43", "#f0d5cf", "#9f2835", "#d1a057"];
const TARGET_VOLUME = 0.72;

function seeded(index, salt = 1) {
  const x = Math.sin(index * 91.713 + salt * 17.137) * 43758.5453;
  return x - Math.floor(x);
}

function createHeart(index) {
  const wrapper = document.createElement("span");
  wrapper.className = "heart";
  const duration = 8.5 + seeded(index, 3) * 8;

  wrapper.style.setProperty("--left", `${2 + seeded(index, 1) * 96}%`);
  wrapper.style.setProperty("--size", `${9 + seeded(index, 2) * 15}px`);
  wrapper.style.setProperty("--duration", `${duration}s`);
  wrapper.style.setProperty("--delay", `${-seeded(index, 4) * duration}s`);
  wrapper.style.setProperty("--drift", `${-45 + seeded(index, 5) * 90}px`);
  wrapper.style.setProperty("--opacity", (0.26 + seeded(index, 6) * 0.62).toFixed(2));
  wrapper.style.setProperty("--rotation", `${-42 + seeded(index, 7) * 84}deg`);
  wrapper.style.color = palette[Math.floor(seeded(index, 8) * palette.length)];
  wrapper.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 21s-7.1-4.42-9.6-8.54C.56 9.42 1.38 5.7 4.7 4.43c2.18-.84 4.66-.12 6.02 1.76L12 7.96l1.28-1.77c1.36-1.88 3.84-2.6 6.02-1.76 3.32 1.27 4.14 4.99 2.3 8.03C19.1 16.58 12 21 12 21Z"/></svg>`;
  return wrapper;
}

if (heartSnow) {
  for (let i = 0; i < 26; i += 1) heartSnow.appendChild(createHeart(i));
}

function createBurstPiece(kind, x, y, dx, dy, size, color, rotA, rotB) {
  const piece = document.createElement("span");
  piece.className = `burst-piece ${kind === "spark" ? "burst-piece--spark" : "burst-piece--heart"}`;
  piece.style.setProperty("--x", `${x}px`);
  piece.style.setProperty("--y", `${y}px`);
  piece.style.setProperty("--dx", `${dx}px`);
  piece.style.setProperty("--dy", `${dy}px`);
  piece.style.setProperty("--size", `${size}px`);
  piece.style.setProperty("--rot-a", `${rotA}deg`);
  piece.style.setProperty("--rot-b", `${rotB}deg`);
  piece.style.color = color;
  piece.innerHTML = kind === "spark"
    ? "<span></span>"
    : `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 21s-7.1-4.42-9.6-8.54C.56 9.42 1.38 5.7 4.7 4.43c2.18-.84 4.66-.12 6.02 1.76L12 7.96l1.28-1.77c1.36-1.88 3.84-2.6 6.02-1.76 3.32 1.27 4.14 4.99 2.3 8.03C19.1 16.58 12 21 12 21Z"/></svg>`;
  piece.addEventListener("animationend", () => piece.remove(), { once: true });
  return piece;
}

function triggerCelebrationBurst() {
  if (!openingScreen || !envelopeButton || !celebrationBurst) return;

  const screenRect = openingScreen.getBoundingClientRect();
  const btnRect = envelopeButton.getBoundingClientRect();
  const originX = btnRect.left - screenRect.left + btnRect.width * 0.5;
  const originY = btnRect.top - screenRect.top + btnRect.height * 0.72;

  for (let i = 0; i < 16; i += 1) {
    const angle = (-140 + (280 / 15) * i) * (Math.PI / 180);
    const distance = 90 + seeded(i, 30) * 135;
    celebrationBurst.appendChild(createBurstPiece(
      "heart",
      originX,
      originY,
      Math.cos(angle) * distance,
      Math.sin(angle) * distance - 18,
      12 + seeded(i, 31) * 17,
      palette[Math.floor(seeded(i, 32) * palette.length)],
      -25 + seeded(i, 33) * 50,
      -280 + seeded(i, 34) * 560
    ));
  }

  for (let i = 0; i < 9; i += 1) {
    const angle = (-155 + (310 / 8) * i) * (Math.PI / 180);
    const distance = 65 + seeded(i, 40) * 110;
    celebrationBurst.appendChild(createBurstPiece(
      "spark",
      originX,
      originY,
      Math.cos(angle) * distance,
      Math.sin(angle) * distance - 10,
      5 + seeded(i, 41) * 6,
      i % 2 ? "#f1e6d8" : "#f7d38f",
      0,
      0
    ));
  }
}

function updateMusicButton() {
  if (!weddingMusic || !musicToggle) return;
  const playing = !weddingMusic.paused && weddingMusic.volume > 0.01;
  musicToggle.classList.toggle("is-playing", playing);
  musicToggle.setAttribute("aria-label", playing ? "Tắt nhạc" : "Bật nhạc");
}

async function primeMusicFromEnvelopeTap() {
  if (!weddingMusic) return false;

  weddingMusic.loop = true;
  weddingMusic.volume = 0.001;

  try {
    await weddingMusic.play();
    return true;
  } catch (error) {
    console.log("Không thể khởi tạo nhạc từ thao tác mở thư:", error);
    return false;
  }
}

function fadeMusicTo(targetVolume = TARGET_VOLUME, duration = 900) {
  if (!weddingMusic || weddingMusic.paused) return;

  const startVolume = weddingMusic.volume;
  const start = performance.now();

  const tick = (now) => {
    const progress = Math.min(1, (now - start) / duration);
    weddingMusic.volume = startVolume + (targetVolume - startVolume) * progress;
    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      updateMusicButton();
    }
  };

  requestAnimationFrame(tick);
}

async function startAudibleMusic() {
  if (!weddingMusic) return;

  // The track was primed silently during the envelope tap. Restart from 0 so
  // guests hear the song from its beginning only after the envelope is open.
  try {
    weddingMusic.currentTime = 0;
  } catch (_) {}

  if (weddingMusic.paused) {
    weddingMusic.volume = TARGET_VOLUME;
    try {
      await weddingMusic.play();
    } catch (error) {
      console.log("Trình duyệt yêu cầu chạm nút nhạc để phát:", error);
      updateMusicButton();
      return;
    }
  }

  fadeMusicTo(TARGET_VOLUME, 900);
}

musicToggle?.addEventListener("click", async () => {
  if (!weddingMusic) return;

  if (weddingMusic.paused) {
    weddingMusic.volume = TARGET_VOLUME;
    try {
      await weddingMusic.play();
    } catch (_) {}
  } else {
    weddingMusic.pause();
  }

  updateMusicButton();
});

function revealInvitationContent() {
  sitePage.classList.remove("opening-page");
  sitePage.classList.add("invitation-page", "is-ready");
  openingScreen?.classList.add("is-open");
  themeColor?.setAttribute("content", "#f4efe7");
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  updateMusicButton();
  document.dispatchEvent(new CustomEvent("wedding:opened"));
}

let hasOpened = false;

envelopeButton?.addEventListener("click", () => {
  if (hasOpened) return;
  hasOpened = true;

  // Important: call play() while this click still has user activation.
  // It stays effectively silent until the envelope finishes opening.
  primeMusicFromEnvelopeTap();

  envelopeButton.disabled = true;
  envelopeButton.setAttribute("aria-expanded", "true");
  triggerCelebrationBurst();
  openingScreen?.classList.add("is-opening");

  window.setTimeout(() => {
    openingScreen?.classList.remove("is-opening");
    openingScreen?.classList.add("is-open");
    startAudibleMusic();
  }, 2150);

  // Same visual position, but no page navigation anymore: only the copy/content appears.
  window.setTimeout(() => {
    revealInvitationContent();
  }, 2950);
});

// A normal reload always starts from the closed-envelope state.
// If the browser restores this document from its back/forward cache, reset it too.
window.addEventListener("pageshow", (event) => {
  if (event.persisted) window.location.reload();
});
