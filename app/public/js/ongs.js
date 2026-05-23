
// Dados ONGs 

const dataOngs = [
  {title: "Tamo juntas", image: "imgs/tamojuntas.png", description: "Realizamos atendimentos a mulheres em situação de violência de forma gratuita.", link: "/ong_page"},
  {title: "Recomeçar", image: "imgs/recomecar.png", description: "Oferecemos um serviço de acolhimento institucional sigiloso para mulheres em situação de violência", link: "/ong_page"},
  {title: "Amac", image: "imgs/amac.png", description: "Realizamos um trabalho de promoção e informação sobre a violência doméstica.", link: "/ong_page"},
  {title: "Casa da mulher do nordeste", image: "imgs/casadamulher.png", description: "Fortalece a autonomia econômica e política das mulheres.", link: "/ong_page"},
  {title: "Fala mulher", image: "imgs/falamulher.png", description: "Atua no enfrentamento à violência contra a mulher, na promoção da independência financeira feminina e outros.", link: "/ong_page"},
  {title: "Ágatha Instituto social", image: "imgs/agatha.png", description: "Tem a visão de resgatar as mulheres em situação de vulnerabilidade.", link: "/ong_page"},
  {title: "Ágatha Instituto social", image: "imgs/agatha.png", description: "Tem a visão de resgatar as mulheres em situação de vulnerabilidade.", link: "/ong_page"},
  {title: "Ágatha Instituto social", image: "imgs/agatha.png", description: "Tem a visão de resgatar as mulheres em situação de vulnerabilidade.", link: "/ong_page"}
];




// Seletores

const cardContainerOngs = document.querySelector(".card-container");

const searchInput = document.querySelector("#searchInput");


// Função para gerar cards

const gerarCards = (container, data) => {
  container.innerHTML = "";
  data.forEach(item => {
    container.innerHTML += `
      <section class="${container === cardContainerOngs ? "card" : "card-profissionais"}">
        <a href="${item.link}">
          <h3>${item.title}</h3>
          <img src="${item.image}" alt="${item.title}">
          <p>${item.description}</p>
        </a>
      </section>
    `;
  });
};


// Função para pesquisa

const pesquisar = (e) => {
  const value = e.target.value.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Pesquisa ONGs
  const resultadoOngs = [...new Set([
    ...dataOngs.filter(i => i.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").includes(value)),
    ...dataOngs.filter(i => i.description.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").includes(value))
  ])];

  

  gerarCards(cardContainerOngs, resultadoOngs);
  
};


// Eventos

searchInput.addEventListener("keyup", pesquisar);


// Inicializar cards

window.addEventListener("DOMContentLoaded", () => {
  gerarCards(cardContainerOngs, dataOngs);
  
});