const cardContainerOngs = document.querySelector(".card-container");
const searchInput = document.querySelector("#searchInput");

let todasOngs = [];

const gerarCards = (container, data) => {
  container.innerHTML = "";
  if (data.length === 0) {
    container.innerHTML = "<p style='text-align:center;color:#888;'>Nenhuma ONG encontrada.</p>";
    return;
  }
  data.forEach(ong => {
    const imagem = ong.imagem
      ? `<img src="${ong.imagem}" alt="${ong.nome}">`
      : `<div class="card-sem-imagem"></div>`;
    container.innerHTML += `
      <section class="card">
        <a href="/ong_page">
          ${imagem}
          <h3>${ong.nome}</h3>
          <p>${ong.descricao || ""}</p>
        </a>
      </section>
    `;
  });
};

const pesquisar = (e) => {
  const value = e.target.value.toLowerCase().trim().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const resultado = todasOngs.filter(ong =>
    ong.nome.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").includes(value) ||
    (ong.descricao || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").includes(value)
  );
  gerarCards(cardContainerOngs, resultado);
};

searchInput.addEventListener("keyup", pesquisar);

window.addEventListener("DOMContentLoaded", async () => {
  try {
    const resp = await fetch("/ongs/dados");
    todasOngs = await resp.json();
    gerarCards(cardContainerOngs, todasOngs);
  } catch (e) {
    cardContainerOngs.innerHTML = "<p style='text-align:center;color:#888;'>Erro ao carregar ONGs.</p>";
  }
});
