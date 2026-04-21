const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('nav-links');

hamburger.addEventListener('click', () => {
  const isOpen = hamburger.classList.toggle('open');
  navLinks.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', isOpen);
});

// Fechar ao clicar em qualquer link do menu
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  });
});

// Fechar ao clicar fora do menu
document.addEventListener('click', (e) => {
  if (!navLinks.contains(e.target) && !hamburger.contains(e.target)) {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  }
});

/* ─── CAROUSEL ───────────────────────────── */
const track  = document.getElementById('track');
const dots   = document.querySelectorAll('.dot');
const total  = dots.length;
let current  = 0;
let timer    = null;

function goTo(index) {
  current = (index + total) % total;
  track.style.transform = `translateX(-${current * 100}%)`;
  dots.forEach((d, i) => d.classList.toggle('active', i === current));
}

function next() { goTo(current + 1); }
function prev() { goTo(current - 1); }

function startAuto() {
  timer = setInterval(next, 5000);
}

function resetAuto() {
  clearInterval(timer);
  startAuto();
}

document.getElementById('next').addEventListener('click', () => { next(); resetAuto(); });
document.getElementById('prev').addEventListener('click', () => { prev(); resetAuto(); });
dots.forEach(d => d.addEventListener('click', () => { goTo(+d.dataset.i); resetAuto(); }));

// Touch / swipe support
let startX = 0;
track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
track.addEventListener('touchend', e => {
  const diff = startX - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 50) {
    diff > 0 ? next() : prev();
    resetAuto();
  }
});

// Pause on hover
track.addEventListener('mouseenter', () => clearInterval(timer));
track.addEventListener('mouseleave', startAuto);

// Keyboard navigation
document.getElementById('carousel').addEventListener('keydown', e => {
  if (e.key === 'ArrowRight') { next(); resetAuto(); }
  if (e.key === 'ArrowLeft')  { prev(); resetAuto(); }
});

startAuto();

/* ─── MÁSCARAS ───────────────────────────── */
document.getElementById('cpf').addEventListener('input', function () {
  let v = this.value.replace(/\D/g, '').slice(0, 11);
  v = v.replace(/(\d{3})(\d)/, '$1.$2');
  v = v.replace(/(\d{3})(\d)/, '$1.$2');
  v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  this.value = v;
});

document.getElementById('telefone').addEventListener('input', function () {
  let v = this.value.replace(/\D/g, '').slice(0, 11);
  v = v.replace(/^(\d{2})(\d)/, '($1) $2');
  v = v.replace(/(\d{5})(\d)/, '$1-$2');
  this.value = v;
});

/* ─── FORM SUBMIT ────────────────────────── */
document.getElementById('enviar').addEventListener('click', () => {
  const nome  = document.getElementById('nome').value.trim();
  const email = document.getElementById('email').value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!nome) {
    showToast('Por favor, informe seu nome. 💜');
    return;
  }
  if (!email || !emailRegex.test(email)) {
    showToast('Por favor, informe um e-mail válido. 💜');
    return;
  }

  showToast('Dados enviados com sucesso! Entraremos em contato em breve. 💜', true);
  document.getElementById('nome').value = '';
  document.getElementById('email').value = '';
  document.getElementById('telefone').value = '';
  document.getElementById('cpf').value = '';
});

/* ─── TOAST NOTIFICATION ─────────────────── */
function showToast(msg, success = false) {
  // Remove toast anterior se existir
  const old = document.getElementById('toast');
  if (old) old.remove();

  const toast = document.createElement('div');
  toast.id = 'toast';
  toast.textContent = msg;

  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '2rem',
    left: '50%',
    transform: 'translateX(-50%) translateY(20px)',
    background: success ? '#4a2060' : '#e8709a',
    color: '#fff',
    padding: '.85rem 1.8rem',
    borderRadius: '999px',
    fontFamily: "'Abhaya Libre', serif",
    fontSize: '1rem',
    fontWeight: '600',
    boxShadow: '0 6px 24px rgba(0,0,0,.25)',
    zIndex: '9999',
    opacity: '0',
    transition: 'opacity .3s ease, transform .3s ease',
    maxWidth: '90vw',
    textAlign: 'center',
  });

  document.body.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}
