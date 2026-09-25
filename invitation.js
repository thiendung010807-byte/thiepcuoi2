const weddingConfig = window.WEDDING_CONFIG || {
  groom: { name: "Trần Văn Chiến", shortName: "Trần Chiến", bankName: "", bankAccount: "", bankAccountName: "", bankQrImage: "" },
  bride: { name: "Nguyễn Thị Lan Thảo", shortName: "Lan Thảo" },
};

function applyWeddingConfig() {
  const heroNames = [...document.querySelectorAll(".hero-name")];
  if (heroNames[0]) heroNames[0].textContent = weddingConfig.groom.name;
  if (heroNames[1]) heroNames[1].textContent = weddingConfig.bride.name;

  const infoPeople = [...document.querySelectorAll(".info-person")];
  if (infoPeople[0]) infoPeople[0].textContent = weddingConfig.groom.name;
  if (infoPeople[1]) infoPeople[1].textContent = weddingConfig.bride.name;
}

applyWeddingConfig();

const page = document.body;

const revealItems = document.querySelectorAll(".reveal-slide");
const observer = new IntersectionObserver(
  (entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      obs.unobserve(entry.target);
    });
  },
  { threshold: 0.18, rootMargin: "0px 0px -6% 0px" }
);

revealItems.forEach((item) => observer.observe(item));

