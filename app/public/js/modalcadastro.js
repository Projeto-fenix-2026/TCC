// ======================================================================================================
// Lógica de Validação e Alternância de Formulário (Integrada e Adaptada)
// Baseado na nova estrutura de validação fornecida pelo usuário.
// ======================================================================================================

class FormValidator {
  constructor() {
    // A classe não precisa de this.forms, pois o formulário é dinâmico.
    this.form = document.querySelector('form');
    
    // Mapeamento dos validadores (adaptado para os IDs/Names do seu projeto)
    this.validators = {
      // Validadores para o formulário de usuário comum (Pessoa Física)
      pessoaFisica: {
        firstname: this.validateName,
        cpf: this.validateCPF,
        email: this.validateEmail,
        number: this.validatePhone, // Adaptado para 'number'
        password: this.validatePassword,
        confirmPassword: this.validateConfirmPassword
      },
      // Validadores para o formulário de parceiro (Empresa/Pessoa Física)
      parceiro: {
        empresa: this.validateCompanyName,
        email: this.validateEmail,
        tipoRegistro: this.validateRequired,
        cpf: this.validateCPFOrCNPJ, // Validação dinâmica de CPF/CNPJ
        number: this.validatePhone, // Adaptado para 'number'
        password: this.validatePassword,
        confirmPassword: this.validateConfirmPassword,
        generoPartner: this.validateRequired
      }
    };
   
    // A inicialização será feita fora do construtor, na lógica de alternância.
  }
 
  // Função auxiliar para determinar o tipo de formulário ativo
  getFormType() {
      const formHeaderTitulo = document.querySelector(".form-header .title h1");
      if (formHeaderTitulo && formHeaderTitulo.innerText.includes("Parceiros")) {
          return 'parceiro';
      }
      return 'pessoaFisica';
  }

  setupEventListeners() {
    if (!this.form) return;
    
    // Remove listeners de inputs anteriores para evitar duplicação ao alternar formulários
    const inputs = this.form.querySelectorAll('input, select');
    inputs.forEach(input => {
        // Ignora botões
        if (input.id === 'btn-parceiro' || input.type === 'submit' || input.type === 'button') return;

        // Limpa listeners anteriores (se existirem)
        if (input._blurListener) input.removeEventListener('blur', input._blurListener);
        if (input._inputListener) input.removeEventListener('input', input._inputListener);
        if (input._formatListener) input.removeEventListener('input', input._formatListener);
        if (input._strengthListener) input.removeEventListener('input', input._strengthListener);


        // Validação em tempo real (blur)
        input._blurListener = (e) => {
            this.validateField(this.getFormType(), e.target);
        };
        input.addEventListener('blur', input._blurListener);

        // Validação durante a digitação (debounce)
        input._inputListener = this.debounce((e) => {
            this.validateField(this.getFormType(), e.target);
        }, 300);
        input.addEventListener('input', input._inputListener);
        
        // Listener imediato para força da senha
        if (input.id === 'password') {
            input._strengthListener = (e) => {
                this.updatePasswordStrengthUI(e.target);
            };
            input.addEventListener('input', input._strengthListener);
        }

        // Adiciona o listener para o toggle de senha
        if (input.type === 'password') {
            const toggleButton = input.closest('.input-box').querySelector('.password-toggle');
            if (toggleButton) {
                // Remove listener anterior para evitar duplicação
                if (toggleButton._clickListener) toggleButton.removeEventListener('click', toggleButton._clickListener);
                
                // Adiciona o novo listener
                toggleButton._clickListener = () => this.togglePasswordVisibility(input);
                toggleButton.addEventListener('click', toggleButton._clickListener);
            }
        }

        // Formatação para CPF e CNPJ
        if (input.id === 'cpf') {
            input._formatListener = (e) => {
                const tipoRegistro = document.getElementById('tipoRegistro');
                const formType = this.getFormType();

                if (formType === 'pessoaFisica' || (tipoRegistro && tipoRegistro.value === 'cpf')) {
                    this.formatCPF(e.target);
                } else if (tipoRegistro && tipoRegistro.value === 'cnpj') {
                    this.formatCNPJ(e.target);
                }
            };
            input.addEventListener('input', input._formatListener);
        }
        
        // Formatação para Telefone
        if (input.id === 'number') {
            input._formatListener = (e) => {
                this.formatPhone(e.target);
            };
            input.addEventListener('input', input._formatListener);
        }
    });

    // Adiciona listener para o select de Tipo de Registro no formulário de parceiro
    const tipoRegistro = document.getElementById('tipoRegistro');
    if (tipoRegistro) {
        if (tipoRegistro._changeListener) tipoRegistro.removeEventListener('change', tipoRegistro._changeListener);
        tipoRegistro._changeListener = () => {
            // Revalida o campo CPF/CNPJ quando o tipo de registro muda
            const cpfInput = document.getElementById('cpf');
            if (cpfInput) {
                this.validateField('parceiro', cpfInput);
            }
        };
        tipoRegistro.addEventListener('change', tipoRegistro._changeListener);
    }
  }
 
