/* ============================================================
   perfil.js – Rede de Apoio
   Versão atualizada: upload de foto corrigido
   ============================================================ */

// ── CONFIG API ────────────────────────────────────────────────
// Troque pelo endereço real da sua API
const BASE_URL = "/api";
const getToken = () => localStorage.getItem("token") || "";
const authHead = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

// ── UTILITÁRIOS ───────────────────────────────────────────────
function showToast(msg, type = "success", duration = 3200) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.className = `toast ${type} show`;
  setTimeout(() => (t.className = "toast"), duration);
}

function openModal(title, msg, onConfirm) {
  document.getElementById("modalTitle").textContent = title;
  document.getElementById("modalMsg").textContent = msg;
  document.getElementById("modalBg").classList.add("open");
  document.getElementById("modalConfirm").onclick = () => {
    closeModal();
    onConfirm();
  };
}

function closeModal() {
  document.getElementById("modalBg").classList.remove("open");
}

document.getElementById("modalCancel").addEventListener("click", closeModal);
document.getElementById("modalBg").addEventListener("click", (e) => {
  if (e.target === document.getElementById("modalBg")) closeModal();
});

// ── NAVEGAÇÃO SIDEBAR ─────────────────────────────────────────
const navItems = document.querySelectorAll(".nav-item[data-section]");
const sections = document.querySelectorAll(".section");

function activateSection(id) {
  navItems.forEach((n) => n.classList.remove("active"));
  sections.forEach((s) => s.classList.remove("active"));
  const link = document.querySelector(`.nav-item[data-section="${id}"]`);
  const sec = document.getElementById(`section-${id}`);
  if (link) link.classList.add("active");
  if (sec) sec.classList.add("active");
  if (window.innerWidth <= 768) closeSidebar();
}

navItems.forEach((item) => {
  item.addEventListener("click", (e) => {
    e.preventDefault();
    activateSection(item.dataset.section);
  });
});

// Links internos (ex.: "Upgrade para Plus")
document.querySelectorAll("[data-section]").forEach((el) => {
  if (!el.classList.contains("nav-item")) {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      activateSection(el.dataset.section);
    });
  }
});

// ── SIDEBAR MOBILE ────────────────────────────────────────────
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const menuBtn = document.getElementById("menuToggle");

function closeSidebar() {
  sidebar.classList.remove("open");
  overlay.classList.remove("open");
}

menuBtn.addEventListener("click", () => {
  sidebar.classList.toggle("open");
  overlay.classList.toggle("open");
});
overlay.addEventListener("click", closeSidebar);

// ── FOTO DE PERFIL ────────────────────────────────────────────
const avatarInput = document.getElementById("avatarInput");
const avatarPreview = document.getElementById("avatarPreview");
const topAvatar = document.getElementById("topAvatar");

// Abre o seletor de arquivo — limpa o valor antes para
// permitir re-selecionar o mesmo arquivo
function openFilePicker() {
  avatarInput.value = "";
  avatarInput.click();
}

// Três gatilhos → mesmo seletor
document
  .getElementById("changePhotoBtn")
  .addEventListener("click", openFilePicker);

document
  .getElementById("avatarEditBtn")
  .addEventListener("click", openFilePicker);

document.getElementById("avatarEditBtn").addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    openFilePicker();
  }
});

// Clicar direto na foto
avatarPreview.style.cursor = "pointer";
avatarPreview.addEventListener("click", openFilePicker);

// Quando o usuário escolhe o arquivo
avatarInput.addEventListener("change", async () => {
  const file = avatarInput.files[0];
  if (!file) return;

  // Validação de tipo
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.type)) {
    showToast("Formato inválido. Use JPG, PNG ou WEBP.", "error");
    return;
  }

  // Validação de tamanho (5 MB)
  if (file.size > 5 * 1024 * 1024) {
    showToast("Imagem maior que 5 MB. Escolha outra.", "error");
    return;
  }

  // Pré-visualização imediata
  const reader = new FileReader();
  reader.onload = (ev) => {
    avatarPreview.src = ev.target.result;
    if (topAvatar) topAvatar.src = ev.target.result;
  };
  reader.readAsDataURL(file);

  // Upload para o servidor
  showToast("Enviando foto…", "info", 8000);
  const form = new FormData();
  form.append("foto", file);
  try {
    const res = await fetch(`${BASE_URL}/perfil/foto`, {
      method: "POST",
      headers: { Authorization: `Bearer ${getToken()}` },
      body: form,
    });
    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      if (data.foto_url) {
        avatarPreview.src = data.foto_url;
        if (topAvatar) topAvatar.src = data.foto_url;
      }
      showToast("Foto atualizada com sucesso!");
    } else {
      const err = await res.json().catch(() => ({}));
      showToast(err.mensagem || "Erro ao enviar foto.", "error");
    }
  } catch {
    showToast("Sem conexão com o servidor.", "error");
  }
});

