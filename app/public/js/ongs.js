const data = [
    {title: "Tamo juntas",
        image: "imgs/tamojuntas.png",
        description:
        "Realizamos atendimentos a mulheres em situação de violência de forma gratuita."
    },
    {title: "Recomeçar",
        image: "imgs/recomecar.png",
        description:
        "Oferecemos um serviço de acolhimento institucional sigiloso para mulheres em situação de violência",
        link:"https://www.google.com/search?q=ia+que+faz+siter&sourceid=chrome&ie=UTF-8",

    },
      {title: " Amac",
        image: "imgs/amac.png",
        description:
        "Realizamos um trabalho de promoção e informação sobre a violência doméstica."
    },
    {title: "Casa da mulher do nordeste",
        image: "imgs/casadamulher.png",
        description:
        "Fortalece a autonomia econômica e política das mulheres."
    },
    {title: "Fala mulher",
        image: "imgs/falamulher.png",
        description:
        "Atua no enfrentamento à violência contra a mulher, na promoção da independência financeira feminina e outros."
    },
    {title: "Ágatha Instituto social",
        image: "imgs/agatha.png",
        description:
        "Tem a visão de resgatar as mulheres em situação de vulnerabilidade."
    }
    
];


const cardContainer = document.querySelector(".card-container");
const searchInput = document.querySelector("#searchInput");

const displayData = data => {
    cardContainer.innerHTML = "",
    data.forEach(e =>{
        cardContainer.innerHTML += `
        <section class="card">
            <a href = "${e.link}"
            <h3>${e.title}</h3>
            <img src = "${e.image}">
            <p> ${e.description}</p>
            </a>
        </section>
        `
    })
}

searchInput.addEventListener("keyup", (e) =>{
    const value = e.target.value.toLowerCase().trim().normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

   
  const searchTitle = data.filter(i => i.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(value));
  const searchDesc = data.filter(i => i.description.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(value));

  const result = [...new Set([...searchTitle, ...searchDesc])];

  displayData(result);
});

window.addEventListener("load", displayData.bind(null,data))