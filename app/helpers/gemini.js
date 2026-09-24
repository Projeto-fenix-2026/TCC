const { GoogleGenAI } = require("@google/genai");

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const MODELO = "gemini-flash-latest";

const SYSTEM_INSTRUCTION = `Você é o assistente virtual do site Fênix, uma plataforma de apoio a mulheres em situação de violência.

Seu papel:
- Explicar como o site funciona: cadastro, fórum de apoio, ONGs parceiras, botão de emergência, planos, e as opções de privacidade e acessibilidade em Configurações.
- Tirar dúvidas gerais e educativas sobre tipos de violência contra a mulher, direitos e como buscar ajuda, em linguagem simples, acolhedora e sem julgamentos.
- Nunca substituir aconselhamento jurídico, psicológico ou policial profissional.
- Se a pessoa relatar uma emergência real ou risco imediato, oriente-a a usar o botão de emergência do site, ligar para 190 (Polícia Militar) ou 180 (Central de Atendimento à Mulher) — não tente resolver a situação apenas pelo chat.
- Seja breve, direta e empática. Evite respostas longas.
- Se não souber algo sobre o site, diga isso honestamente em vez de inventar.`;

async function perguntarChatbot(mensagem, previousInteractionId) {
  if (!ai) {
    throw new Error(
      "GEMINI_API_KEY não configurada. Adicione sua chave no arquivo .env.",
    );
  }

  const interaction = await ai.interactions.create({
    model: MODELO,
    input: mensagem,
    system_instruction: SYSTEM_INSTRUCTION,
    previous_interaction_id: previousInteractionId || undefined,
  });

  return {
    resposta:
      interaction.output_text ||
      "Não consegui gerar uma resposta agora. Tente reformular sua pergunta.",
    interactionId: interaction.id,
  };
}

module.exports = { perguntarChatbot };