// Remover foto
document.getElementById("removePhoto").addEventListener("click", () => {
  openModal("Remover foto", "Deseja remover sua foto de perfil?", async () => {
    const def =
      "https://ui-avatars.com/api/?name=Usuario&background=c49a4a&color=fff&size=120";
    avatarPreview.src = def;
    if (topAvatar) topAvatar.src = def;
    await apiFetch("/perfil/foto", "DELETE");
    showToast("Foto removida.");
  });
});

// ── DADOS PESSOAIS ────────────────────────────────────────────
document.getElementById("formDados").addEventListener("submit", async (e) => {
  e.preventDefault();
  const payload = {
    nome: document.getElementById("nome").value.trim(),
    apelido: document.getElementById("apelido").value.trim(),
    sobre: document.getElementById("sobre").value.trim(),
  };
  const ok = await apiFetch("/perfil/dados", "PUT", payload);
  if (ok) showToast("Perfil atualizado!");
});

// ── ALTERAR E-MAIL ────────────────────────────────────────────
document.getElementById("formEmail").addEventListener("submit", async (e) => {
  e.preventDefault();
  const emailNovo = document.getElementById("emailNovo").value.trim();
  const emailConfirm = document.getElementById("emailConfirm").value.trim();
  const senha = document.getElementById("senhaConfirmEmail").value;

  if (emailNovo !== emailConfirm) {
    showToast("Os e-mails não conferem.", "error");
    return;
  }

  const ok = await apiFetch("/perfil/email", "PUT", {
    email_atual: document.getElementById("emailAtual").value.trim(),
    email_novo: emailNovo,
    senha,
  });
  if (ok) {
    showToast("E-mail atualizado! Verifique sua caixa de entrada.");
    document.getElementById("formEmail").reset();
  }
});

// ── ALTERAR SENHA ─────────────────────────────────────────────
const senhaNova = document.getElementById("senhaNova");
const strengthFill = document.getElementById("strengthFill");
const strengthLabel = document.getElementById("strengthLabel");

senhaNova.addEventListener("input", () => {
  const v = senhaNova.value;
  let score = 0;
  if (v.length >= 8) score++;
  if (/[A-Z]/.test(v)) score++;
  if (/[0-9]/.test(v)) score++;
  if (/[^A-Za-z0-9]/.test(v)) score++;
  const pct = score * 25;
  const colors = ["#e57373", "#fb8c00", "#fdd835", "#4caf50"];
  const labels = ["Muito fraca", "Fraca", "Razoável", "Forte"];
  strengthFill.style.width = pct + "%";
  strengthFill.style.background = score > 0 ? colors[score - 1] : "transparent";
  strengthLabel.textContent = v.length ? labels[score - 1] || "" : "";
});

document.getElementById("formSenha").addEventListener("submit", async (e) => {
  e.preventDefault();
  const atual = document.getElementById("senhaAtual").value;
  const nova = document.getElementById("senhaNova").value;
  const confirm = document.getElementById("senhaNovaConfirm").value;

  if (nova !== confirm) {
    showToast("As senhas não conferem.", "error");
    return;
  }
  if (nova.length < 8) {
    showToast("A senha deve ter pelo menos 8 caracteres.", "error");
    return;
  }

  const ok = await apiFetch("/perfil/senha", "PUT", {
    senha_atual: atual,
    senha_nova: nova,
  });
  if (ok) {
    showToast("Senha alterada com sucesso!");
    document.getElementById("formSenha").reset();
    strengthFill.style.width = "0";
    strengthLabel.textContent = "";
  }
});

