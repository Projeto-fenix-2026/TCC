let ultimaLatitude = "";
let ultimaLongitude = "";
let enderecoFormatado = "Carregando endereço aproximado...";
let contatosSalvos = JSON.parse(localStorage.getItem("fenix_contatos")) || [];

// Função disparada ao iniciar o carregamento da página
function iniciarRastreamento() {
  const status = document.getElementById("status-texto");
  const mapaIframe = document.getElementById("mapa-google");

  // Renderiza os contatos já armazenados anteriormente
  renderizarContatos();

  if (!navigator.geolocation) {
    status.textContent = "Geolocalização não é suportada pelo seu navegador.";
    return;
  }

  navigator.geolocation.watchPosition(
    (position) => {
      ultimaLatitude = position.coords.latitude;
      ultimaLongitude = position.coords.longitude;

      status.textContent = "Rastreamento Contínuo Ativo • Proteção Ligada";
      status.style.color = "#85e3b2";

      // Link Dinâmico corrigido para renderizar o iframe nativo com as coordenadas
      mapaIframe.src = `https://maps.google.com/maps?q=${ultimaLatitude},${ultimaLongitude}&z=16&output=embed`;

      // Faz a tradução reversa para achar Nome de Rua, Bairro e Cidade
      obterEnderecoHumano(ultimaLatitude, ultimaLongitude);

      // Sincroniza com sua tabela de histórico no banco de dados MySQL
      salvarNoBanco(ultimaLatitude, ultimaLongitude);
    },
    (error) => {
      console.error(error);
      status.textContent =
        "Acesso à localização negado. Ative a permissão para sua segurança.";
      status.style.color = "#ff7675";
    },
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 10000,
    },
  );
}

// Consome a API Nominatim (OpenStreetMap) de forma gratuita para obter a Geocodificação Reversa
async function obterEnderecoHumano(lat, lng) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
    );
    const data = await response.json();

    if (data && data.address) {
      const rua = data.address.road || "Rua não localizada";

      // SUBSTITUIÇÃO: Trata a falta do número exato do lote de forma elegante para o TCC
      const numero =
        data.address.house_number || "Aproximado (Ver link do mapa)";

      const bairro =
        data.address.suburb ||
        data.address.neighbourhood ||
        "Bairro não identificado";
      const cidade =
        data.address.city || data.address.town || "Cidade não identificada";

      enderecoFormatado = `${rua}, ${numero} - ${bairro}, ${cidade}`;

      const elementoEndereco = document.getElementById("endereco-atual");
      if (elementoEndereco) {
        elementoEndereco.textContent = enderecoFormatado;
      }
    }
  } catch (error) {
    console.error("Erro ao traduzir coordenadas:", error);
    enderecoFormatado =
      "Endereço indisponível (Coordenadas de latitude/longitude anexadas)";
  }
}

// Gerenciador do Formulário de Contatos
document
  .getElementById("form-cadastro-contato")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const nome = document.getElementById("cad-nome").value.trim();
    const parentesco = document.getElementById("cad-parentesco").value;
    let celular = document
      .getElementById("cad-celular")
      .value.replace(/\D/g, ""); // Remove traços e parênteses

    // Garante o código do país (55) caso o usuário não digite
    if (celular.length === 11) {
      celular = "55" + celular;
    }

    const novoContato = { nome, parentesco, celular };

    contatosSalvos.push(novoContato);
    localStorage.setItem("fenix_contatos", JSON.stringify(contatosSalvos));

    this.reset();
    renderizarContatos();
  });

// Renderiza os contatos em tela gerando novos cards dinamicamente
function renderizarContatos() {
  const container = document.getElementById("lista-contatos-container");

  // Limpa o container mantendo apenas a Polícia (190) fixa no topo
  container.innerHTML = `
    <article class="card-contato emergência">
      <h3>Central de Polícia (190)</h3>
      <p>Vínculo: Segurança Pública (Ligação Direta)</p>
      <button class="btn-emergencia" onclick="enviarAlerta('190')">
        Discar 190
      </button>
    </article>
  `;

  // Laço que injeta os cartões criados pelo usuário
  contatosSalvos.forEach((contato, index) => {
    const artigo = document.createElement("article");
    artigo.className = "card-contato";
    artigo.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <h3>${contato.nome} (${contato.parentesco})</h3>
        <button onclick="removerContato(${index})" style="background:none; border:none; color:#ff7675; cursor:pointer; font-size:0.8rem;">Remover</button>
      </div>
      <p>Celular: +${contato.celular}</p>
      <button class="btn-alerta" onclick="enviarAlerta('${contato.celular}')">
        Acionar Guardião via WhatsApp
      </button>
    `;
    container.appendChild(artigo);
  });
}

// Remove o contato caso tenha cadastrado errado
function removerContato(index) {
  contatosSalvos.splice(index, 1);
  localStorage.setItem("fenix_contatos", JSON.stringify(contatosSalvos));
  renderizarContatos();
}

// Envia dados brutos ao MySQL em segundo plano
async function salvarNoBanco(lat, lng) {
  try {
    await fetch("/api/salvar-localizacao", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ latitude: lat, longitude: lng }),
    });
  } catch (err) {
    console.error("Erro ao persistir localização no banco:", err);
  }
}

// Dispara o alerta enviando a mensagem e o link estruturado
function enviarAlerta(numero) {
  if (!ultimaLatitude || !ultimaLongitude) {
    alert(
      "Aguardando coordenadas do GPS de alta precisão. Tente novamente em instantes.",
    );
    return;
  }

  // Cria o texto dinâmico incluindo o endereço interpretado por extenso
  const mensagemTextual = `🚨 *ALERTA DE EMERGÊNCIA - PROJETO FÊNIX*\n\nPreciso de ajuda urgente! Minha localização atualizada é:\n📍 *Endereço:* ${enderecoFormatado}\n\n🗺️ *Link do Mapa:* https://maps.google.com/?q=${ultimaLatitude},${ultimaLongitude}`;

  const mensagem = encodeURIComponent(mensagemTextual);

  if (numero === "190") {
    window.location.href = `tel:${numero}`;
  } else {
    window.open(
      `https://api.whatsapp.com/send?phone=${numero}&text=${mensagem}`,
      "_blank",
    );
  }
}

window.onload = iniciarRastreamento;
