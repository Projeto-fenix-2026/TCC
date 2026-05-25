var express = require("express");
var router = express.Router();
const path = require("path");
const multer = require("multer");
const { body, validationResult } = require("express-validator");
const { usuarioModel } = require("../models/usuarioModel");
const { ongModel } = require("../models/ongModel");
const { validarCNPJ } = require("../helpers/validacoes");

const storage = multer.diskStorage({
    destination: path.join(__dirname, "../../app/public/uploads/ongs"),
    filename: (req, file, cb) => {
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, unique + path.extname(file.originalname));
    }
});
const upload = multer({ storage, limits: { fileSize: 3 * 1024 * 1024 } });

const validacoesOng = [
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
        .isLength({ max: 500 }).withMessage("Descrição deve ter no máximo 500 caracteres.")
];

router.get("/", (req, res) => {
    res.render("pages/index-adm");
});

router.get("/adm-cliente", async (req, res) => {
    const usuarios = await usuarioModel.findAll();
    res.render("pages/adm-cliente", { usuarios });
});

router.get("/adm-ong", async (req, res) => {
    const ongs = await ongModel.findAll();
    res.render("pages/adm-ong", {
        ongs,
        erro: req.query.erro || null,
        mensagem: req.query.mensagem || null
    });
});

router.post("/adm-ong/cadastrar", upload.single("imagem"), validacoesOng, async (req, res) => {
    const erros = validationResult(req);
    if (!erros.isEmpty()) {
        const msg = erros.array()[0].msg;
        return res.redirect(`/adm/adm-ong?erro=${encodeURIComponent(msg)}`);
    }
    const { nome, email, telefone, cnpj, descricao } = req.body;
    const imagem = req.file ? "/uploads/ongs/" + req.file.filename : null;
    await ongModel.create({ nome, email, telefone, cnpj, descricao, imagem });
    res.redirect("/adm/adm-ong");
});

router.post("/adm-ong/editar", upload.single("imagem"), validacoesOng, async (req, res) => {
    const erros = validationResult(req);
    if (!erros.isEmpty()) {
        const msg = erros.array()[0].msg;
        return res.redirect(`/adm/adm-ong?erro=${encodeURIComponent(msg)}`);
    }
    const { id, nome, email, telefone, cnpj, descricao, imagemAtual } = req.body;
    const imagem = req.file ? "/uploads/ongs/" + req.file.filename : (imagemAtual || null);
    await ongModel.update({ id, nome, email, telefone, cnpj, descricao, imagem });
    res.redirect("/adm/adm-ong");
});

router.post("/adm-ong/excluir", async (req, res) => {
    const { id } = req.body;
    await ongModel.deleteById(id);
    res.redirect("/adm/adm-ong");
});

module.exports = router;
