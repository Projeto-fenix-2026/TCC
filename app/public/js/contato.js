const API_ENDPOINT = "/api/suporte";

const DOM = {
  form: document.getElementById("formSuporte"),
  txtMensagem: document.getElementById("supMensagem"),
  charCount: document.getElementById("charCount"),
  btnSubmit: document.getElementById("btnEnviarSuporte"),
  toast: document.getElementById("toast"),
  faqTriggers: document.querySelectorAll(".faq-trigger"),

  // Mapeamento dos inputs e pequenos elementos de texto auxiliares
  nome: document.getElementById("supNome"),
  email: document.getElementById("supEmail"),
  assunto: document.getElementById("supAssunto"),
  msgNome: document.getElementById("msgNome"),
  msgEmail: document.getElementById("msgEmail"),
  msgAssunto: document.getElementById("msgAssunto"),
  msgMensagem: document.getElementById("msgMensagem"),
};

// Funções para gerenciar o estado visual dinâmico dos campos
function definirErro(input, elementoTexto, instrucao) {
  const pai = input.parentElement;
  pai.classList.remove("success");
  pai.classList.add("error");
  elementoTexto.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> ${instrucao}`;
}

function definirSucesso(input, elementoTexto) {
  const pai = input.parentElement;
  pai.classList.remove("error");
  pai.classList.add("success");
  elementoTexto.innerHTML = `<i class="fa-solid fa-circle-check"></i> Pronto! Tudo certo.`;
}

function exibirAlerta(mensagem, tipo = "success", tempo = 3500) {
  DOM.toast.textContent = mensagem;
  DOM.toast.className = `toast-alert ${tipo} show`;
  setTimeout(() => {
    DOM.toast.className = "toast-alert";
  }, tempo);
}

// Contador de caracteres em tempo real
DOM.txtMensagem.addEventListener("input", () => {
  const comprimento = DOM.txtMensagem.value.length;
  DOM.charCount.textContent = Math.min(comprimento, 1000);
});

// Accordion do FAQ
DOM.faqTriggers.forEach((gatilho) => {
  gatilho.addEventListener("click", () => {
    const itemPai = gatilho.parentElement;
    const estaAberto = itemPai.classList.contains("open");

    document.querySelectorAll(".faq-item").forEach((item) => {
      item.classList.remove("open");
      item.querySelector(".faq-trigger").setAttribute("aria-expanded", "false");
    });

    if (!estaAberto) {
      itemPai.classList.add("open");
      gatilho.setAttribute("aria-expanded", "true");
    }
  });
});

const eEmailValido = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Processamento de submissão com feedback visual detalhado
DOM.form.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  let validacaoOk = true;

  const dadosForm = {
    nome: DOM.nome.value.trim(),
    email: DOM.email.value.trim(),
    assunto: DOM.assunto.value,
    mensagem: DOM.txtMensagem.value.trim(),
  };

  // 1. Validação Visual do Nome
  if (dadosForm.nome.length < 3) {
    definirErro(
      DOM.nome,
      DOM.msgNome,
      "O nome inserido está muito curto. Digite pelo menos 3 caracteres.",
    );
    validacaoOk = false;
  } else if (dadosForm.nome.length > 60) {
    definirErro(
      DOM.nome,
      DOM.msgNome,
      "O limite máximo é de 60 caracteres. Reduza o nome.",
    );
    validacaoOk = false;
  } else {
    definirSucesso(DOM.nome, DOM.msgNome);
  }

  // 2. Validação Visual do E-mail
  if (!dadosForm.email) {
    definirErro(
      DOM.email,
      DOM.msgEmail,
      "O e-mail é obrigatório para podermos te responder.",
    );
    validacaoOk = false;
  } else if (!eEmailValido(dadosForm.email)) {
    definirErro(
      DOM.email,
      DOM.msgEmail,
      "Formato inválido. Certifique-se de incluir o '@' e o provedor (Ex: .com).",
    );
    validacaoOk = false;
  } else {
    definirSucesso(DOM.email, DOM.msgEmail);
  }

  // 3. Validação Visual do Assunto
  if (!dadosForm.assunto) {
    definirErro(
      DOM.assunto,
      DOM.msgAssunto,
      "Selecione uma categoria na lista para direcionar sua mensagem.",
    );
    validacaoOk = false;
  } else {
    definirSucesso(DOM.assunto, DOM.msgAssunto);
  }

  // 4. Validação Visual da Mensagem
  if (dadosForm.mensagem.length < 15) {
    definirErro(
      DOM.txtMensagem,
      DOM.msgMensagem,
      `Escreva uma mensagem detalhada. Digite no mínimo mais ${15 - dadosForm.mensagem.length} caracteres.`,
    );
    validacaoOk = false;
  } else {
    definirSucesso(DOM.txtMensagem, DOM.msgMensagem);
  }

  // Interrompe o envio se houver pendências visuais
  if (!validacaoOk) {
    exibirAlerta("Por favor, corrija os erros marcados em vermelho.", "error");
    return;
  }

  DOM.btnSubmit.disabled = true;
  DOM.btnSubmit.innerHTML =
    '<i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i> Processando envio...';

  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
      body: JSON.stringify(dadosForm),
    });

    if (response.ok) {
      exibirAlerta("Formulário enviado com sucesso! Aguarde nosso contato.");
      DOM.form.reset();
      DOM.charCount.textContent = "0";

      // Limpa os estilos de sucesso após a limpeza do formulário
      document
        .querySelectorAll(".form-field")
        .forEach((el) => el.classList.remove("success"));
      document
        .querySelectorAll(".validator-msg")
        .forEach((el) => (el.innerHTML = ""));
    } else {
      const respostaErro = await response.json().catch(() => ({}));
      exibirAlerta(
        respostaErro.mensagem ||
          "Houve um erro no servidor ao registrar o chamado.",
        "error",
      );
    }
  } catch (erroConexao) {
    exibirAlerta(
      "Falha crítica de rede. Verifique sua conexão com a internet.",
      "error",
    );
  } finally {
    DOM.btnSubmit.disabled = false;
    DOM.btnSubmit.innerHTML =
      '<i class="fa-solid fa-paper-plane" aria-hidden="true"></i> Enviar Mensagem';
  }
});

if (localStorage.getItem("theme") === "dark")
  document.body.classList.add("dark");
if (localStorage.getItem("highContrast") === "true")
  document.body.classList.add("high-contrast");