// ── TOGGLE SENHA (olhinho) ────────────────────────────────────
document.querySelectorAll(".toggle-pass").forEach((btn) => {
  btn.addEventListener("click", () => {
    const input = document.getElementById(btn.dataset.target);
    if (!input) return;
    const isPass = input.type === "password";
    input.type = isPass ? "text" : "password";
    btn.classList.toggle("fa-eye", !isPass);
    btn.classList.toggle("fa-eye-slash", isPass);
  });
});

// ── DEPOIMENTOS ───────────────────────────────────────────────
const depTexto = document.getElementById("depTexto");
const charCount = document.getElementById("charCount");
let depoimentos = [];

depTexto.addEventListener("input", () => {
  const len = depTexto.value.length;
  charCount.textContent = Math.min(len, 1000);
  if (len > 1000) depTexto.value = depTexto.value.slice(0, 1000);
});

document
  .getElementById("formDepoimento")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const titulo = document.getElementById("depTitulo").value.trim();
    const texto = depTexto.value.trim();
    const anonimato = document.getElementById("depAnon").value;
    const vis = document.getElementById("depVis").value;
    const consent = document.getElementById("depConsentimento").checked;

    if (!titulo || !texto) {
      showToast("Preencha o título e o depoimento.", "error");
      return;
    }
    if (!consent) {
      showToast("Você precisa autorizar a publicação.", "error");
      return;
    }

    const data = await apiFetchData("/depoimentos", "POST", {
      titulo,
      texto,
      anonimato,
      visibilidade: vis,
    });
    if (data) {
      depoimentos.unshift({
        ...data,
        titulo,
        texto,
        anonimato,
        visibilidade: vis,
        criado_em: new Date().toLocaleDateString("pt-BR"),
      });
      renderDepoimentos();
      document.getElementById("formDepoimento").reset();
      charCount.textContent = "0";
      showToast("Depoimento publicado!");
    }
  });

async function loadDepoimentos() {
  const data = await apiFetchData("/depoimentos/meus", "GET");
  if (data) {
    depoimentos = data;
    renderDepoimentos();
  }
}

function renderDepoimentos() {
  const container = document.getElementById("testimonialsList");
  if (!depoimentos.length) {
    container.innerHTML = `<div class="empty-state"><i class="fa-solid fa-comment-slash"></i><p>Você ainda não publicou nenhum depoimento.</p></div>`;
    return;
  }
  container.innerHTML = depoimentos
    .map(
      (d) => `
    <div class="testimonial-item" data-id="${d.id}">
      <div class="test-header">
        <span class="test-title">${escHtml(d.titulo)}</span>
        <div class="test-meta">
          <span class="test-badge ${d.visibilidade === "publico" ? "pub" : d.visibilidade === "privado" ? "priv" : "com"}">
            ${d.visibilidade === "publico" ? "Público" : d.visibilidade === "privado" ? "Privado" : "Comunidade"}
          </span>
          <span style="font-size:.72rem;color:var(--text-muted)">${d.criado_em || ""}</span>
        </div>
      </div>
      <p class="test-text">${escHtml(d.texto)}</p>
      <div class="test-actions">
        <button class="test-btn test-btn-edit" onclick="editarDep(${d.id})">Editar</button>
        <button class="test-btn test-btn-del"  onclick="deletarDep(${d.id})">Excluir</button>
      </div>
    </div>`,
    )
    .join("");
}

window.editarDep = function (id) {
  const dep = depoimentos.find((d) => d.id === id);
  if (!dep) return;
  document.getElementById("depTitulo").value = dep.titulo;
  depTexto.value = dep.texto;
  document.getElementById("depAnon").value = dep.anonimato || "apelido";
  document.getElementById("depVis").value = dep.visibilidade || "publico";
  charCount.textContent = dep.texto.length;
  activateSection("depoimentos");
  document
    .getElementById("formDepoimento")
    .scrollIntoView({ behavior: "smooth" });
  showToast('Edite e clique em "Publicar" para salvar.', "info");
};

