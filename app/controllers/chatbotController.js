const { perguntarChatbot } = require("../helpers/gemini");

const chatbotController = {

    enviarMensagem: async (req, res) => {
        const mensagem = (req.body.mensagem || "").toString().trim();

        if (!mensagem) {
            return res.status(400).json({ erro: "Digite uma mensagem." });
        }
        if (mensagem.length > 1000) {
            return res.status(400).json({ erro: "Mensagem muito longa (máx. 1000 caracteres)." });
        }

        try {
            const { resposta, interactionId } = await perguntarChatbot(
                mensagem,
                req.session.chatInteractionId,
            );
            req.session.chatInteractionId = interactionId;
            res.json({ resposta });
        } catch (error) {
            console.error("Erro no chatbot:", error);
            res.status(500).json({
                erro:
                    "Não consegui falar com a IA agora. Se você está em perigo, use o botão de emergência no topo da página.",
            });
        }
    },

    limparConversa: (req, res) => {
        req.session.chatInteractionId = null;
        res.json({ ok: true });
    },

};

module.exports = chatbotController;
