let ultimaLatitude = "";
let ultimaLongitude = "";

// Função para iniciar o rastreamento assim que entrar no site
function iniciarRastreamento() {
  const status = document.getElementById("status-texto");
  const mapaIframe = document.getElementById("mapa-google");

  if (!navigator.geolocation) {
    status.textContent = "Geolocalização não é suportada pelo seu navegador.";
    return;
  }

  // watchPosition monitora a localização continuamente enquanto a aba estiver aberta
  navigator.geolocation.watchPosition(
    (position) => {
      ultimaLatitude = position.coords.latitude;
      ultimaLongitude = position.coords.longitude;

      status.textContent = "Rastreamento Contínuo Ativo • Proteção Ligada";
      status.style.color = "#85e3b2"; // Verde para seguro

      // Atualiza o mapa do Google de forma dinâmica e gratuita usando o Embed API
      mapaIframe.src = `https://maps.google.com/maps?q=${ultimaLatitude},${ultimaLongitude}&z=16&output=embed`;

      // Envia a localização em segundo plano para o banco de dados MySQL
      salvarNoBanco(ultimaLatitude, ultimaLongitude);
    },
    (error) => {
      console.error(error);
      status.textContent =
        "Acesso à localização negado. Ative a permissão para sua segurança.";
      status.style.color = "#ff7675"; // Vermelho para erro
    },
    {
      enableHighAccuracy: true, // Força o GPS do celular a buscar a precisão máxima
      maximumAge: 0,
      timeout: 10000,
    },
  );
}

// Envia as coordenadas para salvar no histórico do MySQL
async function salvarNoBanco(lat, lng) {
  try {
    await fetch("/api/salvar-localizacao", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ latitude: lat, longitude: lng }),
    });
  } catch (err) {
    console.error("Falha ao sincronizar com o banco de dados:", err);
  }
}

// Dispara o alerta para o número de telefone
function enviarAlerta(numero) {
  if (!ultimaLatitude || !ultimaLongitude) {
    alert("Aguardando coordenadas do GPS. Tente novamente em instantes.");
    return;
  }

  // Cria a mensagem de SOS formatada com o link exato do mapa
  const mensagem = encodeURIComponent(
    `🚨 *ALERTA DE EMERGÊNCIA - PROJETO FÊNIX*\n\nPreciso de ajuda urgente! Minha localização atualizada em tempo real é:\nhttps://maps.google.com/?q=${ultimaLatitude},${ultimaLongitude}`,
  );

  if (numero === "190") {
    // Discar direto no celular se for número de emergência pública
    window.location.href = `tel:${numero}`;
  } else {
    // Redireciona para o WhatsApp com o texto pronto e o link do Google Maps para os números móveis
    window.open(
      `https://api.whatsapp.com/send?phone=${numero}&text=${mensagem}`,
      "_blank",
    );
  }
}

// Executa a geolocalização imediatamente ao abrir a página
window.onload = iniciarRastreamento;