window.deletarDep = function (id) {
  openModal(
    "Excluir Depoimento",
    "Tem certeza? Esta ação não pode ser desfeita.",
    async () => {
      const ok = await apiFetch(`/depoimentos/${id}`, "DELETE");
      if (ok) {
        depoimentos = depoimentos.filter((d) => d.id !== id);
        renderDepoimentos();
        showToast("Depoimento excluído.");
      }
    },
  );
};

// ── NÚMEROS DE SOCORRO ────────────────────────────────────────
let socorros = [];
let userPlan = "free";
const MAX_FREE = 3;
const MAX_PLUS = 7;

async function loadSocorros() {
  const data = await apiFetchData("/socorro", "GET");
  if (data) {
    socorros = data;
    renderSocorros();
  }
}

function renderSocorros() {
  const max = userPlan === "plus" ? MAX_PLUS : MAX_FREE;
  const grid = document.getElementById("emergencyGrid");
  const btnAdd = document.getElementById("btnAddSocorro");

  btnAdd.disabled = socorros.length >= max;
  btnAdd.textContent =
    socorros.length >= max
      ? userPlan === "plus"
        ? `Limite atingido (${MAX_PLUS}/${MAX_PLUS})`
        : `Limite gratuito (${MAX_FREE}/${MAX_FREE})`
      : "Adicionar número";

  const icons = { phone: "📞", shield: "🛡️", heart: "💜", ambulance: "🚑" };
  grid.innerHTML = socorros
    .map(
      (s) => `
    <div class="emergency-card">
      <div class="ec-cat">${escHtml(s.categoria)}</div>
      <div class="ec-name">${icons[s.icone] || "📞"} ${escHtml(s.nome)}</div>
      <div class="ec-number">${escHtml(s.numero)}</div>
      ${s.descricao ? `<div class="ec-desc">${escHtml(s.descricao)}</div>` : ""}
      <div class="ec-actions">
        <button class="ec-btn ec-btn-call" onclick="ligar('${s.numero}')">📞 Ligar</button>
        <button class="ec-btn ec-btn-del"  onclick="deletarSocorro(${s.id})">🗑️ Remover</button>
      </div>
    </div>`,
    )
    .join("");
}

window.ligar = (numero) => {
  window.location.href = `tel:${numero.replace(/\D/g, "")}`;
};

window.deletarSocorro = function (id) {
  openModal(
    "Remover Número",
    "Deseja remover este número de socorro?",
    async () => {
      const ok = await apiFetch(`/socorro/${id}`, "DELETE");
      if (ok) {
        socorros = socorros.filter((s) => s.id !== id);
        renderSocorros();
        showToast("Número removido.");
      }
    },
  );
};

document.getElementById("formSocorro").addEventListener("submit", async (e) => {
  e.preventDefault();
  const max = userPlan === "plus" ? MAX_PLUS : MAX_FREE;
  if (socorros.length >= max) {
    showToast("Limite atingido para seu plano.", "error");
    return;
  }

  const payload = {
    nome: document.getElementById("sNome").value.trim(),
    numero: document.getElementById("sNumero").value.trim(),
    categoria: document.getElementById("sCat").value,
    icone: document.getElementById("sIcone").value,
    descricao: document.getElementById("sDesc").value.trim(),
  };
  if (!payload.nome || !payload.numero) {
    showToast("Preencha nome e número.", "error");
    return;
  }

  const data = await apiFetchData("/socorro", "POST", payload);
  if (data) {
    socorros.push({ ...payload, id: data.id });
    renderSocorros();
    document.getElementById("formSocorro").reset();
    showToast("Número adicionado!");
  }
});

// ── PRIVACIDADE ───────────────────────────────────────────────
async function loadPrivacidade() {
  const data = await apiFetchData("/configuracoes/privacidade", "GET");
  if (!data) return;
  setToggle("perfilPublico", data.perfil_publico);
  setToggle("exibirFoto", data.exibir_foto);
  setToggle("exibirDep", data.exibir_depoimentos);
  setToggle("apareceBusca", data.aparece_buscas);
  setToggle("cookieAnalise", data.cookie_analise);
  setToggle("cookiePerso", data.cookie_personalizacao);
  setToggle("toggle2fa", data.dois_fatores);
  setToggle("alertaLogin", data.alerta_login);
}

