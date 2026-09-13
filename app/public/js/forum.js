/* ============================================================
   forum.js – Fórum Fênix (publicações reais, persistidas no banco)
   ============================================================ */

const CATEGORIAS = {
  violencia_domestica: { label: "Violência Doméstica", icon: "crisis_alert" },
  direitos: { label: "Direitos da Mulher", icon: "gavel" },
  apoio: { label: "Buscar Apoio", icon: "handshake" },
  relatos: { label: "Relatos", icon: "forum" },
  saude_mental: { label: "Saúde Mental", icon: "psychology" },
  ongs: { label: "ONGs", icon: "business" },
  geral: { label: "Geral", icon: "chat_bubble" },
};

let posts = [];
let categoriaAtual = "";
let ordenacaoAtual = "recentes";

function escHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function showToast(msg, type = "success") {
  const t = document.getElementById("forumToast");
  if (!t) return;
  t.textContent = msg;
  t.className = `toast ${type} show`;
  setTimeout(() => (t.className = "toast"), 3200);
}

function tempoRelativo(dataStr) {
  const data = new Date(dataStr);
  const diffMs = Date.now() - data.getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "agora mesmo";
  if (min < 60) return `há ${min} min`;
  const horas = Math.floor(min / 60);
  if (horas < 24) return `há ${horas} h`;
  const dias = Math.floor(horas / 24);
  if (dias < 30) return `há ${dias} dia${dias > 1 ? "s" : ""}`;
  return data.toLocaleDateString("pt-BR");
}

async function apiFetch(endpoint, method = "GET", body = null) {
  try {
    const opts = { method, headers: { "Content-Type": "application/json" } };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(endpoint, opts);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      showToast(data.mensagem || "Erro na requisição.", "error");
      return null;
    }
    return data;
  } catch {
    showToast("Sem conexão com o servidor.", "error");
    return null;
  }
}

async function carregarPosts() {
  const data = await apiFetch("/api/forum/posts");
  if (data) {
    posts = data;
    renderFeed();
    abrirEdicaoViaQueryString();
  }
}

function abrirEdicaoViaQueryString() {
  const params = new URLSearchParams(window.location.search);
  const idEditar = params.get("editar");
  if (idEditar) {
    window.abrirEdicaoPost(Number(idEditar));
    history.replaceState(null, "", "/forum");
  }
}

function renderFeed() {
  const feed = document.getElementById("postsFeed");
  const empty = document.getElementById("postsEmpty");

  let lista = posts.filter((p) => !categoriaAtual || p.categoria === categoriaAtual);
  lista = lista.slice().sort((a, b) => {
    const da = new Date(a.criado_em).getTime();
    const db = new Date(b.criado_em).getTime();
    return ordenacaoAtual === "recentes" ? db - da : da - db;
  });

  if (!lista.length) {
    feed.innerHTML = "";
    empty.hidden = false;
    return;
  }
  empty.hidden = true;

  const userId = window.usuarioAtual ? window.usuarioAtual.id : null;

  feed.innerHTML = lista
    .map((post) => {
      const cat = CATEGORIAS[post.categoria] || CATEGORIAS.geral;
      const isOwner = userId && Number(userId) === Number(post.id_usuario);
      return `
    <article class="post-card" data-id="${post.id_post}">
      <div class="post-inner">
        <section class="post-body">
          <header class="post-meta">
            <span class="post-category"><span class="icon">${cat.icon}</span> ${escHtml(cat.label)}</span>
            <span class="meta-sep">•</span>
            <span class="post-author">por ${escHtml(post.autor_nome || "usuária")}</span>
            <span class="meta-sep">•</span>
            <time class="post-time">${tempoRelativo(post.criado_em)}</time>
          </header>
          <h2 class="post-title">${escHtml(post.titulo)}</h2>
          <p class="post-excerpt">${escHtml(post.conteudo)}</p>
          <footer class="post-actions">
            ${
              isOwner
                ? `<div class="post-own-actions">
                    <button class="action-btn" onclick="abrirEdicaoPost(${post.id_post})"><span class="icon">edit</span> Editar</button>
                    <button class="action-btn danger" onclick="excluirPost(${post.id_post})"><span class="icon">delete</span> Excluir</button>
                  </div>`
                : ""
            }
          </footer>
        </section>
      </div>
    </article>`;
    })
    .join("");
}

