const btnOng = document.getElementById("btnOng");
const btnProfissional = document.getElementById("btnProfissional");
const cardContainer = document.getElementById("card-container");
const cardContainerProfissional = document.getElementById("card-container-profissionais");

// Alternar formulários
btnOng.addEventListener("click", () => {
  cardContainer.style.display = "flex";
  cardContainerProfissional.style.display = "none";
  btnOng.classList.add("active");
  btnProfissional.classList.remove("active");
});

btnProfissional.addEventListener("click", () => {
  cardContainerProfissional.style.display = "flex";
  cardContainer.style.display = "none";
  btnProfissional.classList.add("active");
  btnOng.classList.remove("active");
});