// Album carousel: swipe left/right + faster autoplay + fullscreen viewer.
const albumCarousel = document.getElementById("albumCarousel");
const albumSlides = [...document.querySelectorAll(".album-slide")];
const albumDots = document.getElementById("albumDots");
const albumLightbox = document.getElementById("albumLightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxCaption = document.getElementById("lightboxCaption");
const lightboxClose = document.getElementById("lightboxClose");
const lightboxPrev = document.getElementById("lightboxPrev");
const lightboxNext = document.getElementById("lightboxNext");
const lightboxThumbs = document.getElementById("lightboxThumbs");

if (albumCarousel && albumSlides.length) {
  let activeIndex = 0;
  let startX = 0;
  let startY = 0;
  let dragging = false;
  let autoTimer = null;
  let suppressClick = false;
  let lightboxStartX = 0;
  let albumInView = false;
  const AUTO_DELAY = 2700;

  albumSlides.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "album-dot";
    dot.setAttribute("aria-label", `Xem ảnh ${index + 1}`);
    dot.addEventListener("click", () => {
      activeIndex = index;
      renderAlbum();
      restartAutoplay();
    });
    albumDots.appendChild(dot);
  });

  const dots = [...albumDots.children];

  const lightboxThumbButtons = [];
  if (lightboxThumbs) {
    albumSlides.forEach((slide, index) => {
      const img = slide.querySelector("img");
      const button = document.createElement("button");
      button.type = "button";
      button.className = "lightbox-thumb";
      button.setAttribute("aria-label", `Xem ảnh ${index + 1}`);
      const thumb = document.createElement("img");
      thumb.src = img?.currentSrc || img?.src || "";
      thumb.alt = "";
      thumb.draggable = false;
      button.appendChild(thumb);
      button.addEventListener("click", () => {
        activeIndex = index;
        renderAlbum();
        renderLightbox();
      });
      lightboxThumbs.appendChild(button);
      lightboxThumbButtons.push(button);
    });
  }

  function circularDistance(index, active, count) {
    let d = index - active;
    if (d > count / 2) d -= count;
    if (d < -count / 2) d += count;
    return d;
  }

  function renderAlbum() {
    albumSlides.forEach((slide, index) => {
      const d = circularDistance(index, activeIndex, albumSlides.length);
      slide.classList.remove("is-active", "is-prev", "is-next", "is-far-prev", "is-far-next");

      if (d === 0) slide.classList.add("is-active");
      else if (d === -1) slide.classList.add("is-prev");
      else if (d === 1) slide.classList.add("is-next");
      else if (d < 0) slide.classList.add("is-far-prev");
      else slide.classList.add("is-far-next");
    });

    dots.forEach((dot, index) => dot.classList.toggle("is-active", index === activeIndex));
  }

  function next() {
    activeIndex = (activeIndex + 1) % albumSlides.length;
    renderAlbum();
    if (albumLightbox?.classList.contains("is-open")) renderLightbox();
  }

  function prev() {
    activeIndex = (activeIndex - 1 + albumSlides.length) % albumSlides.length;
    renderAlbum();
    if (albumLightbox?.classList.contains("is-open")) renderLightbox();
  }

  function startAutoplay() {
    stopAutoplay();
    if (!albumInView || document.hidden || albumLightbox?.classList.contains("is-open")) return;
    autoTimer = window.setInterval(next, AUTO_DELAY);
  }

  function stopAutoplay() {
    if (autoTimer) window.clearInterval(autoTimer);
    autoTimer = null;
  }

  function restartAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  function renderLightbox() {
    if (!lightboxImage) return;
    const img = albumSlides[activeIndex].querySelector("img");
    if (!img) return;
    lightboxImage.src = img.currentSrc || img.src;
    lightboxImage.alt = img.alt || `Ảnh cưới ${activeIndex + 1}`;
    if (lightboxCaption) lightboxCaption.textContent = `${activeIndex + 1}/${albumSlides.length}`;
    lightboxThumbButtons.forEach((button, index) => {
      button.classList.toggle("is-active", index === activeIndex);
      button.setAttribute("aria-current", index === activeIndex ? "true" : "false");
    });
    lightboxThumbButtons[activeIndex]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }

  function openLightbox() {
    if (!albumLightbox) return;
    stopAutoplay();
    renderLightbox();
    albumLightbox.classList.add("is-open");
    albumLightbox.setAttribute("aria-hidden", "false");
    page.classList.add("is-lightbox-open");
    lightboxClose?.focus({ preventScroll: true });
  }

  function closeLightbox() {
    if (!albumLightbox) return;
    albumLightbox.classList.remove("is-open");
    albumLightbox.setAttribute("aria-hidden", "true");
    page.classList.remove("is-lightbox-open");
    restartAutoplay();
  }

  albumCarousel.addEventListener("pointerdown", (event) => {
    dragging = true;
    startX = event.clientX;
    startY = event.clientY;
    suppressClick = false;
    albumCarousel.classList.add("is-dragging");
    stopAutoplay();
    albumCarousel.setPointerCapture?.(event.pointerId);
  });

  albumCarousel.addEventListener("pointerup", (event) => {
    if (!dragging) return;
    dragging = false;
    albumCarousel.classList.remove("is-dragging");

    const dx = event.clientX - startX;
    const dy = event.clientY - startY;

    if (Math.abs(dx) > 42 && Math.abs(dx) > Math.abs(dy) * 1.1) {
      suppressClick = true;
      if (dx < 0) next();
      else prev();
      window.setTimeout(() => { suppressClick = false; }, 250);
    }

    restartAutoplay();
  });

  albumCarousel.addEventListener("pointercancel", () => {
    dragging = false;
    albumCarousel.classList.remove("is-dragging");
    restartAutoplay();
  });

  albumSlides.forEach((slide, index) => {
    slide.addEventListener("click", () => {
      if (suppressClick || !slide.classList.contains("is-active")) return;
      activeIndex = index;
      openLightbox();
    });
  });

  lightboxClose?.addEventListener("click", closeLightbox);
  lightboxPrev?.addEventListener("click", () => prev());
  lightboxNext?.addEventListener("click", () => next());

  albumLightbox?.addEventListener("click", (event) => {
    if (event.target === albumLightbox) closeLightbox();
  });

  albumLightbox?.addEventListener("pointerdown", (event) => {
    lightboxStartX = event.clientX;
  });

  albumLightbox?.addEventListener("pointerup", (event) => {
    const dx = event.clientX - lightboxStartX;
    if (Math.abs(dx) > 50) {
      if (dx < 0) next();
      else prev();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (!albumLightbox?.classList.contains("is-open")) return;
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft") prev();
    if (event.key === "ArrowRight") next();
  });

  albumCarousel.addEventListener("mouseenter", stopAutoplay);
  albumCarousel.addEventListener("mouseleave", () => {
    if (!albumLightbox?.classList.contains("is-open")) startAutoplay();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopAutoplay();
    else if (!albumLightbox?.classList.contains("is-open")) startAutoplay();
  });

  renderAlbum();

  const albumVisibilityObserver = new IntersectionObserver((entries) => {
    albumInView = entries.some((entry) => entry.isIntersecting);
    if (albumInView) startAutoplay();
    else stopAutoplay();
  }, { threshold: 0.12 });

  albumVisibilityObserver.observe(albumCarousel);
}