  setupFormSubmission() {
    if (!this.form) return;
    
    if (this.form._submitListener) this.form.removeEventListener('submit', this.form._submitListener);
    
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
    this.form.addEventListener('submit', this.form._submitListener);
  }
 
  validateField(formType, input) {
    const fieldName = input.id; // Usando ID como nome do campo
    const validator = this.validators[formType] ? this.validators[formType][fieldName] : null;
   
    if (!validator) return { isValid: true, message: '' };
 
    const result = validator.call(this, input.value, formType, input);
    this.updateFieldUI(input, result);
   
    return result;
  }
 
  validateAllFields(formType) {
    if (!this.form) return false;
    
    const inputs = this.form.querySelectorAll('input[required], select[required]');
    let allValid = true;
   
    inputs.forEach(input => {
      // Ignora campos que não são relevantes para o formulário atual (ex: CPF/CNPJ Box)
      const inputBox = input.closest('.input-box');
      if (inputBox && inputBox.style.display === 'none') {
          return;
      }
      
      const result = this.validateField(formType, input);
      if (!result || !result.isValid) {
        allValid = false;
      }
    });
   
    return allValid;
  }
 
  updateFieldUI(input, result) {
    const inputBox = input.closest('.input-box');
    
    // Se o input for um radio button (gênero), o tratamento é diferente
    if (input.type === 'radio') {
        const genderInputs = input.closest('.gender-inputs');
        if (genderInputs) {
            genderInputs.classList.remove('invalid');
            if (!result.isValid) {
                genderInputs.classList.add('invalid');
            }
        }
        return;
    }
    
    // Para selects e inputs normais
    if (!inputBox) return;

    let errorElement = inputBox.querySelector('.error-message');
    if (!errorElement) {
        errorElement = document.createElement('span');
        errorElement.className = 'error-message';
        // O estilo será aplicado via CSS, mas adicionamos o elemento
        inputBox.appendChild(errorElement);
    }

    inputBox.classList.remove('valid', 'invalid');
 
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
 
  // Validações específicas
  validateRequired(value) {
      if (!value || value.trim() === "") {
          return { isValid: false, message: 'Campo obrigatório' };
      }
      return { isValid: true, message: '' };
  }

  validateName(value) {
    if (!value || value.trim().length < 2) {
      return { isValid: false, message: 'Nome deve ter pelo menos 2 caracteres' };
    }
    if (value.trim().length > 100) {
      return { isValid: false, message: 'Nome muito longo (máximo 100 caracteres)' };
    }
    return { isValid: true, message: '' };
  }
 
  validateCompanyName(value) {
    if (!value || value.trim().length < 2) {
      return { isValid: false, message: 'Nome da empresa deve ter pelo menos 2 caracteres' };
    }
    if (value.trim().length > 150) {
      return { isValid: false, message: 'Nome da empresa muito longo (máximo 150 caracteres)' };
    }
    return { isValid: true, message: '' };
  }
 
  validateCPF(value) {
    if (!value) {
      return { isValid: false, message: 'CPF é obrigatório' };
    }
    const cpf = value.replace(/\D/g, '');
    if (cpf.length !== 11) {
      return { isValid: false, message: 'CPF deve ter 11 dígitos' };
    }
    if (/^(\d)\1{10}$/.test(cpf)) {
      return { isValid: false, message: 'CPF inválido' };
    }
    if (!this.isValidCPF(cpf)) {
      return { isValid: false, message: 'CPF inválido' };
    }
    return { isValid: true, message: '' };
  }

  validateCNPJ(value) {
    if (!value) {
      return { isValid: false, message: 'CNPJ é obrigatório' };
    }
    const cnpj = value.replace(/\D/g, '');
    if (cnpj.length !== 14) {
      return { isValid: false, message: 'CNPJ deve ter 14 dígitos' };
    }
    if (/^(\d)\1{13}$/.test(cnpj)) {
      return { isValid: false, message: 'CNPJ inválido' };
    }
    if (!this.isValidCNPJ(cnpj)) {
      return { isValid: false, message: 'CNPJ inválido' };
    }
    return { isValid: true, message: '' };
  }

  validateCPFOrCNPJ(value) {
      const tipoRegistro = document.getElementById('tipoRegistro');
      if (!tipoRegistro || tipoRegistro.value === "") {
          return { isValid: false, message: 'Selecione o Tipo de Registro' };
      }
      
      if (tipoRegistro.value === 'cpf') {
          return this.validateCPF(value);
      } else if (tipoRegistro.value === 'cnpj') {
          return this.validateCNPJ(value);
      }
      return { isValid: true, message: '' };
  }
 
  validateEmail(value) {
    if (!value) {
      return { isValid: false, message: 'E-mail é obrigatório' };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return { isValid: false, message: 'E-mail inválido' };
    }
    if (value.length > 254) {
      return { isValid: false, message: 'E-mail muito longo' };
    }
    return { isValid: true, message: '' };
  }

  validatePhone(value) {
      if (!value) {
          return { isValid: false, message: 'Telefone é obrigatório' };
      }
      const phone = value.replace(/\D/g, '');
      // Adaptação: Mínimo 10 (com DDD) e máximo 11 (com 9º dígito)
      if (phone.length < 10 || phone.length > 11) {
          return { isValid: false, message: 'Telefone inválido (mín. 10, máx. 11 dígitos)' };
      }
      return { isValid: true, message: '' };
  }
 
  validatePassword(value) {
    if (!value) {
      return { isValid: false, message: 'Senha é obrigatória' };
    }
    if (value.length < 8) {
      return { isValid: false, message: 'Senha deve ter pelo menos 8 caracteres' };
    }
    if (value.length > 128) {
      return { isValid: false, message: 'Senha muito longa (máximo 128 caracteres)' };
    }
    if (!/(?=.*[a-z])/.test(value)) {
      return { isValid: false, message: 'Senha deve conter pelo menos uma letra minúscula' };
    }
    if (!/(?=.*[A-Z])/.test(value)) {
      return { isValid: false, message: 'Senha deve conter pelo menos uma letra maiúscula' };
    }
    if (!/(?=.*\d)/.test(value)) {
      return { isValid: false, message: 'Senha deve conter pelo menos um número' };
    }
    // Adicionando a validação de símbolo (mantendo o que você pediu)
    if (!/(?=.*[^a-zA-Z0-9\s])/.test(value)) {
      return { isValid: false, message: 'Senha deve conter pelo menos um símbolo' };
    }
    return { isValid: true, message: '' };
  }
 
  validateConfirmPassword(value) {
    if (!value) {
      return { isValid: false, message: 'Confirmação de senha é obrigatória' };
    }
    const passwordInput = this.form.querySelector('#password');
    const passwordValue = passwordInput ? passwordInput.value : '';
 
    if (value !== passwordValue) {
      return { isValid: false, message: 'Senhas não coincidem' };
    }
    return { isValid: true, message: '' };
  }
 
  // Utilitários de Validação de Algoritmo (do código do seu amigo)
  isValidCPF(cpf) {
    let sum = 0;
    let remainder;
    for (let i = 1; i <= 9; i++) {
      sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(9, 10))) return false;
    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(10, 11))) return false;
    return true;
  }
 
  isValidCNPJ(cnpj) {
    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cnpj.charAt(i)) * weights1[i];
    }
    let remainder = sum % 11;
    const digit1 = remainder < 2 ? 0 : 11 - remainder;
    if (digit1 !== parseInt(cnpj.charAt(12))) return false;
    sum = 0;
    for (let i = 0; i < 13; i++) {
      sum += parseInt(cnpj.charAt(i)) * weights2[i];
    }
    remainder = sum % 11;
    const digit2 = remainder < 2 ? 0 : 11 - remainder;
    return digit2 === parseInt(cnpj.charAt(13));
  }
 
  // Funções de Formatação (Máscaras)
  formatCPF(input) {
    let value = input.value.replace(/\D/g, '');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    input.value = value.substring(0, 14);
  }
 
  formatCNPJ(input) {
    let value = input.value.replace(/\D/g, '');
    value = value.replace(/(\d{2})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1/$2');
    value = value.replace(/(\d{4})(\d{1,2})$/, '$1-$2');
    input.value = value.substring(0, 18);
  }

  formatPhone(input) {
    let value = input.value.replace(/\D/g, '');
    let formatted = '';

    if (value.length > 0) {
        formatted += '(' + value.substring(0, 2);
    }
    if (value.length > 2) {
        formatted += ') ' + value.substring(2, 7);
    }
    if (value.length > 7) {
        formatted += '-' + value.substring(7, 11);
    }

    input.value = formatted;
  }
  
  // Utilitários de Força da Senha (do código do seu amigo)
  calculatePasswordStrength(password) {
    let score = 0;
   
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z\d\s]/.test(password)) score++; // Símbolo
    if (password.length >= 12) score++;
 
    return {
        level: Math.min(Math.floor(score / 1.5), 4),
        score: score
    };
  }

  updatePasswordStrengthUI(input) {
    const inputBox = input.closest('.input-box');
    
    // Adiciona o HTML do indicador de força se não existir
    let strengthContainer = inputBox.querySelector('.password-strength-container');
    if (!strengthContainer) {
        strengthContainer = document.createElement('div');
        strengthContainer.className = 'password-strength-container';
        strengthContainer.innerHTML = `
            <div class="strength-bar">
                <div class="strength-fill"></div>
            </div>
            <span class="strength-text">Força da senha</span>
        `;
        inputBox.appendChild(strengthContainer);
    }

    const strengthFill = inputBox.querySelector('.strength-fill');
    const strengthText = inputBox.querySelector('.strength-text');
   
    if (!strengthFill || !strengthText) return;
 
    const password = input.value;
    const strength = this.calculatePasswordStrength(password);
 
    strengthFill.className = 'strength-fill';
    strengthFill.style.width = (strength.level * 25) + '%';
   
    switch (strength.level) {
      case 1:
        strengthFill.classList.add('weak');
        strengthText.textContent = 'Fraca';
        break;
      case 2:
        strengthFill.classList.add('fair');
        strengthText.textContent = 'Razoável';
        break;
      case 3:
        strengthFill.classList.add('good');
        strengthText.textContent = 'Boa';
        break;
      case 4:
        strengthFill.classList.add('strong');
        strengthText.textContent = 'Forte';
        break;
      default:
        strengthText.textContent = 'Força da senha';
        strengthFill.style.width = '0%';
    }
  }

  // Função para mostrar/ocultar senha
  togglePasswordVisibility(input) {
    const icon = input.closest('.input-box').querySelector('.password-toggle i');

    if (input.type === 'password') {
      input.type = 'text';
      icon.className = 'bx bx-show';
    } else {
      input.type = 'password';
      icon.className = 'bx bx-hide';
    }
  }

  // Função de debounce (do código do seu amigo)
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}


