const { body, validationResult } = require("express-validator");
const { ongModel } = require("../models/ongModel");
const { validarCNPJ } = require("../helpers/validacoes");

const ongController = {

    // ── PÁGINAS/API PÚBLICAS ─────────────────────────────────────
    exibirOngs: (req, res) => {
        res.render("pages/ongs");
    },

    dadosOngs: async (req, res) => {
        const ongs = await ongModel.findAll();
        res.json(ongs);
    },

    exibirOng: async (req, res) => {
        const ong = await ongModel.findById(req.query.id);
        if (!ong) return res.redirect("/ongs");
        res.render("pages/ong_page", { ong });
    },

    // Serve a foto da ONG direto do banco (imagem_dados) — não do disco,
    // que no Render é apagado a cada reinício/deploy.
    imagem: async (req, res) => {
        const dados = await ongModel.findImagem(req.params.id);
        if (!dados || !dados.imagem_dados) {
            return res.status(404).end();
        }
        res.set("Content-Type", dados.imagem_mime || "image/jpeg");
        res.set("Cache-Control", "private, max-age=86400");
        res.send(dados.imagem_dados);
    },

    // ── ADMINISTRAÇÃO (painel /adm) ──────────────────────────────
    regrasValidacaoOng: [
        body("nome").trim().notEmpty().withMessage("Nome é obrigatório.")
            .isLength({ max: 50 }).withMessage("Nome deve ter no máximo 50 caracteres."),
        body("email").trim().notEmpty().withMessage("E-mail é obrigatório.")
            .isEmail().withMessage("E-mail inválido."),
        body("telefone").trim().notEmpty().withMessage("Telefone é obrigatório.")
            .matches(/^\d{11}$/).withMessage("Telefone deve ter exatamente 11 dígitos numéricos."),
        body("cnpj").trim().notEmpty().withMessage("CNPJ é obrigatório.")
            .matches(/^\d{14}$/).withMessage("CNPJ deve ter exatamente 14 dígitos numéricos.")
            .custom(v => { if (!validarCNPJ(v)) throw new Error("CNPJ inválido."); return true; }),
        body("descricao").optional({ checkFalsy: true })
            .isLength({ max: 500 }).withMessage("Descrição deve ter no máximo 500 caracteres."),
    ],

    exibirAdmOngs: async (req, res) => {
        const ongs = await ongModel.findAll();
        res.render("pages/adm-ong", {
            ongs,
            erro: req.query.erro || null,
            mensagem: req.query.mensagem || null,
            admin: req.session.admin,
        });
    },

    cadastrarOng: async (req, res) => {
        const erros = validationResult(req);
        if (!erros.isEmpty()) {
            const msg = erros.array()[0].msg;
            return res.redirect(`/adm/adm-ong?erro=${encodeURIComponent(msg)}`);
        }
        const { nome, email, telefone, cnpj, descricao } = req.body;
        await ongModel.create({
            nome, email, telefone, cnpj, descricao,
            imagemBuffer: req.file ? req.file.buffer : null,
            imagemMime: req.file ? req.file.mimetype : null,
        });
        res.redirect("/adm/adm-ong");
    },

    editarOng: async (req, res) => {
        const erros = validationResult(req);
        if (!erros.isEmpty()) {
            const msg = erros.array()[0].msg;
            return res.redirect(`/adm/adm-ong?erro=${encodeURIComponent(msg)}`);
        }
        const { id, nome, email, telefone, cnpj, descricao } = req.body;
        await ongModel.update({
            id, nome, email, telefone, cnpj, descricao,
            imagemBuffer: req.file ? req.file.buffer : null,
            imagemMime: req.file ? req.file.mimetype : null,
        });
        res.redirect("/adm/adm-ong");
    },

    excluirOng: async (req, res) => {
        const { id } = req.body;
        await ongModel.deleteById(id);
        res.redirect("/adm/adm-ong");
    },

};

module.exports = ongController;
