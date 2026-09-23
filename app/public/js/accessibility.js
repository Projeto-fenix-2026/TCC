/* ============================================================
   accessibility.js – Painel de Acessibilidade (global)
   Carregado via header2.ejs em todas as páginas.
   ============================================================ */
(function () {
  const PREFIX = "a11y_";
  const html = document.documentElement;

  function getItem(key, fallback) {
    try {
      const v = localStorage.getItem(key);
      return v === null ? fallback : v;
    } catch {
      return fallback;
    }
  }

  function setItem(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* localStorage indisponível (ex.: modo privado) */
    }
  }

  const state = {
    textContrast: getItem(PREFIX + "textContrast", "0") === "1",
    pageContrast: getItem(PREFIX + "pageContrast", "0") === "1",
    colorIntensity: getItem(PREFIX + "colorIntensity", "normal"),
    pageColors: getItem(PREFIX + "pageColors", "normal"),
    dyslexia: getItem("dyslexia", "false") === "true",
    fontSize: parseInt(getItem("fontSize", "100"), 10),
    readingGuide: getItem(PREFIX + "readingGuide", "0") === "1",
    readingRuler: getItem(PREFIX + "readingRuler", "0") === "1",
    highlightLinks: getItem(PREFIX + "highlightLinks", "0") === "1",
  };

  const LEVEL_LABELS = {
    bool: { on: "Ligado", off: "Desligado" },
    colorIntensity: { normal: "Normal", baixa: "Baixa", alta: "Alta" },
    pageColors: { normal: "Padrão", escuro: "Escuro", sepia: "Sépia" },
  };

  function computeFilter() {
    const parts = [];
    if (state.pageContrast) parts.push("contrast(1.35)");
    if (state.colorIntensity === "baixa") parts.push("saturate(0.35)");
    if (state.colorIntensity === "alta") parts.push("saturate(1.9)");
    if (state.pageColors === "escuro") parts.push("invert(1) hue-rotate(180deg)");
    if (state.pageColors === "sepia") parts.push("sepia(0.6)");
    html.style.filter = parts.join(" ");
  }

  // ── GUIA / RÉGUA DE LEITURA ──────────────────────────────
  let guideEl, rulerTopEl, rulerBottomEl;

  function ensureReadingElements() {
    if (!guideEl) {
      guideEl = document.createElement("div");
      guideEl.className = "a11y-reading-guide";
      document.body.appendChild(guideEl);
    }
    if (!rulerTopEl) {
      rulerTopEl = document.createElement("div");
      rulerTopEl.className = "a11y-reading-ruler-top";
      document.body.appendChild(rulerTopEl);
    }
    if (!rulerBottomEl) {
      rulerBottomEl = document.createElement("div");
      rulerBottomEl.className = "a11y-reading-ruler-bottom";
      document.body.appendChild(rulerBottomEl);
    }
  }

  function onMouseMoveGuide(e) {
    if (guideEl) guideEl.style.top = e.clientY - 21 + "px";
  }

  function onMouseMoveRuler(e) {
    const bandHeight = 64;
    const topLimit = Math.max(0, e.clientY - bandHeight / 2);
    if (rulerTopEl) {
      rulerTopEl.style.top = "0";
      rulerTopEl.style.height = topLimit + "px";
    }
    if (rulerBottomEl) {
      rulerBottomEl.style.top = topLimit + bandHeight + "px";
      rulerBottomEl.style.height = Math.max(0, window.innerHeight - topLimit - bandHeight) + "px";
    }
  }

  function applyReadingGuide() {
    ensureReadingElements();
    guideEl.classList.toggle("active", state.readingGuide);
    document.removeEventListener("mousemove", onMouseMoveGuide);
    if (state.readingGuide) document.addEventListener("mousemove", onMouseMoveGuide);
  }

  function applyReadingRuler() {
    ensureReadingElements();
    rulerTopEl.classList.toggle("active", state.readingRuler);
    rulerBottomEl.classList.toggle("active", state.readingRuler);
    document.removeEventListener("mousemove", onMouseMoveRuler);
    if (state.readingRuler) document.addEventListener("mousemove", onMouseMoveRuler);
  }

  // ── APLICAÇÃO GERAL ───────────────────────────────────────
  function applyAll() {
    html.classList.toggle("a11y-text-contrast", state.textContrast);
    html.classList.toggle("a11y-highlight-links", state.highlightLinks);
    document.body.classList.toggle("dyslexia", state.dyslexia);
    document.body.style.fontSize = state.fontSize + "%";
    computeFilter();
    applyReadingGuide();
    applyReadingRuler();
  }

  function updateCardUI() {
    document.querySelectorAll("[data-a11y-card]").forEach((card) => {
      const action = card.dataset.a11yCard;
      const levelEl = card.querySelector(".a11y-card-level");
      let active = false;
      let label = "";

      if (action === "colorIntensity") {
        active = state.colorIntensity !== "normal";
        label = LEVEL_LABELS.colorIntensity[state.colorIntensity];
      } else if (action === "pageColors") {
        active = state.pageColors !== "normal";
        label = LEVEL_LABELS.pageColors[state.pageColors];
      } else {
        active = !!state[action];
        label = active ? LEVEL_LABELS.bool.on : LEVEL_LABELS.bool.off;
      }

      card.classList.toggle("active", active);
      if (levelEl) levelEl.textContent = label;
    });

    const fontSizeVal = document.getElementById("a11yFontSizeVal");
    if (fontSizeVal) fontSizeVal.textContent = state.fontSize + "%";
  }

  function toggleBool(key, storageKey) {
    state[key] = !state[key];
    setItem(storageKey, state[key] ? "1" : "0");
  }

  function cycle(key, order, storageKey) {
    const idx = order.indexOf(state[key]);
    state[key] = order[(idx + 1) % order.length];
    setItem(storageKey, state[key]);
  }

  function onCardClick(action) {
    if (action === "colorIntensity") {
      cycle("colorIntensity", ["normal", "baixa", "alta"], PREFIX + "colorIntensity");
    } else if (action === "pageColors") {
      cycle("pageColors", ["normal", "escuro", "sepia"], PREFIX + "pageColors");
    } else if (action === "readingGuide") {
      toggleBool("readingGuide", PREFIX + "readingGuide");
      if (state.readingGuide && state.readingRuler) {
        state.readingRuler = false;
        setItem(PREFIX + "readingRuler", "0");
      }
    } else if (action === "readingRuler") {
      toggleBool("readingRuler", PREFIX + "readingRuler");
      if (state.readingRuler && state.readingGuide) {
        state.readingGuide = false;
        setItem(PREFIX + "readingGuide", "0");
      }
    } else if (action === "dyslexia") {
      toggleBool("dyslexia", "dyslexia");
      setItem("dyslexia", state.dyslexia ? "true" : "false");
    } else if (action === "textContrast") {
      toggleBool("textContrast", PREFIX + "textContrast");
    } else if (action === "pageContrast") {
      toggleBool("pageContrast", PREFIX + "pageContrast");
    } else if (action === "highlightLinks") {
      toggleBool("highlightLinks", PREFIX + "highlightLinks");
    }

    applyAll();
    updateCardUI();
  }

  function changeFontSize(delta) {
    const next = state.fontSize + delta;
    if (next < 70 || next > 150) return;
    state.fontSize = next;
    setItem("fontSize", state.fontSize);
    applyAll();
    updateCardUI();
  }

  function resetAll() {
    state.textContrast = false;
    state.pageContrast = false;
    state.colorIntensity = "normal";
    state.pageColors = "normal";
    state.dyslexia = false;
    state.fontSize = 100;
    state.readingGuide = false;
    state.readingRuler = false;
    state.highlightLinks = false;

    setItem(PREFIX + "textContrast", "0");
    setItem(PREFIX + "pageContrast", "0");
    setItem(PREFIX + "colorIntensity", "normal");
    setItem(PREFIX + "pageColors", "normal");
    setItem("dyslexia", "false");
    setItem("fontSize", "100");
    setItem(PREFIX + "readingGuide", "0");
    setItem(PREFIX + "readingRuler", "0");
    setItem(PREFIX + "highlightLinks", "0");

    applyAll();
    updateCardUI();
  }

  // ── PAINEL: abrir/fechar ─────────────────────────────────
  function initPanel() {
    const openBtn = document.getElementById("a11yToggleBtn");
    const overlay = document.getElementById("a11yOverlay");
    const closeBtn = document.getElementById("a11yPanelClose");
    const resetBtn = document.getElementById("a11yResetBtn");
    const fontPlus = document.getElementById("a11yFontPlus");
    const fontMinus = document.getElementById("a11yFontMinus");

    if (!openBtn || !overlay) return;

    openBtn.addEventListener("click", () => {
      overlay.classList.add("open");
      overlay.setAttribute("aria-hidden", "false");
    });

    function closePanel() {
      overlay.classList.remove("open");
      overlay.setAttribute("aria-hidden", "true");
    }

    closeBtn?.addEventListener("click", closePanel);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closePanel();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && overlay.classList.contains("open")) closePanel();
    });

    document.querySelectorAll("[data-a11y-card]").forEach((card) => {
      card.addEventListener("click", () => onCardClick(card.dataset.a11yCard));
    });

    fontPlus?.addEventListener("click", () => changeFontSize(10));
    fontMinus?.addEventListener("click", () => changeFontSize(-10));
    resetBtn?.addEventListener("click", resetAll);
  }

  applyAll();
  updateCardUI();
  initPanel();
})();
