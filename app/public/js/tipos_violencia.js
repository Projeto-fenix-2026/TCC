
        const botoesGatilho = document.querySelectorAll('.gatilho');

        botoesGatilho.forEach(botao => {
            botao.addEventListener('click', () => {
                const cardAtual = botao.parentElement;
                const estaAberto = cardAtual.classList.contains('aberto');

                // Opcional: Fecha todos os outros cards para focar apenas em um por vez
                document.querySelectorAll('.violencia-card').forEach(card => {
                    card.classList.remove('aberto');
                    card.querySelector('.gatilho').setAttribute('aria-expanded', 'false');
                });

                // Se o card clicado não estava aberto, abra ele agora
                if (!estaAberto) {
                    cardAtual.classList.add('aberto');
                    botao.setAttribute('aria-expanded', 'true');
                }
            });
        });
    