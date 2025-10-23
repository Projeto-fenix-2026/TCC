

/**
 * Validador de Formulário de Login
 * Responsável por validar email e senha com feedback em tempo real
 */

class LoginValidator {
    constructor() {
        this.form = document.getElementById('loginForm');
        this.emailInput = document.getElementById('email');
        this.passwordInput = document.getElementById('password');
        this.togglePasswordBtn = document.getElementById('togglePassword');

        if (this.form) {
            this.setupEventListeners();
            this.setupFormSubmission();
        }
    }

    /**
     * Configura os event listeners para validação em tempo real
     */
    setupEventListeners() {
        // Validação ao sair do campo (blur)
        this.emailInput.addEventListener('blur', (e) => {
            this.validateField(e.target);
        });

        this.passwordInput.addEventListener('blur', (e) => {
            this.validateField(e.target);
        });

        // Validação durante a digitação com debounce
        this.emailInput.addEventListener('input', this.debounce((e) => {
            this.validateField(e.target);
        }, 300));

        this.passwordInput.addEventListener('input', this.debounce((e) => {
            this.validateField(e.target);
        }, 300));

        // Toggle de visibilidade da senha
        this.togglePasswordBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.togglePasswordVisibility();
        });
    }

    /**
     * Configura o envio do formulário
     */
    setupFormSubmission() {
        // CÓDIGO MODIFICADO
this.form._submitListener = (e) => {
  const formType = this.getFormType();
  
  // Verifica se a validação de frontend FALHOU
  if (!this.validateAllFields(formType)) {
    
    e.preventDefault(); // IMPEDE o envio para o backend
    
    // Encontra o primeiro campo inválido e foca nele
    const firstInvalid = this.form.querySelector('.input-box.invalid input, .input-box.invalid select');
    if (firstInvalid) {
        firstInvalid.focus();
    }
    
    // Opcional: Remova o 'alert' se ele ainda estiver no seu código
    // alert(`Formulário de ${formType} inválido!`); 
    
  } 
  // Se a validação de frontend PASSAR, o código continua e o formulário
  // é submetido normalmente para a rota do Express.
};
    }

    /**
     * Valida um campo individual
     * @param {HTMLElement} input - O elemento input a validar
     */
    validateField(input) {
        const inputBox = input.closest('.input-box');
        let result;

        if (input.id === 'email') {
            result = this.validateEmail(input.value);
        } else if (input.id === 'password') {
            result = this.validatePassword(input.value);
        }

        this.updateFieldUI(input, result);
        return result;
    }

    /**
     * Valida todos os campos do formulário
     * @returns {boolean} - True se todos os campos são válidos
     */
    validateAllFields() {
        const emailResult = this.validateEmail(this.emailInput.value);
        const passwordResult = this.validatePassword(this.passwordInput.value);

        this.updateFieldUI(this.emailInput, emailResult);
        this.updateFieldUI(this.passwordInput, passwordResult);

        return emailResult.isValid && passwordResult.isValid;
    }

    /**
     * Valida o email
     * @param {string} email - O email a validar
     * @returns {object} - Objeto com isValid e message
     */
    validateEmail(email) {
        // Verifica se o campo está vazio
        if (!email || email.trim() === '') {
            return {
                isValid: false,
                message: 'E-mail é obrigatório'
            };
        }

        // Regex para validação de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return {
                isValid: false,
                message: 'E-mail inválido'
            };
        }

        // Validação adicional: comprimento máximo
        if (email.length > 254) {
            return {
                isValid: false,
                message: 'E-mail muito longo'
            };
        }

        return {
            isValid: true,
            message: ''
        };
    }

    /**
     * Valida a senha
     * @param {string} password - A senha a validar
     * @returns {object} - Objeto com isValid e message
     */
    validatePassword(password) {
        // Verifica se o campo está vazio
        if (!password || password.trim() === '') {
            return {
                isValid: false,
                message: 'Senha é obrigatória'
            };
        }

        // Validação: comprimento mínimo
        if (password.length < 6) {
            return {
                isValid: false,
                message: 'Senha deve ter pelo menos 6 caracteres'
            };
        }

        // Validação: comprimento máximo
        if (password.length > 128) {
            return {
                isValid: false,
                message: 'Senha muito longa'
            };
        }

        return {
            isValid: true,
            message: ''
        };
    }

    /**
     * Atualiza a UI do campo com base no resultado da validação
     * @param {HTMLElement} input - O elemento input
     * @param {object} result - Resultado da validação
     */
    updateFieldUI(input, result) {
        const inputBox = input.closest('.input-box');

        if (!inputBox) return;

        // Remove classes anteriores
        inputBox.classList.remove('valid', 'invalid');

        // Encontra ou cria o elemento de mensagem de erro
        let errorElement = inputBox.querySelector('.error-message');
        if (!errorElement) {
            errorElement = document.createElement('span');
            errorElement.className = 'error-message';
            inputBox.appendChild(errorElement);
        }

        if (result.isValid) {
            inputBox.classList.add('valid');
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        } else {
            inputBox.classList.add('invalid');
            errorElement.textContent = result.message;
            errorElement.style.display = 'block';
        }
    }

    /**
     * Alterna a visibilidade da senha
     */
    togglePasswordVisibility() {
        const isPassword = this.passwordInput.type === 'password';

        if (isPassword) {
            this.passwordInput.type = 'text';
            this.togglePasswordBtn.innerHTML = '<i class="bx bx-show"></i>';
        } else {
            this.passwordInput.type = 'password';
            this.togglePasswordBtn.innerHTML = '<i class="bx bx-hide"></i>';
        }
    }

   

    /**
     * Função debounce para evitar validação excessiva
     * @param {function} func - Função a executar
     * @param {number} delay - Delay em milissegundos
     * @returns {function} - Função debounced
     */
    debounce(func, delay) {
        let timeoutId;

        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    }
}

// Inicializa o validador quando o DOM está pronto
document.addEventListener('DOMContentLoaded', () => {
    new LoginValidator();
});

