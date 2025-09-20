const data = [
    {title: "teste",
        description:
        "Dedjsdhjfdgfdgfnbfdbgfdhjgfhgfd"
    }
];

const cardContainer = document.querySelector(".card-container");
const searchInput = document.querySelector("#searchInput");

const displayData = data => {
    cardContainer.innerHTML = "",
    data.forEach(e =>{
        cardContainer.innerHTML += `
        <section class="card">
            
            <h3>${e.title}</h3>
            <p> ${e.description}</p>
        </section>
        `
    })
}

window.addEventListener("load", displayData.bind(null,data))