// Lógica de Alternância de Formulário 

// Seleção de elementos principais 
const btnParceiro = document.getElementById("btn-parceiro");
const formHeaderTitulo = document.querySelector(".form-header .title h1");
const inputGroup = document.querySelector(".input-group");
let genderInputs = document.querySelector(".gender-inputs");
const continueButton = document.querySelector(".continue-button");

// Armazena o formulário original para voltar
const formularioOriginal = inputGroup.innerHTML;
const continueOriginal = continueButton.innerHTML;

// CLONAR os elementos de gender para restaurar depois
const genderClone = genderInputs ? genderInputs.cloneNode(true) : null;

// Instância do validador
let validator = new FormValidator();

// Função auxiliar para envolver o input de senha em uma div para o toggle
function wrapPasswordInput(id, placeholder) {
    return `
        <div class="password-wrapper">
            <input id="${id}" type="password" placeholder="${placeholder}" required>
            <button type="button" class="password-toggle">
                <i class='bx bx-hide'></i>
            </button>
        </div>
    `;
}

// Função para montar o formulário de parceiro
function montarFormularioParceiro() {
    formHeaderTitulo.innerText = "Cadastro de Parceiros";

    // Remove o wrapper de senha do formulário original antes de limpar o innerHTML
    const originalPasswordInputs = inputGroup.querySelectorAll('#password, #confirmPassword');
    originalPasswordInputs.forEach(input => {
        const wrapper = input.closest('.password-wrapper');
        if (wrapper) {
            // Move o input para fora do wrapper
            wrapper.parentNode.insertBefore(input, wrapper);
            // Remove o wrapper
            wrapper.remove();
        }
    });

    inputGroup.innerHTML = `
        <section class="input-box">
            <label for="empresa">Nome da Empresa</label>
            <input id="empresa" type="text" placeholder="Digite o nome da sua empresa" required>
        </section>
        <section class="input-box">
            <label for="email">E-mail de Contato</label>
            <input id="email" type="email" placeholder="Digite o e-mail comercial" required>
        </section>
        <section class="input-box">
            <label for="tipoRegistro">Tipo de Registro</label>
            <select id="tipoRegistro" required>
                <option value="">Selecione</option>
                <option value="cpf">Pessoa Física (CPF)</option>
                <option value="cnpj">Pessoa Jurídica (CNPJ)</option>
            </select>
        </section>
        <section class="input-box" id="cpfBox" style="display:none;">
            <label id="cpfLabel" for="cpf">CPF/CNPJ</label>
            <input id="cpf" type="text" placeholder="Digite seu CPF ou CNPJ" required>
        </section>
        <section class="input-box">
            <label for="number">Telefone</label>
            <input id="number" type="tel" placeholder="(xx) xxxxx-xxxx" maxlength="15" required>
        </section>
        <section class="input-box">
            <label for="password">Senha</label>
            ${wrapPasswordInput('password', 'Digite sua senha')}
        </section>
        <section class="input-box">
            <label for="confirmPassword">Confirme sua Senha</label>
            ${wrapPasswordInput('confirmPassword', 'Digite sua senha novamente')}
        </section>
    `;

    // Adiciona o campo de gênero (select) no formulário de parceiro
    const generoPartnerInput = `
        <section class="input-box">
            <label for="generoPartner">Gênero</label>
            <select id="generoPartner" required>
                <option value="">Selecione</option>
                <option value="F">Feminino</option>
                <option value="M">Masculino</option>
                <option value="O">Outros</option>
                <option value="N">Prefiro não dizer</option>
            </select>
        </section>
    `;
    inputGroup.insertAdjacentHTML('beforeend', generoPartnerInput);

    // Esconde a seção de gênero original (radio buttons)
    if (genderInputs) genderInputs.style.display = "none";


    // Atualiza botão de continuar e adiciona botão de voltar
    continueButton.innerHTML = `
        <button type="submit" class="btn-enviar">Enviar Cadastro</button>
        <button type="button" id="btn-voltar" class="btn-enviar" style="margin-top:10px;">Voltar</button>
    `;

    // Seleção dos elementos recém-criados
    const tipoRegistro = document.getElementById("tipoRegistro");
    const cpfBox = document.getElementById("cpfBox");
    const cpfLabel = document.getElementById("cpfLabel");
    const cpfInput = document.getElementById("cpf");

    // Evento para mostrar o campo CPF/CNPJ conforme escolha
    tipoRegistro.addEventListener("change", () => {
        if (tipoRegistro.value === "cpf") {
            cpfBox.style.display = "flex";
            cpfLabel.innerText = "CPF";
            cpfInput.placeholder = "Digite seu CPF";
            cpfInput.value = ""; // Limpa o campo ao mudar o tipo
            validator.validateField('parceiro', cpfInput); // Revalida
        } else if (tipoRegistro.value === "cnpj") {
            cpfBox.style.display = "flex";
            cpfLabel.innerText = "CNPJ";
            cpfInput.placeholder = "Digite seu CNPJ";
            cpfInput.value = ""; // Limpa o campo ao mudar o tipo
            validator.validateField('parceiro', cpfInput); // Revalida
        } else {
            cpfBox.style.display = "none";
        }
    });

    // Botão voltar
    document.getElementById("btn-voltar").addEventListener("click", () => {
        formHeaderTitulo.innerText = "Cadastre-se";
        
        // Remove o campo de gênero adicionado para parceiro
        const generoPartnerElement = document.getElementById("generoPartner") ? document.getElementById("generoPartner").closest('.input-box') : null;
        if (generoPartnerElement) {
            generoPartnerElement.remove();
        }
        
        // Remove o indicador de força da senha do formulário de parceiro, se existir
        const partnerPasswordInput = inputGroup.querySelector('#password');
        if (partnerPasswordInput) {
            const strengthContainer = partnerPasswordInput.closest('.input-box').querySelector('.password-strength-container');
            if (strengthContainer) {
                strengthContainer.remove();
            }
        }

        inputGroup.innerHTML = formularioOriginal;

        // Restaura os genders usando clone
        if (genderClone) {
            const genderNew = genderClone.cloneNode(true);
            genderInputs.replaceWith(genderNew);
            genderInputs = document.querySelector(".gender-inputs");
            genderInputs.style.display = "flex";
        }

        continueButton.innerHTML = continueOriginal;
        
        // Reatribui o evento ao botão parceiro, pois o DOM foi reconstruído
        document.getElementById("btn-parceiro").addEventListener("click", montarFormularioParceiro);
        
        // Re-inicializa os event listeners do validador para o formulário original
        validator.setupEventListeners();
        validator.setupFormSubmission();
        
        // CORREÇÃO: Re-aplica o password wrapper e listeners para o formulário original
        applyPasswordWrapperAndListeners();
        
        // Garante que o indicador de força da senha seja removido no formulário original também (se existir)
        const originalPasswordInput = inputGroup.querySelector('#password');
        if (originalPasswordInput) {
            const strengthContainer = originalPasswordInput.closest('.input-box').querySelector('.password-strength-container');
            if (strengthContainer) {
                strengthContainer.remove();
            }
        }
    });
    
    // Reatribui o evento ao botão parceiro, pois o DOM foi reconstruído
    document.getElementById("btn-parceiro").addEventListener("click", montarFormularioParceiro);
    
    // Re-inicializa os event listeners do validador para o novo formulário
    validator.setupEventListeners();
    validator.setupFormSubmission();
    
    // Garante que o indicador de força da senha seja removido ao alternar para parceiro (se existir)
    const passwordInput = inputGroup.querySelector('#password');
    if (passwordInput) {
        const strengthContainer = passwordInput.closest('.input-box').querySelector('.password-strength-container');
        if (strengthContainer) {
            strengthContainer.remove();
        }
    }
}

