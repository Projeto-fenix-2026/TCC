const { localizacaoModel } = require("../models/localizacaoModel");

const localizacaoController = {

    exibirGeolocalizacao: (req, res) => {
        res.render("pages/geolocalizacao");
    },

    salvarLocalizacao: async (req, res) => {
        const { latitude, longitude } = req.body;

        const resultado = await localizacaoModel.create({ latitude, longitude });
        if (!resultado || resultado instanceof Error) {
            console.error("Erro ao salvar localização:", resultado);
            return res.status(500).json({ erro: "Erro interno ao salvar." });
        }

        res.status(200).json({ sucesso: true, id: resultado.insertId });
    },

};

module.exports = localizacaoController;
