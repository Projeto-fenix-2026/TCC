const dataProfissionais = [
    {titleProfissionais: "Raquel",
        imageProfissionais: "imgs/tamojuntas.png",
        descriptionProfissionais:
        "Realizamos atendimentos a mulheres em situação de violência de forma gratuita."
    },
    {titleProfissionais: "Rebecca",
        imageProfissionais: "imgs/recomecar.png",
        descriptionProfissionais:
        "Oferecemos um serviço de acolhimento institucional sigiloso para mulheres em situação de violência",
        link:"https://www.google.com/search?q=ia+que+faz+siter&sourceid=chrome&ie=UTF-8",

    },
      {titleProfissionais: " Ana",
        imageProfissionais: "imgs/amac.png",
        descriptionProfissionais:
        "Realizamos um trabalho de promoção e informação sobre a violência doméstica."
    },
    {titleProfissionais: "Carla",
        imageProfissionais: "imgs/casadamulher.png",
        descriptionProfissionais:
        "Fortalece a autonomia econômica e política das mulheres."
    },
    {titleProfissionais: "Fernanda",
        imageProfissionais: "imgs/falamulher.png",
        descriptionProfissionais:
        "Atua no enfrentamento à violência contra a mulher, na promoção da independência financeira feminina e outros."
    },
    {titleProfissionais: "Ágatha ",
        imageProfissionais: "imgs/agatha.png",
        descriptionProfissionais:
        "Tem a visão de resgatar as mulheres em situação de vulnerabilidade."
    }
    
];

const cardContainerProfissionais = document.querySelector(".card-container-profissionais")
const searchInput = document.querySelector("#searchInput");

const displayDataProfissionais = dataProfissionais => {
    cardContainerProfissionais.innerHTML = "",
    dataProfissionais.forEach(e =>{
        cardContainerProfissionais.innerHTML += `
        <section class="card-profissionais">
            <a href = "${e.linkProfissionas}">
            <h3>${e.titleProfissionais}</h3>
            <img src = "${e.imageProfissionais}">
            <p> ${e.descriptionProfissionais}</p>
            </a>
        </section>
        `
    })
}

window.addEventListener("load", displayDataProfissionais.bind(null,dataProfissionais))