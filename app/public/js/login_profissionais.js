// Função para voltar para o início
function voltarParaInicio() {
    if (confirm('Você deseja voltar para o início? Alterações não salvas serão perdidas.')) {
        window.location.href = 'index.html';
    }
}

// Validação e manipulação do formulário de alteração de senha
const passwordForm = document.getElementById('passwordForm');
const newPasswordInput = document.getElementById('newPassword');
const confirmPasswordInput = document.getElementById('confirmPassword');
const currentPasswordInput = document.getElementById('currentPassword');
const successMessage = document.getElementById('successMessage');

// Verificar força da senha em tempo real
newPasswordInput.addEventListener('input', function() {
    const strength = checkPasswordStrength(this.value);
    updatePasswordStrengthIndicator(strength);
    validatePasswordMatch();
});

// Validar correspondência de senhas em tempo real
confirmPasswordInput.addEventListener('input', function() {
    validatePasswordMatch();
});

// Função para verificar a força da senha
function checkPasswordStrength(password) {
    let strength = 0;

    // Verificar comprimento
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;

    // Verificar tipos de caracteres
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    // Retornar nível de força
    if (strength <= 2) return 'weak';
    if (strength <= 4) return 'medium';
    return 'strong';
}

// Atualizar indicador visual de força da senha
function updatePasswordStrengthIndicator(strength) {
    const indicator = document.getElementById('passwordStrength');
    indicator.className = 'password-strength ' + strength;

    const labels = {
        weak: 'Fraca',
        medium: 'Média',
        strong: 'Forte'
    };

    indicator.title = 'Força da senha: ' + labels[strength];
}

// Validar se as senhas correspondem
function validatePasswordMatch() {
    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    const confirmPasswordError = document.getElementById('confirmPasswordError');

    if (confirmPassword && newPassword !== confirmPassword) {
        confirmPasswordError.textContent = 'As senhas não correspondem';
        confirmPasswordInput.classList.add('invalid');
        return false;
    } else {
        confirmPasswordError.textContent = '';
        confirmPasswordInput.classList.remove('invalid');
        return true;
    }
}

// Validar senha atual
function validateCurrentPassword(password) {
    // Simulação: em uma aplicação real, isso seria validado no servidor
    // Por enquanto, apenas verificamos se não está vazia
    if (!password) {
        return false;
    }
    return true;
}

// Submeter formulário
passwordForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const currentPassword = currentPasswordInput.value;
    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    // Limpar mensagens de erro anteriores
    document.getElementById('currentPasswordError').textContent = '';
    document.getElementById('newPasswordError').textContent = '';
    document.getElementById('confirmPasswordError').textContent = '';
    successMessage.classList.remove('show');

    let isValid = true;

    // Validar senha atual
    if (!validateCurrentPassword(currentPassword)) {
        document.getElementById('currentPasswordError').textContent = 'Por favor, digite sua senha atual';
        isValid = false;
    }

    // Validar nova senha
    if (newPassword.length < 8) {
        document.getElementById('newPasswordError').textContent = 'A senha deve ter pelo menos 8 caracteres';
        isValid = false;
    }

    // Validar correspondência de senhas
    if (!validatePasswordMatch()) {
        isValid = false;
    }

    // Validar se a nova senha é diferente da atual
    if (currentPassword === newPassword) {
        document.getElementById('newPasswordError').textContent = 'A nova senha deve ser diferente da senha atual';
        isValid = false;
    }

    if (isValid) {
        // Simular envio para o servidor
        console.log('Enviando dados para o servidor...');
        
        // Mostrar mensagem de sucesso
        successMessage.textContent = '✓ Senha alterada com sucesso!';
        successMessage.classList.add('show');

        // Limpar formulário após 2 segundos
        setTimeout(() => {
            passwordForm.reset();
            document.getElementById('passwordStrength').className = 'password-strength';
            successMessage.classList.remove('show');
        }, 2000);

        // Em uma aplicação real, aqui você faria uma requisição AJAX/Fetch para o servidor
        // Exemplo:
        /*
        fetch('/api/change-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                currentPassword: currentPassword,
                newPassword: newPassword
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                successMessage.textContent = '✓ Senha alterada com sucesso!';
                successMessage.classList.add('show');
                passwordForm.reset();
                setTimeout(() => {
                    successMessage.classList.remove('show');
                }, 3000);
            } else {
                document.getElementById('currentPasswordError').textContent = data.message;
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            document.getElementById('currentPasswordError').textContent = 'Erro ao alterar senha. Tente novamente.';
        });
        */
    }
});

// Resetar indicador de força quando limpar o formulário
passwordForm.addEventListener('reset', function() {
    document.getElementById('passwordStrength').className = 'password-strength';
    document.getElementById('currentPasswordError').textContent = '';
    document.getElementById('newPasswordError').textContent = '';
    document.getElementById('confirmPasswordError').textContent = '';
    successMessage.classList.remove('show');
});

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    console.log('Página de perfil carregada com sucesso');
    
    // Você pode adicionar aqui chamadas para carregar dados do usuário do servidor
    // loadUserProfile();
});