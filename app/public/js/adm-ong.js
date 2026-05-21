function abrirModalCadastro() {
    document.getElementById('modalTitulo').textContent = 'Adicionar ONG';
    document.getElementById('formOng').action = '/adm/adm-ong/cadastrar';
    document.getElementById('ongId').value = '';
    document.getElementById('ongNome').value = '';
    document.getElementById('ongEmail').value = '';
    document.getElementById('ongTelefone').value = '';
    document.getElementById('ongCnpj').value = '';
    document.getElementById('modalOng').classList.add('active');
}

function abrirModalEditar(btn) {
    document.getElementById('modalTitulo').textContent = 'Editar ONG';
    document.getElementById('formOng').action = '/adm/adm-ong/editar';
    document.getElementById('ongId').value = btn.dataset.id;
    document.getElementById('ongNome').value = btn.dataset.nome;
    document.getElementById('ongEmail').value = btn.dataset.email;
    document.getElementById('ongTelefone').value = btn.dataset.telefone;
    document.getElementById('ongCnpj').value = btn.dataset.cnpj;
    document.getElementById('modalOng').classList.add('active');
}

function fecharModal() {
    document.getElementById('modalOng').classList.remove('active');
}

document.getElementById('modalOng').addEventListener('click', function (e) {
    if (e.target === this) fecharModal();
});

function filtrarTabela() {
    const termo = document.getElementById('searchInput').value.toLowerCase();
    const linhas = document.querySelectorAll('#tabelaOngs tbody tr');
    linhas.forEach(function (linha) {
        linha.style.display = linha.textContent.toLowerCase().includes(termo) ? '' : 'none';
    });
}
