// ---------- Máscaras ----------
function mascaraTelefone(valor) {
    valor = valor.replace(/\D/g, '').substring(0, 11);
    if (valor.length > 7)  return `(${valor.slice(0,2)}) ${valor.slice(2,7)}-${valor.slice(7)}`;
    if (valor.length > 2)  return `(${valor.slice(0,2)}) ${valor.slice(2)}`;
    if (valor.length > 0)  return `(${valor}`;
    return valor;
}

function mascaraCnpj(valor) {
    valor = valor.replace(/\D/g, '').substring(0, 14);
    if (valor.length > 12) return `${valor.slice(0,2)}.${valor.slice(2,5)}.${valor.slice(5,8)}/${valor.slice(8,12)}-${valor.slice(12)}`;
    if (valor.length > 8)  return `${valor.slice(0,2)}.${valor.slice(2,5)}.${valor.slice(5,8)}/${valor.slice(8)}`;
    if (valor.length > 5)  return `${valor.slice(0,2)}.${valor.slice(2,5)}.${valor.slice(5)}`;
    if (valor.length > 2)  return `${valor.slice(0,2)}.${valor.slice(2)}`;
    return valor;
}

// ---------- CNPJ ----------
function validarCnpj(cnpj) {
    cnpj = cnpj.replace(/\D/g, '');
    if (cnpj.length !== 14) return false;
    const seq = ['00000000000000','11111111111111','22222222222222','33333333333333',
        '44444444444444','55555555555555','66666666666666','77777777777777',
        '88888888888888','99999999999999'];
    if (seq.includes(cnpj)) return false;
    let tam = cnpj.length - 2;
    let nums = cnpj.substring(0, tam);
    const digs = cnpj.substring(tam);
    let soma = 0, pos = tam - 7;
    for (let i = tam; i >= 1; i--) { soma += nums.charAt(tam - i) * pos--; if (pos < 2) pos = 9; }
    let res = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (res != digs.charAt(0)) return false;
    tam++; nums = cnpj.substring(0, tam); soma = 0; pos = tam - 7;
    for (let i = tam; i >= 1; i--) { soma += nums.charAt(tam - i) * pos--; if (pos < 2) pos = 9; }
    res = soma % 11 < 2 ? 0 : 11 - soma % 11;
    return res == digs.charAt(1);
}

// ---------- Erros ----------
function mostrarErro(id, msg) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = msg;
    el.style.display = 'block';
    const input = el.previousElementSibling;
    if (input && input.tagName !== 'INPUT' || input?.type === 'hidden') return;
    if (input) input.classList.add('input-erro');
}

function limparErro(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = '';
    el.style.display = 'none';
    const input = el.previousElementSibling;
    if (input) input.classList.remove('input-erro');
}

function limparErros() {
    ['erro-nome','erro-email','erro-telefone','erro-cnpj','erro-descricao','erro-imagem']
        .forEach(limparErro);
}

// ---------- Validações em tempo real ----------
function validarNome() {
    const v = document.getElementById('ongNome').value.trim();
    if (!v)          { mostrarErro('erro-nome', 'Nome é obrigatório.'); return false; }
    if (v.length > 50) { mostrarErro('erro-nome', 'Máximo 50 caracteres.'); return false; }
    limparErro('erro-nome'); return true;
}

function validarEmail() {
    const v = document.getElementById('ongEmail').value.trim();
    if (!v)                                      { mostrarErro('erro-email', 'E-mail é obrigatório.'); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))  { mostrarErro('erro-email', 'E-mail inválido.'); return false; }
    limparErro('erro-email'); return true;
}

function validarTelefone() {
    const digits = document.getElementById('ongTelefone').value.replace(/\D/g, '');
    if (!digits)           { mostrarErro('erro-telefone', 'Telefone é obrigatório.'); return false; }
    if (digits.length < 11){ mostrarErro('erro-telefone', 'Digite os 11 dígitos completos.'); return false; }
    limparErro('erro-telefone'); return true;
}

function validarCnpjCampo() {
    const digits = document.getElementById('ongCnpj').value.replace(/\D/g, '');
    if (!digits)            { mostrarErro('erro-cnpj', 'CNPJ é obrigatório.'); return false; }
    if (digits.length < 14) { mostrarErro('erro-cnpj', 'Digite os 14 dígitos completos.'); return false; }
    if (!validarCnpj(digits)){ mostrarErro('erro-cnpj', 'CNPJ inválido.'); return false; }
    limparErro('erro-cnpj'); return true;
}

function validarDescricao() {
    const v = document.getElementById('ongDescricao').value;
    if (v.length > 500) { mostrarErro('erro-descricao', 'Máximo 500 caracteres.'); return false; }
    limparErro('erro-descricao'); return true;
}