// Função que aplica o wrapper de senha e os listeners
function applyPasswordWrapperAndListeners() {
    const passwordInputs = document.querySelectorAll('#password, #confirmPassword');
    passwordInputs.forEach(input => {
        const inputBox = input.closest('.input-box');
        
        // Verifica se o wrapper e o botão já existem no HTML estático (formulário comum)
        if (!inputBox.querySelector('.password-wrapper')) {
            
            // Cria o wrapper e o botão de toggle
            const toggleButton = document.createElement('button');
            toggleButton.type = 'button';
            toggleButton.className = 'password-toggle';
            toggleButton.innerHTML = `<i class='bx bx-hide'></i>`;
            
            const wrapper = document.createElement('section');
            wrapper.className = 'password-wrapper';
            
            // Move o input para dentro do wrapper
            input.parentNode.insertBefore(wrapper, input);
            wrapper.appendChild(input);
            wrapper.appendChild(toggleButton);
            
            // Anexa o listener ao botão recém-criado
            toggleButton.addEventListener('click', () => validator.togglePasswordVisibility(input));
        }
    });
}

// Clique no botão Parceiro monta o formulário
btnParceiro.addEventListener("click", montarFormularioParceiro);

// Inicializa o validador para o formulário de usuário comum no carregamento
validator.setupEventListeners();
validator.setupFormSubmission();

// Aplica o password wrapper e listeners no carregamento inicial
document.addEventListener('DOMContentLoaded', applyPasswordWrapperAndListeners);
