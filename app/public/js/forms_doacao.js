/**
 * Validador de Formulário de Doação
 * Responsável por validar os campos do formulário de doação com feedback em tempo real.
 */
class DonationFormValidator {
    constructor() {
        this.form = document.getElementById('donationForm');
        this.fields = {
            nome: document.getElementById('nome'),
            email: document.getElementById('email'),
            telefone: document.getElementById('telefone'),
            valor: document.getElementById('valor'),
            pagamento: document.getElementById('pagamento'),
            mensagem: document.getElementById('mensagem') // Opcional, sem validação obrigatória
        };

        if (this.form) {
            this.setupEventListeners();
            this.setupFormSubmission();
        }
    }

    /**
     * Configura os event listeners para validação em tempo real e formatação.
     */
    setupEventListeners() {
        Object.values(this.fields).forEach(field => {
            if (field) {
                // Validação ao sair do campo (blur)
                field.addEventListener('blur', (e) => {
                    this.validateField(e.target);
                });

                // Validação durante a digitação com debounce
                field.addEventListener('input', this.debounce((e) => {
                    this.validateField(e.target);
                }, 300));

                // Formatação específica para telefone
                if (field.id === 'telefone') {
                    field.addEventListener('input', (e) => {
                        this.formatPhone(e.target);
                    });
                }
            }
        });
    }

    /**
     * Configura o envio do formulário.
     */
    setupFormSubmission() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();