// ── FILTRO POR CATEGORIA ──────────────────────────────────────
document.querySelectorAll(".sidebar-left .nav-item").forEach((item) => {
  item.addEventListener("click", (e) => {
    e.preventDefault();
    document.querySelectorAll(".sidebar-left .nav-item").forEach((n) => n.classList.remove("active"));
    item.classList.add("active");
    categoriaAtual = item.dataset.categoria || "";
    renderFeed();
  });
});

// ── ORDENAÇÃO ──────────────────────────────────────────────────
document.querySelectorAll(".sort-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".sort-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    ordenacaoAtual = btn.dataset.sort;
    renderFeed();
  });
});

// ── MODAL NOVA PUBLICAÇÃO / EDITAR ────────────────────────────
const postModalBg = document.getElementById("postModalBg");
const formPost = document.getElementById("formPost");

function abrirModalPost() {
  if (!window.usuarioAtual) {
    showToast("Entre na sua conta para publicar.", "error");
    window.location.href = "/login";
    return;
  }
  postModalBg.classList.add("open");
}

function fecharModalPost() {
  postModalBg.classList.remove("open");
  formPost.reset();
  document.getElementById("postId").value = "";
  document.getElementById("postModalTitle").textContent = "Nova publicação";
  document.getElementById("postModalSubmit").textContent = "Publicar";
}

document.getElementById("btnNovaPost").addEventListener("click", abrirModalPost);
document.getElementById("postModalClose").addEventListener("click", fecharModalPost);
document.getElementById("postModalCancel").addEventListener("click", fecharModalPost);
postModalBg.addEventListener("click", (e) => {
  if (e.target === postModalBg) fecharModalPost();
});

window.abrirEdicaoPost = function (id) {
  const post = posts.find((p) => p.id_post === id);
  if (!post) return;
  document.getElementById("postId").value = post.id_post;
  document.getElementById("postCategoria").value = post.categoria;
  document.getElementById("postTitulo").value = post.titulo;
  document.getElementById("postConteudo").value = post.conteudo;
  document.getElementById("postModalTitle").textContent = "Editar publicação";
  document.getElementById("postModalSubmit").textContent = "Salvar alterações";
  postModalBg.classList.add("open");
};

window.excluirPost = function (id) {
  if (!confirm("Tem certeza que deseja excluir esta publicação? Esta ação não pode ser desfeita.")) return;
  apiFetch(`/api/forum/posts/${id}`, "DELETE").then((data) => {
    if (data) {
      posts = posts.filter((p) => p.id_post !== id);
      renderFeed();
      showToast("Publicação excluída.");
    }
  });
};

let enviandoPost = false;

formPost.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (enviandoPost) return; // evita post duplicado ao clicar mais de uma vez

  const id = document.getElementById("postId").value;
  const payload = {
    categoria: document.getElementById("postCategoria").value,
    titulo: document.getElementById("postTitulo").value.trim(),
    conteudo: document.getElementById("postConteudo").value.trim(),
  };

  if (payload.titulo.length < 5) {
    showToast("O título deve ter pelo menos 5 caracteres.", "error");
    return;
  }
  if (payload.conteudo.length < 10) {
    showToast("Escreva um pouco mais no texto da publicação.", "error");
    return;
  }

  const submitBtn = document.getElementById("postModalSubmit");
  const textoOriginal = submitBtn.textContent;
  enviandoPost = true;
  submitBtn.disabled = true;
  submitBtn.textContent = id ? "Salvando..." : "Publicando...";

  try {
    let sucesso = false;
    if (id) {
      const data = await apiFetch(`/api/forum/posts/${id}`, "PUT", payload);
      if (data) {
        const post = posts.find((p) => p.id_post === Number(id));
        if (post) Object.assign(post, payload);
        renderFeed();
        fecharModalPost();
        showToast("Publicação atualizada!");
        sucesso = true;
      }
    } else {
      const data = await apiFetch("/api/forum/posts", "POST", payload);
      if (data) {
        posts.unshift(data);
        renderFeed();
        fecharModalPost();
        showToast("Publicação criada com sucesso!");
        sucesso = true;
      }
    }
    // Em caso de erro o modal permanece aberto — devolve o texto do botão.
    // Em caso de sucesso, fecharModalPost() já deixou o texto correto.
    if (!sucesso) submitBtn.textContent = textoOriginal;
  } finally {
    enviandoPost = false;
    submitBtn.disabled = false;
  }
});

carregarPosts();
