const { body, validationResult } = require("express-validator");
const { suporteModel } = require("../models/suporteModel");

const suporteController = {

    regrasValidacaoSuporte: [
        body("nome")
            .trim()
            .notEmpty()
            .withMessage("O nome completo é obrigatório.")
            .isLength({ min: 3, max: 60 })
            .withMessage("O nome deve ter entre 3 e 60 caracteres."),
        body("email")
            .trim()
            .notEmpty()
            .withMessage("O e-mail é obrigatório.")
            .isEmail()
            .withMessage("Informe um endereço de e-mail válido."),
        body("assunto")
            .trim()
            .notEmpty()
            .withMessage("O assunto é obrigatório.")
            .isIn(["duvida", "tecnico", "ong", "denuncia", "outro"])
            .withMessage("Assunto selecionado inválido."),
        body("mensagem")
            .trim()
            .notEmpty()
            .withMessage("A mensagem não pode estar vazia.")
            .isLength({ min: 15, max: 1000 })
            .withMessage("A mensagem deve conter entre 15 e 1000 caracteres."),
    ],

    enviarSuporte: async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                mensagem: errors.array()[0].msg,
            });
        }

        const { nome, email, assunto, mensagem } = req.body;

        const resultado = await suporteModel.create({ nome, email, assunto, mensagem });
        if (!resultado || resultado instanceof Error) {
            console.error("Erro ao salvar chamado de suporte:", resultado);
            return res.status(500).json({
                mensagem: "Erro interno do servidor ao processar o chamado.",
            });
        }

        return res.status(200).json({ mensagem: "Mensagem enviada com sucesso!" });
    },

    exibirPainelAdm: (req, res) => {
        res.render("pages/painel_adm");
    },

    listarSuporte: async (req, res) => {
        const resultados = await suporteModel.findAll();
        if (!resultados || resultados instanceof Error) {
            console.error("Erro ao buscar chamados no painel ADM:", resultados);
            return res.status(500).json({ erro: "Erro ao ler dados do banco." });
        }
        res.status(200).json(resultados);
    },

};

module.exports = suporteController;