// Add the wedding reception to the guest's calendar as an .ics file.
const addCalendarButton = document.getElementById("addCalendarButton");
if (addCalendarButton) {
  addCalendarButton.addEventListener("click", () => {
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Wedding Invitation//VI",
      "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      "UID:wedding-20260103-1800@example.local",
      "DTSTAMP:20260924T000000Z",
      "DTSTART:20260103T180000",
      "DTEND:20260103T210000",
      `SUMMARY:Tiệc cưới ${weddingConfig.groom.name} & ${weddingConfig.bride.name}`,
      "DESCRIPTION:Trân trọng kính mời bạn đến chung vui cùng gia đình.",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "tiec-cuoi-03-01-2026.ics";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
}


// RSVP form: mobile-first modal. Until a remote endpoint is connected,
// the latest response is preserved locally on this device.
const rsvpButton = document.getElementById("rsvpButton");
const rsvpModal = document.getElementById("rsvpModal");
const rsvpClose = document.getElementById("rsvpClose");
const rsvpDone = document.getElementById("rsvpDone");
const rsvpForm = document.getElementById("rsvpForm");
const rsvpFormView = document.getElementById("rsvpFormView");
const rsvpSuccess = document.getElementById("rsvpSuccess");
const rsvpSuccessText = document.getElementById("rsvpSuccessText");
const rsvpError = document.getElementById("rsvpError");
const guestCountField = document.getElementById("guestCountField");
const rsvpGuests = document.getElementById("rsvpGuests");
const attendanceInputs = [...document.querySelectorAll('input[name="attendance"]')];
const RSVP_STORAGE_KEY = "wedding-rsvp-latest";

function setGuestCountVisibility() {
  const attendance = document.querySelector('input[name="attendance"]:checked')?.value;
  const isAttending = attendance !== "no";
  guestCountField?.classList.toggle("is-disabled", !isAttending);
  if (rsvpGuests) rsvpGuests.disabled = !isAttending;
}

function resetRsvpView() {
  if (rsvpFormView) rsvpFormView.hidden = false;
  if (rsvpSuccess) rsvpSuccess.hidden = true;
  if (rsvpError) rsvpError.textContent = "";
}

function hydrateRsvpForm() {
  if (!rsvpForm) return;
  try {
    const saved = JSON.parse(localStorage.getItem(RSVP_STORAGE_KEY) || "null");
    if (!saved) return;
    if (rsvpForm.elements.name) rsvpForm.elements.name.value = saved.name || "";
    if (rsvpForm.elements.guests) rsvpForm.elements.guests.value = String(saved.guests || "1");
    if (rsvpForm.elements.message) rsvpForm.elements.message.value = saved.message || "";
    const attendance = attendanceInputs.find((input) => input.value === saved.attendance);
    if (attendance) attendance.checked = true;
    setGuestCountVisibility();
  } catch (_) {
    // Ignore malformed local data.
  }
}

function openRsvp() {
  if (!rsvpModal) return;
  resetRsvpView();
  hydrateRsvpForm();
  rsvpModal.classList.add("is-open");
  rsvpModal.setAttribute("aria-hidden", "false");
  page.classList.add("is-rsvp-open");
  window.setTimeout(() => document.getElementById("rsvpName")?.focus({ preventScroll: true }), 320);
}

function closeRsvp() {
  if (!rsvpModal) return;
  rsvpModal.classList.remove("is-open");
  rsvpModal.setAttribute("aria-hidden", "true");
  page.classList.remove("is-rsvp-open");
  rsvpButton?.focus({ preventScroll: true });
}

attendanceInputs.forEach((input) => input.addEventListener("change", setGuestCountVisibility));
rsvpButton?.addEventListener("click", openRsvp);
rsvpClose?.addEventListener("click", closeRsvp);
rsvpDone?.addEventListener("click", closeRsvp);
rsvpModal?.querySelectorAll("[data-rsvp-close]").forEach((node) => node.addEventListener("click", closeRsvp));

rsvpForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!rsvpForm) return;

  const formData = new FormData(rsvpForm);
  const name = String(formData.get("name") || "").trim();
  const attendance = String(formData.get("attendance") || "");
  const guests = attendance === "yes" ? Number(formData.get("guests") || 1) : 0;
  const message = String(formData.get("message") || "").trim();

  if (rsvpError) rsvpError.textContent = "";

  if (!name) {
    if (rsvpError) rsvpError.textContent = "Vui lòng nhập họ và tên của bạn.";
    document.getElementById("rsvpName")?.focus();
    return;
  }

  if (!attendance) {
    if (rsvpError) rsvpError.textContent = "Vui lòng chọn bạn có tham dự hay không.";
    return;
  }

  const submission = {
    name,
    attendance,
    guests,
    message,
    submittedAt: new Date().toISOString(),
  };

  const submitButton = rsvpForm.querySelector('.rsvp-submit');
  const oldLabel = submitButton?.textContent;
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "ĐANG GỬI...";
  }

  try {
    if (location.protocol === "file:") {
      localStorage.setItem(RSVP_STORAGE_KEY, JSON.stringify(submission));
    } else {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submission),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) {
        throw new Error(result.error || "Không thể gửi xác nhận lúc này.");
      }
      try { localStorage.setItem(RSVP_STORAGE_KEY, JSON.stringify(submission)); } catch (_) {}
    }

    if (rsvpFormView) rsvpFormView.hidden = true;
    if (rsvpSuccess) rsvpSuccess.hidden = false;
    if (rsvpSuccessText) {
      rsvpSuccessText.textContent = attendance === "yes"
        ? `Cảm ơn ${name}. Hẹn gặp bạn${guests > 1 ? ` cùng ${guests - 1} người đi cùng` : ""} trong ngày vui của chúng tôi.`
        : `Cảm ơn ${name} đã phản hồi. Chúng tôi rất trân trọng lời nhắn của bạn.`;
    }
  } catch (error) {
    if (rsvpError) rsvpError.textContent = error?.message || "Không thể gửi xác nhận. Vui lòng thử lại.";
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = oldLabel || "GỬI XÁC NHẬN";
    }
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && rsvpModal?.classList.contains("is-open")) closeRsvp();
});

