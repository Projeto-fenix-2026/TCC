
        const tabButtons = document.querySelectorAll('.tab-btn');
        const panels = document.querySelectorAll('article[role="tabpanel"]');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                tabButtons.forEach(btn => btn.classList.remove('active'));
                panels.forEach(panel => panel.classList.remove('active'));

                button.classList.add('active');
                const target = button.getAttribute('data-target');
                document.getElementById(target).classList.add('active');
            });
        });
    