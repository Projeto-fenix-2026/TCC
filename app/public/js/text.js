// Seleciona os elementos
const hamburger = document.getElementById('hamburger');
const sidebarMenu = document.getElementById('sidebar-menu');

// Alterna o menu lateral e a animação do hambúrguer ao clicar
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    sidebarMenu.classList.toggle('active');
});

// Fecha a barra lateral automaticamente quando um link for clicado
document.querySelectorAll('.sidebar-menu a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        sidebarMenu.classList.remove('active');
    });
});

// Fecha a barra lateral se clicar fora dela (opcional, melhora a experiência)
document.addEventListener('click', (event) => {
    const isClickInsideMenu = sidebarMenu.contains(event.target);
    const isClickOnHamburger = hamburger.contains(event.target);

    if (!isClickInsideMenu && !isClickOnHamburger && sidebarMenu.classList.contains('active')) {
        hamburger.classList.remove('active');
        sidebarMenu.classList.remove('active');
    }
});




    const carousel = document.getElementById("carousel");
    const slides = document.querySelectorAll(".carousel img");

    let index = 0;

    function updateCarousel() {
      carousel.style.transform = `translateX(-${index * 100}%)`;
    }

    function nextSlide() {
      index = (index + 1) % slides.length;
      updateCarousel();
    }

    function prevSlide() {
      index = (index - 1 + slides.length) % slides.length;
      updateCarousel();
    }

    // autoplay (opcional)
    setInterval(nextSlide, 4000);
   function getLocation() {
  const status = document.getElementById("statusGeo");

  if (!navigator.geolocation) {
    status.innerText = "Geolocalização não é suportada no seu navegador.";
    return;
  }

  status.innerText = "Localizando...";

  navigator.geolocation.watchPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      status.innerText = `Localização atualizada: ${lat.toFixed(5)}, ${lon.toFixed(5)}`;

      // Atualiza o mapa em tempo real
      const map = document.getElementById("mapFrame");
      map.src = `https://www.openstreetmap.org/export/embed.html?bbox=${lon-0.01}%2C${lat-0.01}%2C${lon+0.01}%2C${lat+0.01}&layer=mapnik&marker=${lat}%2C${lon}`;
    },
    (error) => {
      status.innerText = "Erro ao obter localização.";
    },
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 5000
    }
  );
}