setGuestCountVisibility();

// Guestbook: reads/writes through Vercel API -> Google Apps Script -> Google Sheet.
// When opened directly as a local file, it falls back to localStorage for previewing the UI.
const guestbookForm = document.getElementById("guestbookForm");
const guestbookList = document.getElementById("guestbookList");
const guestbookError = document.getElementById("guestbookError");
const GUESTBOOK_STORAGE_KEY = "wedding-guestbook-entries";
const defaultGuestbookEntries = [
  { name: "Duy Khang", message: "Chúc mừng ngày vui của hai bạn, trăm năm hạnh phúc bền lâu!", submittedAt: "2026-07-26T12:30:49+07:00" },
  { name: "Lan Chi", message: "Đẹp đôi quá! Chúc hai bạn sống bên nhau đầu bạc răng long.", submittedAt: "2026-07-26T12:30:49+07:00" },
  { name: "Tuấn Anh", message: "Mừng hạnh phúc hai bạn! Chúc gia đình nhỏ luôn đầy ắp tiếng cười.", submittedAt: "2026-07-26T12:30:49+07:00" },
  { name: "Khánh Vy", message: "Chúc cô dâu chú rể luôn giữ được nụ cười này mãi mãi nhé!", submittedAt: "2026-07-26T12:30:49+07:00" },
];