function setToggle(id, val) {
  const el = document.getElementById(id);
  if (el) el.checked = !!val;
}

[
  "perfilPublico",
  "exibirFoto",
  "exibirDep",
  "apareceBusca",
  "cookieAnalise",
  "cookiePerso",
  "toggle2fa",
  "alertaLogin",
].forEach((id) => {
  const el = document.getElementById(id);
  if (el) el.addEventListener("change", savePrivacidade);
});

async function savePrivacidade() {
  await apiFetch("/configuracoes/privacidade", "PUT", {
    perfil_publico: document.getElementById("perfilPublico").checked,
    exibir_foto: document.getElementById("exibirFoto").checked,
    exibir_depoimentos: document.getElementById("exibirDep").checked,
    aparece_buscas: document.getElementById("apareceBusca").checked,
    cookie_analise: document.getElementById("cookieAnalise").checked,
    cookie_personalizacao: document.getElementById("cookiePerso").checked,
    dois_fatores: document.getElementById("toggle2fa").checked,
    alerta_login: document.getElementById("alertaLogin").checked,
  });
}

document
  .getElementById("btnDownloadDados")
  .addEventListener("click", async () => {
    showToast("Preparando download…", "info");
    try {
      const res = await fetch(`${BASE_URL}/perfil/meus-dados`, {
        headers: authHead(),
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "meus-dados.json";
        a.click();
        URL.revokeObjectURL(url);
      } else {
        showToast("Erro ao gerar arquivo.", "error");
      }
    } catch {
      showToast("Sem conexão.", "error");
    }
  });

document.getElementById("btnDeleteAccount").addEventListener("click", () => {
  openModal(
    "⚠️ Excluir Conta",
    "Todos os seus dados serão removidos permanentemente. Tem certeza?",
    async () => {
      const ok = await apiFetch("/perfil/conta", "DELETE");
      if (ok) {
        showToast("Conta excluída.", "info");
        setTimeout(() => (window.location.href = "/"), 2500);
      }
    },
  );
});

// ── ACESSIBILIDADE ────────────────────────────────────────────
let fontSize = parseInt(localStorage.getItem("fontSize") || "100");
applyFont(fontSize);

function applyFont(val) {
  document.body.style.fontSize = val + "%";
  document.getElementById("fontSizeVal").textContent = val + "%";
}

document.getElementById("fontPlus").addEventListener("click", () => {
  if (fontSize < 150) {
    fontSize += 10;
    applyFont(fontSize);
    localStorage.setItem("fontSize", fontSize);
  }
});
document.getElementById("fontMinus").addEventListener("click", () => {
  if (fontSize > 70) {
    fontSize -= 10;
    applyFont(fontSize);
    localStorage.setItem("fontSize", fontSize);
  }
});

document.getElementById("altoContraste").addEventListener("change", (e) => {
  document.body.classList.toggle("high-contrast", e.target.checked);
  localStorage.setItem("highContrast", e.target.checked);
});

document.getElementById("reduzirAnim").addEventListener("change", (e) => {
  document.body.classList.toggle("no-anim", e.target.checked);
  localStorage.setItem("noAnim", e.target.checked);
});

document.getElementById("fonteDislexia").addEventListener("change", (e) => {
  document.body.classList.toggle("dyslexia", e.target.checked);
  localStorage.setItem("dyslexia", e.target.checked);
});

// Restaurar preferências salvas
if (localStorage.getItem("highContrast") === "true") {
  document.body.classList.add("high-contrast");
  document.getElementById("altoContraste").checked = true;
}
if (localStorage.getItem("noAnim") === "true") {
  document.body.classList.add("no-anim");
  document.getElementById("reduzirAnim").checked = true;
}
if (localStorage.getItem("dyslexia") === "true") {
  document.body.classList.add("dyslexia");
  document.getElementById("fonteDislexia").checked = true;
}

// Tema
const savedTheme = localStorage.getItem("theme") || "light";
applyTheme(savedTheme);

function applyTheme(t) {
  document
    .querySelectorAll(".theme-btn")
    .forEach((b) => b.classList.remove("active"));
  const btn = document.querySelector(`.theme-btn[data-theme="${t}"]`);
  if (btn) btn.classList.add("active");
  const dark =
    t === "dark" ||
    (t === "auto" && window.matchMedia("(prefers-color-scheme:dark)").matches);
  document.body.classList.toggle("dark", dark);
  localStorage.setItem("theme", t);
}

document.querySelectorAll(".theme-btn").forEach((btn) => {
  btn.addEventListener("click", () => applyTheme(btn.dataset.theme));
});

// ── NOTIFICAÇÕES ──────────────────────────────────────────────
async function loadNotificacoes() {
  const data = await apiFetchData("/configuracoes/notificacoes", "GET");
  if (!data) return;
  setToggle("notifNews", data.email_noticias);
  setToggle("notifDep", data.email_depoimentos);
  setToggle("notifSeg", data.email_seguranca);
  setToggle("notifPush", data.push_ativo);
  setToggle("notifSom", data.push_som);
}

["notifNews", "notifDep", "notifSeg", "notifPush", "notifSom"].forEach((id) => {
  const el = document.getElementById(id);
  if (el) el.addEventListener("change", saveNotificacoes);
});

async function saveNotificacoes() {
  await apiFetch("/configuracoes/notificacoes", "PUT", {
    email_noticias: document.getElementById("notifNews").checked,
    email_depoimentos: document.getElementById("notifDep").checked,
    email_seguranca: document.getElementById("notifSeg").checked,
    push_ativo: document.getElementById("notifPush").checked,
    push_som: document.getElementById("notifSom").checked,
  });
}

// ── PLANO ─────────────────────────────────────────────────────
document.getElementById("btnAssinarPlus").addEventListener("click", () => {
  showToast("Redirecionando para o checkout…", "info");
  // window.location.href = '/checkout/plus';
});

document
  .getElementById("btnHistoricoPag")
  .addEventListener("click", async () => {
    const data = await apiFetchData("/plano/historico", "GET");
    if (data) showToast(`${data.length} pagamento(s) encontrado(s).`, "info");
  });

document.getElementById("btnCancelarPlano").addEventListener("click", () => {
  openModal(
    "Cancelar Assinatura",
    "Deseja cancelar o plano Plus?",
    async () => {
      const ok = await apiFetch("/plano/cancelar", "POST");
      if (ok) {
        showToast("Assinatura cancelada.");
        updatePlanUI("free");
      }
    },
  );
});

function updatePlanUI(plan) {
  userPlan = plan;
  const badge = document.getElementById("planBadge");
  badge.textContent = plan === "plus" ? "⭐ Plano Plus" : "Plano Gratuito";
  badge.className = `plan-badge ${plan}`;
  renderSocorros();
}

// ── HELPERS API ───────────────────────────────────────────────
async function apiFetch(endpoint, method = "GET", body = null) {
  try {
    const opts = { method, headers: authHead() };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(BASE_URL + endpoint, opts);
    if (res.ok) return true;
    const err = await res.json().catch(() => ({}));
    showToast(err.mensagem || "Erro na requisição.", "error");
    return false;
  } catch {
    showToast("Sem conexão com o servidor.", "error");
    return false;
  }
}

async function apiFetchData(endpoint, method = "GET", body = null) {
  try {
    const opts = { method, headers: authHead() };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(BASE_URL + endpoint, opts);
    if (res.ok) return res.json();
    const err = await res.json().catch(() => ({}));
    showToast(err.mensagem || "Erro ao buscar dados.", "error");
    return null;
  } catch {
    showToast("Sem conexão com o servidor.", "error");
    return null;
  }
}

function escHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ── INICIALIZAÇÃO ─────────────────────────────────────────────
async function init() {
  const userData = await apiFetchData("/perfil", "GET");
  if (userData) {
    document.getElementById("nome").value = userData.nome || "";
    document.getElementById("apelido").value = userData.apelido || "";
    document.getElementById("sobre").value = userData.sobre || "";
    if (userData.foto_url) {
      avatarPreview.src = userData.foto_url;
      if (topAvatar) topAvatar.src = userData.foto_url;
    }
    updatePlanUI(userData.plano || "free");
  }
  await Promise.all([
    loadDepoimentos(),
    loadSocorros(),
    loadPrivacidade(),
    loadNotificacoes(),
  ]);
}

init();