function validarImagem(file) {
    if (!file) { limparErro('erro-imagem'); return true; }
    const permitidos = ['image/jpeg','image/png','image/webp','image/gif'];
    if (!permitidos.includes(file.type)) { mostrarErro('erro-imagem', 'Somente JPG, PNG, WEBP ou GIF.'); return false; }
    if (file.size > 3 * 1024 * 1024)    { mostrarErro('erro-imagem', 'Imagem deve ter no máximo 3 MB.'); return false; }
    limparErro('erro-imagem'); return true;
}

// ---------- Validação no submit ----------
function validarFormOng(e) {
    // Normaliza os campos com máscara para dígitos antes de submeter
    const telInput  = document.getElementById('ongTelefone');
    const cnpjInput = document.getElementById('ongCnpj');
    telInput.value  = telInput.value.replace(/\D/g, '');
    cnpjInput.value = cnpjInput.value.replace(/\D/g, '');

    const ok = [validarNome(), validarEmail(), validarTelefone(), validarCnpjCampo(), validarDescricao()].every(Boolean);

    if (!ok) {
        // Reaplica máscara para o usuário ver os valores formatados
        telInput.value  = mascaraTelefone(telInput.value);
        cnpjInput.value = mascaraCnpj(cnpjInput.value);
        e.preventDefault();
    }
    return ok;
}

// ---------- Modal ----------
function abrirModalCadastro() {
    document.getElementById('modalTitulo').textContent = 'Adicionar ONG';
    document.getElementById('formOng').action = '/adm/adm-ong/cadastrar';
    document.getElementById('ongId').value = '';
    document.getElementById('ongNome').value = '';
    document.getElementById('ongEmail').value = '';
    document.getElementById('ongTelefone').value = '';
    document.getElementById('ongCnpj').value = '';
    document.getElementById('ongDescricao').value = '';
    document.getElementById('ongImagem').value = '';
    document.getElementById('ongImagemAtual').value = '';
    document.getElementById('ongImagemPreview').src = '';
    document.getElementById('ongImagemPreview').style.display = 'none';
    limparErros();
    document.getElementById('modalOng').classList.add('active');
}

function abrirModalEditar(btn) {
    document.getElementById('modalTitulo').textContent = 'Editar ONG';
    document.getElementById('formOng').action = '/adm/adm-ong/editar';
    document.getElementById('ongId').value       = btn.dataset.id;
    document.getElementById('ongNome').value     = btn.dataset.nome;
    document.getElementById('ongEmail').value    = btn.dataset.email;
    document.getElementById('ongTelefone').value = mascaraTelefone(btn.dataset.telefone);
    document.getElementById('ongCnpj').value     = mascaraCnpj(btn.dataset.cnpj);
    document.getElementById('ongDescricao').value = btn.dataset.descricao || '';
    document.getElementById('ongImagem').value = '';
    const imagemAtual = btn.dataset.imagem || '';
    document.getElementById('ongImagemAtual').value = imagemAtual;
    const preview = document.getElementById('ongImagemPreview');
    preview.src = imagemAtual || '';
    preview.style.display = imagemAtual ? 'block' : 'none';
    limparErros();
    document.getElementById('modalOng').classList.add('active');
}

function fecharModal() {
    document.getElementById('modalOng').classList.remove('active');
    limparErros();
}

// ---------- Eventos ----------
document.getElementById('modalOng').addEventListener('click', function (e) {
    if (e.target === this) fecharModal();
});

document.getElementById('ongNome').addEventListener('input', validarNome);
document.getElementById('ongEmail').addEventListener('input', validarEmail);
document.getElementById('ongDescricao').addEventListener('input', validarDescricao);

document.getElementById('ongTelefone').addEventListener('input', function () {
    this.value = mascaraTelefone(this.value);
    validarTelefone();
});

document.getElementById('ongCnpj').addEventListener('input', function () {
    this.value = mascaraCnpj(this.value);
    validarCnpjCampo();
});

document.getElementById('ongImagem').addEventListener('change', function () {
    const file = this.files[0];
    if (validarImagem(file) && file) {
        const preview = document.getElementById('ongImagemPreview');
        preview.src = URL.createObjectURL(file);
        preview.style.display = 'block';
    }
});

// ---------- Pesquisa ----------
function filtrarTabela() {
    const termo = document.getElementById('searchInput').value.toLowerCase();
    document.querySelectorAll('#tabelaOngs tbody tr').forEach(linha => {
        linha.style.display = linha.textContent.toLowerCase().includes(termo) ? '' : 'none';
    });
}
