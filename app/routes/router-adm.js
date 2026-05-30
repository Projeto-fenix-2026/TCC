var express = require("express");
var router = express.Router();
const path = require("path");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const { usuarioModel } = require("../models/usuarioModel");
const { ongModel } = require("../models/ongModel");
const { validarCNPJ } = require("../helpers/validacoes");
const { autenticadoAdm } = require("../helpers/autenticadoAdm");

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

// ── LOGIN ADMIN ──────────────────────────────────────────────────
router.get("/login", (req, res) => {
    if (req.session.admin) return res.redirect("/adm");
    res.render("pages/login-adm", { erro: null });
});

router.post("/login", async (req, res) => {
    const { email, senha } = req.body;
    const usuario = await usuarioModel.findByEmail(email);
    if (!usuario || !usuario.is_admin) {
        return res.render("pages/login-adm", { erro: "E-mail ou senha incorretos." });
    }
    const senhaCorreta = bcrypt.compareSync(senha, usuario.senha);
    if (!senhaCorreta) {
        return res.render("pages/login-adm", { erro: "E-mail ou senha incorretos." });
    }
    req.session.admin = { id: usuario.id_usuario, nome: usuario.nome, email: usuario.email };
    res.redirect("/adm");
});

router.get("/logout", (req, res) => {
    req.session.admin = null;
    res.redirect("/adm/login");
});

// ── ROTAS PROTEGIDAS ─────────────────────────────────────────────
router.get("/", autenticadoAdm, async (req, res) => {
    const usuarios = await usuarioModel.findAll();
    const ongs = await ongModel.findAll();
    const totalUsuarios = usuarios.length;
    const totalOngs = ongs.length;
    const semFoto = usuarios.filter(u => !u.foto_url).length;
    const recentes = [...usuarios].reverse().slice(0, 5);
    res.render("pages/index-adm", { totalUsuarios, totalOngs, semFoto, recentes });
});

router.get("/adm-cliente", autenticadoAdm, async (req, res) => {
    const usuarios = await usuarioModel.findAll();
    res.render("pages/adm-cliente", { usuarios });
});

router.get("/adm-ong", autenticadoAdm, async (req, res) => {
    const ongs = await ongModel.findAll();
    res.render("pages/adm-ong", {
        ongs,
        erro: req.query.erro || null,
        mensagem: req.query.mensagem || null
    });
});

router.post("/adm-ong/cadastrar", autenticadoAdm, upload.single("imagem"), validacoesOng, async (req, res) => {
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

router.post("/adm-ong/editar", autenticadoAdm, upload.single("imagem"), validacoesOng, async (req, res) => {
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

router.post("/adm-ong/excluir", autenticadoAdm, async (req, res) => {
    const { id } = req.body;
    await ongModel.deleteById(id);
    res.redirect("/adm/adm-ong");
});

module.exports = router;
