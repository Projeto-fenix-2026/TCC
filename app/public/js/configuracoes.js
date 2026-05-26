function mudarAba(nomeAba) {
  document
    .querySelectorAll(".aba-link")
    .forEach((link) => link.classList.remove("ativa"));
  document
    .querySelectorAll(".secao-config")
    .forEach((secao) => secao.classList.remove("ativa"));

  event.target.classList.add("ativa");
  document.getElementById(`secao-${nomeAba}`).classList.add("ativa");
}

document
  .getElementById("form-suporte")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const assunto = document.getElementById("sup-assunto").value.trim();
    const mensagem = document.getElementById("sup-mensagem").value.trim();

    if (assunto.length < 5 || mensagem.length < 15) {
      alert("Por favor, preencha os campos com descrições mais detalhadas.");
      return;
    }

    try {
      const response = await fetch("/api/suporte/chamado", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assunto, mensagem }),
      });

      if (response.ok) {
        alert(
          "Chamado aberto com sucesso! Nossa equipe técnica analisará o caso.",
        );
        this.reset();
      } else {
        alert("Houve um erro ao enviar o chamado. Tente novamente mais tarde.");
      }
    } catch (err) {
      console.error("Erro na comunicação com o servidor de suporte:", err);
      alert("Erro de conexão. Verifique sua internet.");
    }
  });

async function limparHistoricoBanco() {
  if (
    !confirm(
      "Tem certeza de que deseja apagar TODO o seu histórico de localização do banco de dados? Esta ação é irreversível.",
    )
  ) {
    return;
  }

  try {
    const response = await fetch("/api/usuario/limpar-historico", {
      method: "DELETE",
    });

    if (response.ok) {
      alert("Histórico de localização apagado com sucesso do banco de dados.");
    } else {
      alert(
        "Não foi possível excluir os dados. Entre em contato com o suporte.",
      );
    }
  } catch (err) {
    console.error("Erro ao solicitar limpeza de dados:", err);
  }
}

async function excluirContaTotal() {
  if (
    !confirm(
      "ATENÇÃO: Deseja realmente excluir sua conta e todos os dados vinculados ao Projeto Fênix? Seus contatos de segurança também serão removidos.",
    )
  ) {
    return;
  }

  try {
    const response = await fetch("/api/usuario/excluir-conta", {
      method: "DELETE",
    });

    if (response.ok) {
      localStorage.removeItem("fenix_contatos");
      alert(
        "Sua conta e dados foram completamente removidos de nossos sistemas.",
      );
      window.location.href = "/";
    } else {
      alert("Erro ao processar exclusão nos servidores.");
    }
  } catch (err) {
    console.error("Erro na exclusão da conta:", err);
  }
}
