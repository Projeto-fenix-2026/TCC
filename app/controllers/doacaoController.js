const { body, validationResult } = require("express-validator");
const { doacaoModel } = require("../models/doacaoModel");

const doacaoController = {

    regrasValidacaoDoacao: [
        body("nome")
            .trim()
            .optional({ checkFalsy: true })
            .isLength({ min: 2, max: 100 })
            .withMessage("O nome deve ter entre 2 e 100 caracteres.")
            .escape(),
        body("email")
            .trim()
            .notEmpty()
            .withMessage("O e-mail é obrigatório.")
            .isEmail()
            .withMessage("Informe um e-mail válido (ex: voce@email.com).")
            .normalizeEmail(),
        body("valor")
            .notEmpty()
            .withMessage("O valor da doação é obrigatório.")
            .isFloat({ min: 5 })
            .withMessage("O valor mínimo para doação é R$ 5,00.")
            .toFloat(),
        body("formaPagamento")
            .notEmpty()
            .withMessage("Selecione uma forma de pagamento.")
            .isIn(["pix", "credito", "boleto"])
            .withMessage("Forma de pagamento inválida."),
    ],

    doar: async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).render("pages/text", {
                errors: errors.array(),
                old: req.body,
                success: false,
            });
        }

        const { nome, email, valor, formaPagamento } = req.body;

        const resultado = await doacaoModel.create({ nome, email, valor, formaPagamento });
        if (!resultado || resultado instanceof Error) {
            console.error("Erro ao salvar doação:", resultado);
            return res.status(500).render("pages/text", {
                errors: [
                    { path: "geral", msg: "Erro interno. Tente novamente em instantes." },
                ],
                old: req.body,
                success: false,
            });
        }

        return res.render("pages/text", {
            errors: [],
            old: {},
            success: true,
        });
    },

};

module.exports = doacaoController;