            if (this.validateAllFields()) {
                this.submitForm();
            } else {
                // Foca no primeiro campo inválido
                const firstInvalid = this.form.querySelector('.form-group.invalid input, .form-group.invalid select, .form-group.invalid textarea');
                if (firstInvalid) {
                    firstInvalid.focus();
                }
            }
        });
    }

    /**
     * Valida um campo individual e atualiza a UI.
     * @param {HTMLElement} input - O elemento input a validar.
     * @returns {object} - Objeto com isValid e message.
     */
    validateField(input) {
        let result = { isValid: true, message: '' };

        if (!input.hasAttribute('required') && input.id !== 'mensagem') {
            this.updateFieldUI(input, result); // Campos não obrigatórios não precisam de validação se vazios
            return result;
        }

        switch (input.id) {
            case 'nome':
                result = this.validateName(input.value);
                break;
            case 'email':
                result = this.validateEmail(input.value);
                break;
            case 'telefone':
                result = this.validatePhone(input.value);
                break;
            case 'valor':
                result = this.validateDonationValue(input.value);
                break;
            case 'pagamento':
                result = this.validateRequired(input.value, 'Selecione um método de pagamento');
                break;
            case 'mensagem':
                // Mensagem é opcional, não precisa de validação de conteúdo aqui
                break;
            default:
                break;
        }

        this.updateFieldUI(input, result);
        return result;
    }

    /**
     * Valida todos os campos do formulário.
     * @returns {boolean} - True se todos os campos obrigatórios são válidos.
     */
    validateAllFields() {
        let allValid = true;
        for (const fieldName in this.fields) {
            const field = this.fields[fieldName];
            if (field && field.hasAttribute('required')) {
                const result = this.validateField(field);
                if (!result.isValid) {
                    allValid = false;
                }
            }
        }
        return allValid;
    }

    /**
     * Validação genérica para campos obrigatórios.
     * @param {string} value - O valor do campo.
     * @param {string} message - Mensagem de erro personalizada.
     * @returns {object}
     */
    validateRequired(value, message = 'Campo obrigatório') {
        if (!value || value.trim() === '') {
            return { isValid: false, message: message };
        }
        return { isValid: true, message: '' };
    }

    /**
     * Valida o nome completo.
     * @param {string} name - O nome a validar.
     * @returns {object}
     */
    validateName(name) {
        const requiredResult = this.validateRequired(name, 'Nome completo é obrigatório');
        if (!requiredResult.isValid) return requiredResult;

        if (name.trim().length < 3) {
            return { isValid: false, message: 'Nome deve ter pelo menos 3 caracteres' };
        }
        if (name.trim().length > 100) {
            return { isValid: false, message: 'Nome muito longo (máximo 100 caracteres)' };
        }
        return { isValid: true, message: '' };
    }

    /**
     * Valida o email.
     * @param {string} email - O email a validar.
     * @returns {object}
     */
    validateEmail(email) {
        const requiredResult = this.validateRequired(email, 'E-mail é obrigatório');
        if (!requiredResult.isValid) return requiredResult;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return { isValid: false, message: 'E-mail inválido' };
        }
        return { isValid: true, message: '' };
    }

    /**
     * Valida o telefone.
     * @param {string} phone - O telefone a validar.
     * @returns {object}
     */
    validatePhone(phone) {
        const requiredResult = this.validateRequired(phone, 'Telefone é obrigatório');
        if (!requiredResult.isValid) return requiredResult;

        // Remove todos os caracteres não numéricos
        const cleanPhone = phone.replace(/\D/g, '');

        // Valida se tem 10 ou 11 dígitos (com ou sem DDD)
        if (cleanPhone.length < 10 || cleanPhone.length > 11) {
            return { isValid: false, message: 'Telefone inválido (mínimo 10, máximo 11 dígitos)' };
        }
        return { isValid: true, message: '' };
    }

    /**
     * Formata o telefone (adiciona parênteses e hífen).
     * @param {HTMLElement} input - O campo de telefone.
     */
    formatPhone(input) {
        let value = input.value.replace(/\D/g, ''); // Remove tudo que não é dígito
        let formattedValue = '';

        if (value.length > 0) {
            formattedValue = '(' + value.substring(0, 2);
            if (value.length > 2) {
                formattedValue += ') ' + value.substring(2, 7);
                if (value.length > 7) {
                    formattedValue += '-' + value.substring(7, 11);
                }
            }
        }
        input.value = formattedValue;
    }

    /**
     * Valida o valor da doação.
     * @param {string} value - O valor da doação a validar.
     * @returns {object}
     */
    validateDonationValue(value) {
        const requiredResult = this.validateRequired(value, 'Valor da doação é obrigatório');
        if (!requiredResult.isValid) return requiredResult;

        const numValue = parseFloat(value);
        if (isNaN(numValue) || numValue <= 0) {
            return { isValid: false, message: 'Valor inválido. Deve ser um número positivo.' };
        }
        return { isValid: true, message: '' };
    }

    /**
     * Atualiza a UI do campo com base no resultado da validação.
     * @param {HTMLElement} input - O elemento input.
     * @param {object} result - Resultado da validação.
     */
    updateFieldUI(input, result) {
        const formGroup = input.closest('.form-group');
        if (!formGroup) return;

        let errorElement = formGroup.querySelector('.error-message');
        if (!errorElement) {
            errorElement = document.createElement('span');
            errorElement.className = 'error-message';
            formGroup.appendChild(errorElement);
        }

        formGroup.classList.remove('valid', 'invalid');

        if (result.isValid) {
            formGroup.classList.add('valid');
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        } else {
            formGroup.classList.add('invalid');
            errorElement.textContent = result.message;
            errorElement.style.display = 'block';
        }
    }

    /**
     * Simula o envio do formulário.
     */
    submitForm() {
        alert('Formulário de doação válido! Pronto para enviar.');
        // Aqui você faria o envio real dos dados (e.g., via AJAX)
        console.log('Formulário enviado:', {
            nome: this.fields.nome.value,
            email: this.fields.email.value,
            telefone: this.fields.telefone.value,
            valor: this.fields.valor.value,
            pagamento: this.fields.pagamento.value,
            mensagem: this.fields.mensagem.value
        });
        this.form.reset(); // Limpa o formulário após o envio
        // Opcional: remover classes de validação após reset
        Object.values(this.fields).forEach(field => {
            if (field) {
                const formGroup = field.closest('.form-group');
                if (formGroup) {
                    formGroup.classList.remove('valid', 'invalid');
                    const errorElement = formGroup.querySelector('.error-message');
                    if (errorElement) {
                        errorElement.textContent = '';
                        errorElement.style.display = 'none';
                    }
                }
            }
        });
    }

    /**
     * Função debounce para evitar validação excessiva em eventos de 'input'.
     * @param {function} func - A função a ser executada.
     * @param {number} delay - O atraso em milissegundos.
     * @returns {function} - A função debounced.
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

// Inicializa o validador quando o DOM está pronto.
document.addEventListener('DOMContentLoaded', () => {
    new DonationFormValidator();
});