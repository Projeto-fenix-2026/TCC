/* ============================================================
   chatbot.js – Assistente virtual (Gemini)
   Carregado via header2.ejs em todas as páginas.
   ============================================================ */
(function () {
  const TRANSCRIPT_KEY = "fenix_chat_transcript";

  const toggleBtn = document.getElementById("chatbotToggleBtn");
  const windowEl = document.getElementById("chatbotWindow");
  const closeBtn = document.getElementById("chatbotCloseBtn");
  const clearBtn = document.getElementById("chatbotClearBtn");
  const messagesEl = document.getElementById("chatbotMessages");
  const form = document.getElementById("chatbotForm");
  const input = document.getElementById("chatbotInput");
  const sendBtn = document.getElementById("chatbotSendBtn");

  if (!toggleBtn || !windowEl || !form) return;

  function getTranscript() {
    try {
      return JSON.parse(sessionStorage.getItem(TRANSCRIPT_KEY) || "[]");
    } catch {
      return [];
    }
  }

  function saveTranscript(transcript) {
    try {
      sessionStorage.setItem(TRANSCRIPT_KEY, JSON.stringify(transcript));
    } catch {
      /* sessionStorage indisponível (ex.: modo privado) */
    }
  }

  function renderMessage(role, text) {
    const bubble = document.createElement("div");
    bubble.className = "chatbot-msg " + role;
    bubble.textContent = text;
    messagesEl.appendChild(bubble);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return bubble;
  }

  function addMessage(role, text, persist) {
    renderMessage(role, text);
    if (persist !== false) {
      const transcript = getTranscript();
      transcript.push({ role, text });
      saveTranscript(transcript);
    }
  }

  function showTyping() {
    const typing = document.createElement("div");
    typing.className = "chatbot-typing";
    typing.id = "chatbotTyping";
    typing.innerHTML = "<span></span><span></span><span></span>";
    messagesEl.appendChild(typing);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function hideTyping() {
    document.getElementById("chatbotTyping")?.remove();
  }

  function greetingIfEmpty() {
    if (getTranscript().length > 0) return;
    addMessage(
      "bot",
      "Oi! Eu sou o assistente virtual da Fênix. Posso explicar como o site funciona, tirar dúvidas sobre tipos de violência, direitos e como buscar ajuda. Em caso de emergência, use o botão de emergência no topo da página. Como posso ajudar?",
    );
  }

  function restoreTranscript() {
    const transcript = getTranscript();
    if (transcript.length === 0) {
      greetingIfEmpty();
      return;
    }
    transcript.forEach((msg) => renderMessage(msg.role, msg.text));
  }

  async function enviarMensagem(mensagem) {
    addMessage("user", mensagem);
    input.value = "";
    sendBtn.disabled = true;
    showTyping();

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensagem }),
      });
      const data = await res.json().catch(() => ({}));
      hideTyping();

      if (!res.ok) {
        addMessage("error", data.erro || "Não consegui responder agora. Tente novamente.");
        return;
      }
      addMessage("bot", data.resposta || "Não consegui gerar uma resposta.");
    } catch {
      hideTyping();
      addMessage("error", "Sem conexão com o servidor. Tente novamente em instantes.");
    } finally {
      sendBtn.disabled = false;
    }
  }

  function openChat() {
    windowEl.classList.add("open");
    toggleBtn.classList.add("open");
    toggleBtn.setAttribute("aria-expanded", "true");
    restoreTranscriptOnce();
    setTimeout(() => input?.focus(), 150);
  }

  function closeChat() {
    windowEl.classList.remove("open");
    toggleBtn.classList.remove("open");
    toggleBtn.setAttribute("aria-expanded", "false");
  }

  let jaRestaurou = false;
  function restoreTranscriptOnce() {
    if (jaRestaurou) return;
    jaRestaurou = true;
    restoreTranscript();
  }

  toggleBtn.addEventListener("click", function () {
    if (windowEl.classList.contains("open")) {
      closeChat();
    } else {
      openChat();
    }
  });

  closeBtn?.addEventListener("click", closeChat);

  clearBtn?.addEventListener("click", async function () {
    messagesEl.innerHTML = "";
    saveTranscript([]);
    greetingIfEmpty();
    try {
      await fetch("/api/chatbot/limpar", { method: "POST" });
    } catch {
      /* sem conexão */
    }
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const mensagem = input.value.trim();
    if (!mensagem || sendBtn.disabled) return;
    enviarMensagem(mensagem);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && windowEl.classList.contains("open")) closeChat();
  });

  document.getElementById("chatbotEmergencyLink")?.addEventListener("click", function (event) {
    event.preventDefault();
    closeChat();
    document.getElementById("emergency-header-btn")?.click();
  });
})();
