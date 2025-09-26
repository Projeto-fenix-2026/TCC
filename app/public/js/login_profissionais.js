const toggle = document.getElementById('toggle');
    const menu = document.getElementById('menu');

    toggle.addEventListener('click', () => {
      menu.classList.toggle('active');
      toggle.classList.toggle('active');
    });