function formatGuestbookDate(isoString) {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";
  const two = (n) => String(n).padStart(2, "0");
  return `${two(date.getHours())}:${two(date.getMinutes())}:${two(date.getSeconds())} ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

function loadLocalGuestbookEntries() {
  try {
    const saved = JSON.parse(localStorage.getItem(GUESTBOOK_STORAGE_KEY) || "null");
    if (Array.isArray(saved) && saved.length) return saved;
  } catch (_) {}
  return defaultGuestbookEntries;
}

function saveLocalGuestbookEntries(entries) {
  try { localStorage.setItem(GUESTBOOK_STORAGE_KEY, JSON.stringify(entries)); } catch (_) {}
}

function createGuestbookEntryElement(entry) {
  const article = document.createElement("article");
  article.className = "guestbook-entry";
  article.innerHTML = `
    <div class="guestbook-entry-head">
      <strong class="guestbook-entry-name"></strong>
      <time class="guestbook-entry-time"></time>
    </div>
    <p class="guestbook-entry-message"></p>
  `;
  article.querySelector(".guestbook-entry-name").textContent = entry.name;
  article.querySelector(".guestbook-entry-time").textContent = formatGuestbookDate(entry.submittedAt);
  article.querySelector(".guestbook-entry-message").textContent = entry.message;
  return article;
}

function paintGuestbook(entries) {
  if (!guestbookList) return;
  guestbookList.innerHTML = "";
  entries.forEach((entry) => guestbookList.appendChild(createGuestbookEntryElement(entry)));
}

async function renderGuestbook() {
  if (!guestbookList) return;
  if (location.protocol === "file:") {
    paintGuestbook(loadLocalGuestbookEntries());
    return;
  }

  try {
    const response = await fetch(`/api/wishes?t=${Date.now()}`, { cache: "no-store" });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.ok || !Array.isArray(result.wishes)) throw new Error();
    paintGuestbook(result.wishes);
  } catch (_) {
    paintGuestbook(defaultGuestbookEntries);
  }
}

if (guestbookForm) {
  renderGuestbook();

  guestbookForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(guestbookForm);
    const name = String(formData.get("name") || "").trim();
    const message = String(formData.get("message") || "").trim();
    if (guestbookError) guestbookError.textContent = "";

    if (!name) {
      if (guestbookError) guestbookError.textContent = "Vui lòng nhập tên của bạn.";
      document.getElementById("guestbookName")?.focus();
      return;
    }
    if (!message) {
      if (guestbookError) guestbookError.textContent = "Vui lòng nhập lời chúc của bạn.";
      document.getElementById("guestbookMessage")?.focus();
      return;
    }

    const submitButton = guestbookForm.querySelector('.guestbook-submit');
    const oldLabel = submitButton?.textContent;
    if (submitButton) { submitButton.disabled = true; submitButton.textContent = "ĐANG GỬI..."; }

    try {
      if (location.protocol === "file:") {
        const entries = loadLocalGuestbookEntries();
        entries.unshift({ name, message, submittedAt: new Date().toISOString() });
        saveLocalGuestbookEntries(entries);
        paintGuestbook(entries);
      } else {
        const response = await fetch("/api/wishes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, message }),
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok || !result.ok) throw new Error(result.error || "Không thể gửi lời chúc lúc này.");
        await renderGuestbook();
      }
      guestbookForm.reset();
      guestbookList?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } catch (error) {
      if (guestbookError) guestbookError.textContent = error?.message || "Không thể gửi lời chúc. Vui lòng thử lại.";
    } finally {
      if (submitButton) { submitButton.disabled = false; submitButton.textContent = oldLabel || "GỬI LỜI CHÚC"; }
    }
  });
} else {
  renderGuestbook();
}


// =========================================================
// Wish suggestions — random templates, synchronized with names in wedding-config.js
// =========================================================
const wishSuggestButton = document.getElementById("wishSuggestButton");
const wishSuggestModal = document.getElementById("wishSuggestModal");
const wishSuggestClose = document.getElementById("wishSuggestClose");
const wishCloseSecondary = document.getElementById("wishCloseSecondary");
const wishGenerateMore = document.getElementById("wishGenerateMore");
const wishSuggestList = document.getElementById("wishSuggestList");
const guestbookMessage = document.getElementById("guestbookMessage");

const wishTemplates = [
  "Chúc {groom} và {bride} hạnh phúc đến đầu bạc răng long, sống trọn đời bên nhau.",
  "Chúc hai bạn một đời bình an, đủ yêu thương để cùng nhau đi qua mọi mùa trong cuộc sống.",
  "Mong tổ ấm của {groom} và {bride} luôn đầy ắp tiếng cười, sự dịu dàng và những điều may mắn.",
  "Chúc đôi bạn trẻ mãi gắn bó, yêu thương và sẻ chia với nhau mọi điều trong cuộc sống.",
  "Chúc hai bạn luôn tràn ngập yêu thương và hạnh phúc trong suốt quãng đời còn lại.",
  "Mong {groom} và {bride} luôn tìm thấy bình yên và hạnh phúc trong vòng tay của nhau.",
  "Chúc hành trình hôn nhân của hai bạn luôn ngọt ngào như ngày đầu tiên.",
  "Chúc hai bạn cùng nhau viết nên thật nhiều kỷ niệm đẹp và một mái ấm thật ấm áp.",
  "Mong mỗi ngày bên nhau đều là một ngày đáng nhớ đối với {groom} và {bride}.",
  "Chúc tình yêu của hai bạn ngày càng bền chặt, dịu dàng và rực rỡ theo năm tháng.",
  "Chúc hai bạn mãi nhìn nhau bằng ánh mắt hạnh phúc như trong ngày cưới hôm nay.",
  "Mong cuộc sống mới của hai bạn luôn có thật nhiều tiếng cười và những cái ôm thật lâu.",
  "Chúc {groom} và {bride} luôn đồng hành, thấu hiểu và là chỗ dựa vững vàng của nhau.",
  "Chúc hai bạn một cuộc hôn nhân viên mãn, gia đình nhỏ lúc nào cũng ngập tràn niềm vui.",
  "Mong hai bạn cùng nhau đi thật xa, thật lâu và vẫn luôn muốn nắm tay nhau như hôm nay.",
  "Chúc cô dâu chú rể trăm năm hạnh phúc, sớm có thêm thật nhiều niềm vui mới.",
  "Chúc hai bạn yêu nhau bằng sự kiên nhẫn, bao dung và những điều giản dị nhất mỗi ngày.",
  "Mong tổ ấm của hai bạn luôn là nơi bình yên nhất để trở về sau mỗi ngày dài.",
  "Chúc {groom} và {bride} mãi giữ được nụ cười rạng rỡ và sự ấm áp dành cho nhau.",
  "Chúc hai bạn có một cuộc đời chung thật đẹp, đủ nắng, đủ mưa và luôn có nhau.",
  "Mừng ngày hai bạn về chung một nhà. Chúc mọi điều tốt đẹp nhất sẽ đến với gia đình nhỏ.",
  "Chúc hai bạn luôn cùng nhìn về một hướng, cùng mơ những giấc mơ đẹp và biến chúng thành sự thật.",
  "Mong tình yêu của hai bạn luôn là nơi bắt đầu của thật nhiều điều tử tế và hạnh phúc.",
  "Chúc đôi uyên ương một đời hòa thuận, vui vẻ và mãi là người bạn thân nhất của nhau.",
  "Chúc {groom} và {bride} mỗi năm bên nhau lại có thêm nhiều lý do để yêu nhau hơn.",
  "Mong hai bạn luôn nhớ rằng điều đẹp nhất của hôn nhân là mỗi ngày vẫn chọn ở bên nhau.",
  "Chúc ngày vui hôm nay chỉ là khởi đầu cho hàng nghìn ngày hạnh phúc phía trước.",
  "Chúc cô dâu chú rể mãi son sắt, thuận hòa và có một mái ấm tràn đầy tiếng cười.",
];

function personalizeWish(template) {
  return template
    .replaceAll("{groom}", weddingConfig.groom.shortName || weddingConfig.groom.name)
    .replaceAll("{bride}", weddingConfig.bride.shortName || weddingConfig.bride.name);
}

function pickRandomWishes(count = 5) {
  const pool = [...wishTemplates];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count).map(personalizeWish);
}

function renderWishSuggestions() {
  if (!wishSuggestList) return;
  wishSuggestList.innerHTML = "";
  pickRandomWishes(5).forEach((wish) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "wish-suggest-item";
    button.textContent = wish;
    button.addEventListener("click", () => {
      if (guestbookMessage) guestbookMessage.value = wish;
      closeWishSuggestions();
      guestbookMessage?.focus({ preventScroll: false });
    });
    wishSuggestList.appendChild(button);
  });
}

function openWishSuggestions() {
  if (!wishSuggestModal) return;
  renderWishSuggestions();
  wishSuggestModal.classList.add("is-open");
  wishSuggestModal.setAttribute("aria-hidden", "false");
  page.classList.add("is-modal-open");
  wishSuggestClose?.focus({ preventScroll: true });
}

function closeWishSuggestions() {
  if (!wishSuggestModal) return;
  wishSuggestModal.classList.remove("is-open");
  wishSuggestModal.setAttribute("aria-hidden", "true");
  page.classList.remove("is-modal-open");
}

wishSuggestButton?.addEventListener("click", openWishSuggestions);
wishSuggestClose?.addEventListener("click", closeWishSuggestions);
wishCloseSecondary?.addEventListener("click", closeWishSuggestions);
wishGenerateMore?.addEventListener("click", renderWishSuggestions);
wishSuggestModal?.querySelector("[data-wish-close]")?.addEventListener("click", closeWishSuggestions);

// =========================================================
// Gift box — groom only, bank info synchronized from wedding-config.js
// =========================================================
const giftOpenButton = document.getElementById("giftOpenButton");
const giftModal = document.getElementById("giftModal");
const giftModalClose = document.getElementById("giftModalClose");
const giftGroomName = document.getElementById("giftGroomName");
const giftBankName = document.getElementById("giftBankName");
const giftBankAccount = document.getElementById("giftBankAccount");
const giftBankAccountName = document.getElementById("giftBankAccountName");
const giftQrImage = document.getElementById("giftQrImage");
const giftQrPlaceholder = document.getElementById("giftQrPlaceholder");
const giftSaveQr = document.getElementById("giftSaveQr");

function hydrateGiftInfo() {
  if (giftGroomName) giftGroomName.textContent = weddingConfig.bride.name;
  if (giftBankName) giftBankName.textContent = weddingConfig.bride.bankName || "Ngân hàng của chú rể";
  if (giftBankAccount) giftBankAccount.textContent = weddingConfig.bride.bankAccount || "Cập nhật số tài khoản";
  if (giftBankAccountName) giftBankAccountName.textContent = weddingConfig.bride.bankAccountName || weddingConfig.bride.name.toUpperCase();

  const qr = String(weddingConfig.bride.bankQrImage || "").trim();
  if (qr && giftQrImage) {
    giftQrImage.src = qr;
    giftQrImage.hidden = false;
    if (giftQrPlaceholder) giftQrPlaceholder.hidden = true;
    if (giftSaveQr) {
      giftSaveQr.href = qr;
      giftSaveQr.classList.remove("is-disabled");
      giftSaveQr.setAttribute("aria-disabled", "false");
    }
  } else {
    if (giftQrImage) giftQrImage.hidden = true;
    if (giftQrPlaceholder) giftQrPlaceholder.hidden = false;
    if (giftSaveQr) {
      giftSaveQr.href = "#";
      giftSaveQr.classList.add("is-disabled");
      giftSaveQr.setAttribute("aria-disabled", "true");
    }
  }
}

giftSaveQr?.addEventListener("click", (event) => {
  if (giftSaveQr.classList.contains("is-disabled")) event.preventDefault();
});

function openGiftModal() {
  if (!giftModal) return;
  hydrateGiftInfo();
  giftModal.classList.add("is-open");
  giftModal.setAttribute("aria-hidden", "false");
  page.classList.add("is-modal-open");
  giftModalClose?.focus({ preventScroll: true });
}

function closeGiftModal() {
  if (!giftModal) return;
  giftModal.classList.remove("is-open");
  giftModal.setAttribute("aria-hidden", "true");
  page.classList.remove("is-modal-open");
}

giftOpenButton?.addEventListener("click", openGiftModal);
giftModalClose?.addEventListener("click", closeGiftModal);
giftModal?.querySelector("[data-gift-close]")?.addEventListener("click", closeGiftModal);
hydrateGiftInfo();

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (wishSuggestModal?.classList.contains("is-open")) closeWishSuggestions();
  if (giftModal?.classList.contains("is-open")) closeGiftModal();
});
