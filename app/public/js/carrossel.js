
    //// ============ DADOS DAS ONGs ============
const ongs = [
    {
        id: 1,
        name: "Instituto Maria da Penha",
        category: "Educação e Prevenção",
        description: "Desenvolve projetos de educação, prevenção e reflexão sobre violência doméstica. Trabalha com grupos de reflexão, campanhas e formação de profissionais.",
        image: "https://via.placeholder.com/400x200?text=Instituto+Maria+da+Penha",
        link: "https://www.institutomariadapenha.org.br"
    },
    {
        id: 2,
        name: "Associação Fala Mulher",
        category: "Apoio Jurídico",
        description: "Organização sem fins lucrativos que atua no combate à violência doméstica contra a mulher, oferecendo orientação jurídica e apoio psicológico.",
        image: "https://via.placeholder.com/400x200?text=Fala+Mulher",
        link: "https://www.falamulher.ong.br"
    },
    {
        id: 3,
        name: "Projeto Justiceiras",
        category: "Força-tarefa Comunitária",
        description: "Força-tarefa pró-mulher que oferece suporte, orientação e ajuda prática para mulheres vítimas de violência doméstica.",
        image: "https://via.placeholder.com/400x200?text=Justiceiras",
        link: "https://www.justiceiras.org.br"
    },
    {
        id: 4,
        name: "Instituto Nós Por Elas",
        category: "Conscientização",
        description: "Promove campanhas, ações e atos públicos para conscientização sobre violência contra mulher, independente de idade, classe social ou etnia.",
        image: "https://via.placeholder.com/400x200?text=Nos+Por+Elas",
        link: "https://nosporelas.com"
    },
    {
        id: 5,
        name: "Instituto Mulheres Tem Voz",
        category: "Atendimento Psicológico",
        description: "Oferece atendimentos psicológicos para mulheres que enfrentam traumas, orientação jurídica e programas de reinserção social.",
        image: "https://via.placeholder.com/400x200?text=Mulheres+Tem+Voz",
        link: "https://www.mulherestemvoz.org"
    },
    {
        id: 6,
        name: "Associação Recomeçar",
        category: "Abrigo e Assistência",
        description: "Oferece abrigo seguro, assistência social e programas de reabilitação para mulheres e crianças vítimas de violência.",
        image: "https://via.placeholder.com/400x200?text=Recomecar",
        link: "#"
    },
    {
        id: 7,
        name: "Artemis - Assessoria Feminista",
        category: "Consultoria e Educação",
        description: "Oferece consultoria, formação e educação para profissionais e organizações que trabalham com questões de gênero e violência.",
        image: "https://via.placeholder.com/400x200?text=Artemis",
        link: "#"
    },
    {
        id: 8,
        name: "Tamo Juntas",
        category: "Rede de Apoio",
        description: "Plataforma de rede de apoio que conecta mulheres vítimas de violência com profissionais especializados e recursos.",
        image: "https://via.placeholder.com/400x200?text=Tamo+Juntas",
        link: "#"
    }
];

// ============ INICIALIZAÇÃO DO CARROSSEL ============
let currentSlide = 0;

document.addEventListener('DOMContentLoaded', function() {
    initializeCarousel();
    setupFormValidation();
});

function initializeCarousel() {
    const carouselTrack = document.getElementById('carouselTrack');
    const carouselDots = document.getElementById('carouselDots');

    // Criar cards do carrossel
    ongs.forEach((ong, index) => {
        const card = document.createElement('div');
        card.className = 'carousel-card';
        card.innerHTML = `
            <img src="${ong.image}" alt="${ong.name}" class="carousel-card-image" onerror="this.src='https://via.placeholder.com/400x200?text=ONG'">
            <div class="carousel-card-content">
                <h3 class="carousel-card-title">${ong.name}</h3>
                <span class="carousel-card-category">${ong.category}</span>
                <p class="carousel-card-description">${ong.description}</p>
                <a href="${ong.link}" target="_blank" class="carousel-card-link">Saiba Mais →</a>
            </div>
        `;
        carouselTrack.appendChild(card);
    });

    // Criar dots
    ongs.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.className = `carousel-dot ${index === 0 ? 'active' : ''}`;
        dot.onclick = () => goToSlide(index);
        carouselDots.appendChild(dot);
    });

    // Atualizar carrossel inicial
    updateCarousel();
}

function moveCarousel(direction) {
    const totalSlides = ongs.length;
    const itemsPerView = getItemsPerView();
    
    currentSlide += direction;
    
    // Limitar o movimento
    if (currentSlide < 0) {
        currentSlide = 0;
    } else if (currentSlide > totalSlides - itemsPerView) {
        currentSlide = totalSlides - itemsPerView;
    }
    
    updateCarousel();
}

function goToSlide(index) {
    const itemsPerView = getItemsPerView();
    const totalSlides = ongs.length;
    
    if (index + itemsPerView <= totalSlides) {
        currentSlide = index;
        updateCarousel();
    }
}

function getItemsPerView() {
    if (window.innerWidth <= 480) return 1;
    if (window.innerWidth <= 768) return 2;
    return 3;
}

function updateCarousel() {
    const carouselTrack = document.getElementById('carouselTrack');
    const carouselDots = document.querySelectorAll('.carousel-dot');
    const itemsPerView = getItemsPerView();
    const itemWidth = 100 / itemsPerView;
    
    // Mover carrossel
    carouselTrack.style.transform = `translateX(-${currentSlide * itemWidth}%)`;
    
    // Atualizar dots
    carouselDots.forEach((dot, index) => {
        dot.classList.remove('active');
        if (index === currentSlide) {
            dot.classList.add('active');
        }
    });
}

// Atualizar carrossel ao redimensionar janela
window.addEventListener('resize', () => {
    updateCarousel();
});


// ============ SMOOTH SCROLL ============
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && document.querySelector(href)) {
            e.preventDefault();
            document.querySelector(href).scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// ============ ANIMAÇÃO AO SCROLL ============
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observar elementos para animação
document.querySelectorAll('.stat-card, .type-card, .impact-item, .help-card, .resource-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});


// ============ NÚMEROS ANIMADOS ============
function animateNumbers() {
    const statCards = document.querySelectorAll('.stat-card h3');
    
    statCards.forEach(card => {
        const finalValue = parseInt(card.textContent);
        if (isNaN(finalValue)) return;
        
        let currentValue = 0;
        const increment = Math.ceil(finalValue / 30);
        
        const interval = setInterval(() => {
            currentValue += increment;
            if (currentValue >= finalValue) {
                currentValue = finalValue;
                clearInterval(interval);
            }
            
            if (card.textContent.includes('+')) {
                card.textContent = currentValue + '+';
            } else if (card.textContent.includes('mil')) {
                card.textContent = (currentValue / 1000).toFixed(0) + ' mil';
            } else {
                card.textContent = currentValue;
            }
        }, 30);
    });
}

// Animar números quando a seção fica visível
const statsSection = document.querySelector('.statistics');
const statsObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
        animateNumbers();
        statsObserver.unobserve(statsSection);
    }
});

if (statsSection) {
    statsObserver.observe(statsSection);
}

