const { body, validationResult } = require("express-validator");
const { socorroModel } = require("../models/socorroModel");

const socorroController = {

    listarContatos: async (req, res) => {
        const contatos = await socorroModel.findByUsuario(req.session.usuario.id);
        res.json(contatos);
    },

    regrasValidacaoContato: [
        body("nome")
            .trim()
            .isLength({ min: 2, max: 100 })
            .withMessage("Informe um nome com pelo menos 2 caracteres."),
        body("numero")
            .customSanitizer((value) => String(value || "").replace(/\D/g, ""))
            .isLength({ min: 2, max: 20 })
            .withMessage("Informe um número de telefone válido."),
    ],

    criarContato: async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ mensagem: errors.array()[0].msg });
        }

        const resultado = await socorroModel.create({
            id_usuario: req.session.usuario.id,
            nome: req.body.nome.trim(),
            numero: req.body.numero,
            categoria: req.body.categoria ? String(req.body.categoria).trim() : null,
            icone: req.body.icone ? String(req.body.icone).trim() : "phone",
            descricao: req.body.descricao ? String(req.body.descricao).trim() : null,
        });

        if (!resultado.insertId) {
            return res
                .status(500)
                .json({ mensagem: "Erro ao salvar contato. Tente novamente." });
        }

        const contato = await socorroModel.findById(resultado.insertId);
        res.status(201).json(contato);
    },

    excluirContato: async (req, res) => {
        const contato = await socorroModel.findById(req.params.id);
        if (!contato)
            return res.status(404).json({ mensagem: "Contato não encontrado." });
        if (contato.id_usuario !== req.session.usuario.id) {
            return res
                .status(403)
                .json({ mensagem: "Você não pode remover este contato." });
        }
        await socorroModel.deleteById(req.params.id, req.session.usuario.id);
        res.json({ ok: true });
    },

};

module.exports = socorroController;
