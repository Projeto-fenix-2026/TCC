

/* ===== JS do Carrossel ===== */

const track = document.querySelector('.carrossel-track');

const slides = Array.from(track.children);

const nextButton = document.querySelector('.carrossel-btn.next');

const prevButton = document.querySelector('.carrossel-btn.prev');

let currentIndex = 0;

function showSlide(index) {

  const slideWidth = slides[0].getBoundingClientRect().width;

  track.style.transform = `translateX(-${slideWidth * index}px)`;

}

nextButton.addEventListener('click', () => {

  currentIndex = (currentIndex + 1) % slides.length;

  showSlide(currentIndex);

});

prevButton.addEventListener('click', () => {

  currentIndex = (currentIndex - 1 + slides.length) % slides.length;

  showSlide(currentIndex);

});

/* Troca automática a cada 6 segundos */

setInterval(() => {

  currentIndex = (currentIndex + 1) % slides.length;

  showSlide(currentIndex);

}, 6000);

/* Responsivo: reajusta largura ao redimensionar */

window.addEventListener('resize', () => showSlide(currentIndex));


// --- Formulário ---
const form = document.getElementById('contactForm');
form.addEventListener('submit', async e=>{
  e.preventDefault();
  const msgnav = document.getElementById('msg');
  msgnav.innerHTML = '';
  const data = {
    nome: form.nome.value.trim(),
    email: form.email.value.trim(),
    mensagem: form.mensagem.value.trim()
  };
  try{
    const res = await fetch('/contato',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(data)
    });
    const result = await res.json();
    if(!res.ok){
      msgnav.innerHTML = result.errors.map(e=>`<nav class="error">${e.msg}</nav>`).join('');
    }else{
      msgnav.innerHTML = `<nav class="success">${result.message}</nav>`;
      form.reset();
    }
  }catch(err){
    msgnav.innerHTML = `<nav class="error">Erro ao enviar. Tente novamente.</nav>`;
  }
});
