
// Dados ONGs 

const dataOngs = [
  {title: "Tamo juntas", image: "imgs/tamojuntas.png", description: "Realizamos atendimentos a mulheres em situação de violência de forma gratuita.", link: "#"},
  {title: "Recomeçar", image: "imgs/recomecar.png", description: "Oferecemos um serviço de acolhimento institucional sigiloso para mulheres em situação de violência", link: "#"},
  {title: "Amac", image: "imgs/amac.png", description: "Realizamos um trabalho de promoção e informação sobre a violência doméstica.", link: "#"},
  {title: "Casa da mulher do nordeste", image: "imgs/casadamulher.png", description: "Fortalece a autonomia econômica e política das mulheres.", link: "#"},
  {title: "Fala mulher", image: "imgs/falamulher.png", description: "Atua no enfrentamento à violência contra a mulher, na promoção da independência financeira feminina e outros.", link: "#"},
  {title: "Ágatha Instituto social", image: "imgs/agatha.png", description: "Tem a visão de resgatar as mulheres em situação de vulnerabilidade.", link: "#"},
  {title: "Ágatha Instituto social", image: "imgs/agatha.png", description: "Tem a visão de resgatar as mulheres em situação de vulnerabilidade.", link: "#"},
  {title: "Ágatha Instituto social", image: "imgs/agatha.png", description: "Tem a visão de resgatar as mulheres em situação de vulnerabilidade.", link: "#"}
];


// Dados Profissionais

const dataProfissionais = [
  {title: "Jaqueline", image: "imgs/jaqueline.png", description: "Psicóloga", link: "#"},
  {title: "Jennifer", image: "imgs/jenifer.png", description: "Advogada", link: "#"},
  {title: "Jessica", image: "imgs/jessica.png", description: "Psicóloga", link: "#"},
  {title: "Carol", image: "imgs/carol.png", description: "Genecologista", link: "#"},
  {title: "Ângela", image: "imgs/angela.png", description: "Advogada", link: "#"},
  {title: "Luiza", image: "imgs/luiza.png", description: "Genecologista", link: "#"},
  {title: "Luiza", image: "imgs/luiza.png", description: "Psicóloga", link: "#"},
  {title: "Luiza", image: "imgs/luiza.png", description: "Advogada", link: "#"}
];


// Seletores

const cardContainerOngs = document.querySelector(".card-container");
const cardContainerProfissionais = document.querySelector(".card-container-profissionais");
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

  // Pesquisa Profissionais
  const resultadoProfissionais = [...new Set([
    ...dataProfissionais.filter(i => i.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").includes(value)),
    ...dataProfissionais.filter(i => i.description.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").includes(value))
  ])];

  gerarCards(cardContainerOngs, resultadoOngs);
  gerarCards(cardContainerProfissionais, resultadoProfissionais);
};


// Eventos

searchInput.addEventListener("keyup", pesquisar);


// Inicializar cards

window.addEventListener("DOMContentLoaded", () => {
  gerarCards(cardContainerOngs, dataOngs);
  gerarCards(cardContainerProfissionais, dataProfissionais);
});
